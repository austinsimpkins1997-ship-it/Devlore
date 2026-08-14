import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getWeeklyContributions } from '@/lib/github/contributions';
import { generateWeeklyChapter } from '@/lib/narrative/generator';
import { getHeroClassBySlug } from '@/lib/narrative/hero-class';
import { getLevel } from '@/lib/narrative/xp';
import type { HeroClassSlug, NarrativeInput } from '@/types';

/**
 * POST /api/github/generate-chapter
 * Generates a saga chapter from the past 7 days of GitHub activity.
 * Requires heroClass to be set (analysis must have run first).
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const sessionToken = session.accessToken as string | undefined;
  let accessToken = sessionToken;
  if (!accessToken) {
    const account = await prisma.account.findFirst({
      where: { userId, provider: 'github' },
      select: { access_token: true },
    });
    accessToken = account?.access_token ?? undefined;
  }

  if (!accessToken) {
    return NextResponse.json(
      { error: 'No GitHub access token. Please sign out and sign in again.' },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      displayName: true,
      heroClass: true,
      heroTitle: true,
      heroClassSlug: true,
      level: true,
      xp: true,
      currentStreak: true,
      longestStreak: true,
      topLanguages: true,
      firstCommitDate: true,
      tier: true,
    },
  });

  if (!user?.heroClass || !user.username) {
    return NextResponse.json(
      { error: 'Complete your profile analysis first before generating chapters.' },
      { status: 400 },
    );
  }

  // 6-hour cooldown between manual chapter generations
  const lastChapter = await prisma.chapter.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, number: true, summary: true },
  });

  if (lastChapter) {
    const hoursSince = (Date.now() - lastChapter.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 6) {
      const minsLeft = Math.ceil((6 - hoursSince) * 60);
      return NextResponse.json(
        { error: `A chapter was just written. The next one can be forged in ${minsLeft} minutes.` },
        { status: 429 },
      );
    }
  }

  // Fetch the past 7 days of GitHub activity
  const weekEnd = new Date();
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekStart.getDate() - 7);

  const weekData = await getWeeklyContributions(accessToken, user.username, weekStart, weekEnd);

  if (weekData.totalCommits === 0) {
    return NextResponse.json(
      { error: 'No commits found in the last 7 days. Your saga needs deeds to chronicle.' },
      { status: 400 },
    );
  }

  const chapterNumber = lastChapter ? lastChapter.number + 1 : 1;
  const heroSlug = (user.heroClassSlug ?? 'arcane-architect') as HeroClassSlug;
  const hero = getHeroClassBySlug(heroSlug);

  const input: NarrativeInput = {
    user: {
      username: user.username,
      displayName: user.displayName || user.username,
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
    week: weekData,
    chapterNumber,
    previousChapterSummary: lastChapter?.summary ?? null,
  };

  const chapter = await generateWeeklyChapter(input);

  // Save chapter + lore cards + update XP atomically
  await prisma.$transaction(async (tx) => {
    await tx.chapter.create({
      data: {
        userId,
        number: chapterNumber,
        title: chapter.title,
        content: chapter.content,
        summary: chapter.summary,
        weekStart,
        weekEnd,
        commitCount: weekData.totalCommits,
        prsMerged: weekData.mergedPRs,
        bugsFixed: weekData.closedIssues,
        languages: weekData.languages,
        newRepos: weekData.newRepos,
        xpEarned: chapter.xpEarned,
      },
    });

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

    const newXp = user.xp + chapter.xpEarned;
    const newLevel = getLevel(newXp);
    await tx.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    });
  });

  return NextResponse.json({
    success: true,
    chapterNumber,
    title: chapter.title,
    xpEarned: chapter.xpEarned,
    newCardsCount: chapter.newCards.length,
  });
}
