import { inngest } from '../client';
import { getWeeklyContributions } from '@/lib/github/contributions';
import { buildNarrativeInput } from '@/lib/github/analyzer';
import { generateWeeklyChapter } from '@/lib/narrative/generator';
import { prisma } from '@/lib/prisma';
import { getHeroClassBySlug } from '@/lib/narrative/hero-class';
import type { HeroClassSlug } from '@/types';
import { awardXpWithLoot } from '@/lib/equipment';

export const generateChapter = inngest.createFunction(
  { id: 'generate-chapter', retries: 3 },
  { event: 'devlore/chapter.generate' },
  async ({ event, step }) => {
    const { userId, accessToken, weekStart, weekEnd } = event.data as {
      userId: string;
      accessToken: string;
      weekStart: string;
      weekEnd: string;
    };

    // Step 1: Fetch user data
    const user = await step.run('fetch-user', async () => {
      return await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          displayName: true,
          heroClass: true,
          heroTitle: true,
          heroClassSlug: true,
          level: true,
          xp: true,
          firstCommitDate: true,
          currentStreak: true,
          longestStreak: true,
          topLanguages: true,
          emailChronicle: true,
          tier: true,
          email: true,
        },
      });
    });

    // Step 2: Fetch week's contribution data
    const weekData = await step.run('fetch-week-data', async () => {
      return await getWeeklyContributions(
        accessToken,
        user.username ?? '',
        new Date(weekStart),
        new Date(weekEnd),
      );
    });

    // Step 3: Build narrative input
    const input = await step.run('build-narrative-input', async () => {
      const prevChapter = await prisma.chapter.findFirst({
        where: { userId },
        orderBy: { number: 'desc' },
        select: { number: true, summary: true },
      });

      const chapterNumber = prevChapter ? prevChapter.number + 1 : 1;
      const heroSlug = (user.heroClassSlug ?? 'arcane-architect') as HeroClassSlug;
      const hero = getHeroClassBySlug(heroSlug);

      return buildNarrativeInput(
        {
          username: user.username ?? '',
          displayName: user.displayName ?? user.username ?? '',
          heroClass: hero.name,
          heroTitle: hero.title,
          heroClassSlug: heroSlug,
          level: user.level,
          xp: user.xp,
          firstCommitDate: user.firstCommitDate ? String(user.firstCommitDate) : null,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          topLanguages: (user.topLanguages as Record<string, number>) ?? {},
        },
        weekData,
        chapterNumber,
        prevChapter?.summary ?? null,
      );
    });

    // Step 4: Generate chapter with AI
    const chapter = await step.run('generate-with-ai', async () => {
      return await generateWeeklyChapter(input);
    });

    // Step 5: Save chapter + lore cards + update XP atomically
    await step.run('save-chapter', async () => {
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekEnd);

      await prisma.$transaction(async (tx) => {
        // Create the chapter
        await tx.chapter.create({
          data: {
            userId,
            number: input.chapterNumber,
            title: chapter.title,
            content: chapter.content,
            summary: chapter.summary,
            weekStart: weekStartDate,
            weekEnd: weekEndDate,
            commitCount: weekData.totalCommits,
            prsMerged: weekData.mergedPRs,
            bugsFixed: weekData.closedIssues,
            languages: weekData.languages,
            newRepos: weekData.newRepos,
            xpEarned: chapter.xpEarned,
          },
        });

        // Create lore cards from this chapter
        if (chapter.newCards.length > 0) {
          await tx.loreCard.createMany({
            data: chapter.newCards.map((c) => ({
              userId,
              cardType: c.cardType,
              rarity: c.rarity,
              name: c.name,
              flavorText: c.flavorText,
              milestone: c.milestone,
              xpValue: c.xpValue,
            })),
          });
        }

        // Update user XP and level — drops equipment for levels gained
        await awardXpWithLoot(tx, userId, user.xp, user.level, chapter.xpEarned);
      });
    });

    // Step 6: Send Chronicle email (Pro/Legend only, non-blocking)
    await step.run('send-chronicle-email', async () => {
      if (
        !user.email ||
        !user.emailChronicle ||
        (user.tier !== 'PRO' && user.tier !== 'LEGEND')
      ) {
        return { skipped: true };
      }

      if (!process.env.RESEND_API_KEY) {
        return { skipped: true, reason: 'No RESEND_API_KEY configured' };
      }

      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://devlore.app';
        const chapterUrl = `${appUrl}/dashboard/chapters`;

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'DevLore <chronicles@devlore.app>',
          to: user.email,
          subject: `📜 Chapter ${input.chapterNumber}: ${chapter.title}`,
          text: `${chapter.title}\n\n${chapter.summary}\n\nRead your full chronicle: ${chapterUrl}`,
          // TODO: Replace with ChronicleEmail React template for rich HTML
          html: `
            <div style="background:#07070f;color:#e8e8f0;font-family:'Georgia',serif;max-width:600px;margin:0 auto;padding:40px 20px;">
              <h1 style="color:#c9a84c;font-size:1.1rem;letter-spacing:3px;margin-bottom:8px;">DEVLORE — THE CHRONICLES</h1>
              <h2 style="color:#e8e8f0;font-size:1.8rem;margin-bottom:4px;">${chapter.title}</h2>
              <p style="color:#7a5e1f;font-style:italic;margin-bottom:24px;">Chapter ${input.chapterNumber} of the Ongoing Saga</p>
              <hr style="border-color:#1e1e3f;margin:24px 0;"/>
              <p style="color:#a0a0c0;font-style:italic;margin-bottom:24px;">${chapter.summary}</p>
              <p style="color:#e8e8f0;line-height:1.7;">${chapter.content.slice(0, 400)}...</p>
              <div style="text-align:center;margin-top:40px;">
                <a href="${chapterUrl}" style="background:#c9a84c;color:#07070f;padding:12px 28px;text-decoration:none;font-weight:bold;border-radius:4px;">Read Your Full Chronicle →</a>
              </div>
              <hr style="border-color:#1e1e3f;margin:40px 0 20px;"/>
              <p style="color:#5a5a80;font-size:0.75rem;text-align:center;">Your legend, delivered every Monday. <a href="${appUrl}/dashboard/settings" style="color:#7a5e1f;">Manage email preferences</a></p>
            </div>
          `,
        });

        return { sent: true };
      } catch (err) {
        console.error('[generate-chapter] Email send failed:', err);
        return { sent: false, error: String(err) };
      }
    });

    return {
      success: true,
      chapterNumber: input.chapterNumber,
      chapterTitle: chapter.title,
      xpEarned: chapter.xpEarned,
      newCardsCount: chapter.newCards.length,
    };
  },
);
