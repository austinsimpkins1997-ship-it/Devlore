import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { syncUserGitHubStats } from '@/lib/github/sync';
import { generateOriginStory } from '@/lib/narrative/generator';
import { buildFallbackOriginStory } from '@/lib/narrative/fallback';
import { assignHeroClass } from '@/lib/narrative/hero-class';
import { getLevel } from '@/lib/narrative/xp';
import { rollEquipmentForLevel } from '@/lib/equipment';
import { RATE_LIMITS, XP_RATES, MILESTONE_TRIGGERS } from '@/lib/constants';

/** Analyses stuck in PENDING/RUNNING longer than this are considered dead. */
const STALE_ANALYSIS_MS = 10 * 60 * 1000;

/**
 * POST /api/github/analyze
 * Runs the full GitHub analysis pipeline synchronously.
 * Backfills XP from commit history and creates starter lore cards.
 */
export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Release stale locks first — a dev-server restart or crash mid-analysis
    // must never block re-analysis forever.
    await prisma.analysis.updateMany({
      where: {
        userId,
        status: { in: ['PENDING', 'RUNNING'] },
        startedAt: { lt: new Date(Date.now() - STALE_ANALYSIS_MS) },
      },
      data: { status: 'FAILED', completedAt: new Date(), error: 'Stale — marked failed by watchdog' },
    });

    // Check for a genuinely in-progress analysis
    const existingAnalysis = await prisma.analysis.findFirst({
      where: { userId, status: { in: ['PENDING', 'RUNNING'] } },
    });
    if (existingAnalysis) {
      return NextResponse.json(
        { error: 'An analysis is already in progress. Your legend is being written...' },
        { status: 429 },
      );
    }

    // Skip rate limit for first-time users (no heroClass yet)
    const userCurrent = await prisma.user.findUnique({
      where: { id: userId },
      select: { heroClass: true },
    });

    if (userCurrent?.heroClass) {
      const lastAnalysis = await prisma.analysis.findFirst({
        where: { userId, status: 'COMPLETE' },
        orderBy: { completedAt: 'desc' },
      });
      if (
        lastAnalysis?.completedAt &&
        Date.now() - lastAnalysis.completedAt.getTime() < RATE_LIMITS.MANUAL_ANALYSIS_COOLDOWN_MS
      ) {
        const retryAfterMins = Math.ceil(
          (RATE_LIMITS.MANUAL_ANALYSIS_COOLDOWN_MS -
            (Date.now() - lastAnalysis.completedAt.getTime())) /
            60000,
        );
        return NextResponse.json(
          { error: `Your legend is still resonating. Try again in ${retryAfterMins} minutes.` },
          { status: 429 },
        );
      }
    }

    // Get GitHub access token — session JWT (freshest), Account table as fallback
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
        { error: 'GitHub access token not found. Please sign out and sign in again.' },
        { status: 400 },
      );
    }

    // Record analysis start
    const analysis = await prisma.analysis.create({
      data: { userId, status: 'RUNNING', triggeredBy: 'manual' },
    });

    try {
      // Step 1: Sync GitHub stats
      const stats = await syncUserGitHubStats(userId, accessToken);

      // Step 2: Assign hero class
      const hc = assignHeroClass({
        topLang: Object.keys(stats.topLanguages)[0] ?? 'JavaScript',
        languageCount: stats.languageCount,
        nightCommitRatio: stats.nightCommitRatio,
        docCommitRatio: stats.docCommitRatio,
        avgRepoSize: stats.avgRepoSize,
        hasInfraRepos: stats.hasInfraRepos,
        openSourceContribCount: stats.openSourceContribCount,
      });

      await prisma.user.update({
        where: { id: userId },
        data: { heroClass: hc.name, heroTitle: hc.title, heroClassSlug: hc.slug },
      });

      // Step 3: Backfill XP from total commit history
      // Base: 5 XP per commit, cap at 10,000 XP to prevent runaway levels
      const historicalXp = Math.min(stats.totalCommits * XP_RATES.PER_COMMIT, 10000);
      // Bonus for longestStreak milestones
      const streakBonus = MILESTONE_TRIGGERS.STREAK_DAYS.filter(
        (d) => d <= stats.longestStreak,
      ).length * 50;
      const initialXp = historicalXp + streakBonus;
      const initialLevel = getLevel(initialXp);

      await prisma.user.update({
        where: { id: userId },
        data: { xp: initialXp, level: initialLevel },
      });

      // Equipment drops for every level earned in the backfill
      // (idempotent — @@unique([userId, levelAwarded]) + skipDuplicates)
      if (initialLevel > 1) {
        const drops = [];
        for (let lvl = 2; lvl <= initialLevel; lvl++) {
          drops.push(rollEquipmentForLevel(userId, lvl));
        }
        await prisma.equipment.createMany({
          data: drops.map((d) => ({
            userId,
            slot: d.slot,
            rarity: d.rarity,
            name: d.name,
            flavorText: d.flavorText,
            power: d.power,
            levelAwarded: d.levelAwarded,
          })),
          skipDuplicates: true,
        });
      }

      // Step 4: Generate origin story — AI first, deterministic fallback if
      // the AI is unavailable so analysis always completes.
      let originStory: string;
      try {
        const originResult = await generateOriginStory(stats);
        originStory = originResult.originStory;
      } catch (aiError) {
        console.error('[analyze] AI origin story unavailable, using fallback:', aiError);
        originStory = buildFallbackOriginStory(stats, hc.name, hc.title);
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          originStory,
          heroClass: hc.name,
          heroTitle: hc.title,
          heroClassSlug: hc.slug,
          lastAnalyzedAt: new Date(),
        },
      });

      // Step 5: Create milestone lore cards based on real stats
      const existingCards = await prisma.loreCard.count({ where: { userId } });
      if (existingCards === 0) {
        type CardInput = {
          userId: string;
          cardType: 'ACHIEVEMENT' | 'CLASS_EVOLUTION' | 'STREAK' | 'LANGUAGE' | 'PROJECT' | 'COLLABORATION';
          rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
          name: string;
          flavorText: string;
          milestone: string;
          xpValue: number;
        };
        const cardsToCreate: CardInput[] = [
          // Always: The Awakening (joined DevLore)
          {
            userId,
            cardType: 'ACHIEVEMENT' as const,
            rarity: 'COMMON' as const,
            name: 'The Awakening',
            flavorText:
              'You felt the pull of the arcane. The moment a hero hears the call, the world shifts to meet them.',
            milestone: 'Joined DevLore',
            xpValue: 10,
          },
          // Always: Class card
          {
            userId,
            cardType: 'CLASS_EVOLUTION' as const,
            rarity: 'UNCOMMON' as const,
            name: hc.name,
            flavorText: `The ${hc.name} emerges from the mist. ${hc.title} — a title earned in fire and focus.`,
            milestone: 'Hero class assigned',
            xpValue: 25,
          },
          // Always: Rune Carver (first analysis)
          {
            userId,
            cardType: 'ACHIEVEMENT' as const,
            rarity: 'COMMON' as const,
            name: 'Rune Carver',
            flavorText:
              'Every legend begins with a single incantation etched into stone. Yours is now written.',
            milestone: 'First analysis complete',
            xpValue: 10,
          },
        ];

        // Milestone commit cards
        for (const threshold of MILESTONE_TRIGGERS.COMMITS) {
          if (stats.totalCommits >= threshold) {
            const rarity: CardInput['rarity'] = threshold >= 1000 ? 'EPIC' : threshold >= 250 ? 'RARE' : threshold >= 50 ? 'UNCOMMON' : 'COMMON';
            cardsToCreate.push({
              userId,
              cardType: 'ACHIEVEMENT' as const,
              rarity,
              name: threshold >= 1000 ? 'The Thousand' : threshold >= 250 ? 'Relentless Inscriber' : threshold >= 50 ? 'First Forays' : 'Spark of Creation',
              flavorText: `${threshold.toLocaleString()} incantations cast into the void. Each one a stone in the foundation of legend.`,
              milestone: `${threshold.toLocaleString()} commits reached`,
              xpValue: threshold >= 1000 ? 100 : threshold >= 250 ? 50 : threshold >= 50 ? 25 : 10,
            });
          }
        }

        // Milestone streak cards
        for (const streakDay of MILESTONE_TRIGGERS.STREAK_DAYS) {
          if (stats.longestStreak >= streakDay) {
            const rarity: CardInput['rarity'] = streakDay >= 100 ? 'LEGENDARY' : streakDay >= 30 ? 'EPIC' : streakDay >= 14 ? 'RARE' : streakDay >= 7 ? 'UNCOMMON' : 'COMMON';
            cardsToCreate.push({
              userId,
              cardType: 'STREAK' as const,
              rarity,
              name: streakDay >= 100 ? 'The Eternal Vigil' : streakDay >= 30 ? 'Unyielding' : streakDay >= 14 ? 'Two Week Crusade' : streakDay >= 7 ? 'Week of Fire' : 'First Vigil',
              flavorText: `${streakDay} consecutive sunrises of creation. The forge never cooled. The will never wavered.`,
              milestone: `${streakDay}-day streak achieved`,
              xpValue: streakDay >= 100 ? 250 : streakDay >= 30 ? 100 : streakDay >= 14 ? 50 : streakDay >= 7 ? 25 : 10,
            });
          }
        }

        // Top language card
        const topLang = Object.keys(stats.topLanguages)[0];
        if (topLang) {
          cardsToCreate.push({
            userId,
            cardType: 'LANGUAGE' as const,
            rarity: 'UNCOMMON' as const,
            name: `${topLang} Adept`,
            flavorText: `The ${topLang} school of magic flows through their hands as naturally as breath. A true practitioner of the craft.`,
            milestone: `Primary language: ${topLang}`,
            xpValue: 25,
          });
        }

        await prisma.loreCard.createMany({ data: cardsToCreate, skipDuplicates: true });
      }

      // Step 6: Mark analysis complete
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: 'COMPLETE', completedAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        heroClass: hc.name,
        xp: initialXp,
        level: initialLevel,
      });
    } catch (innerErr) {
      console.error('[analyze] inner error:', innerErr);
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: 'FAILED', completedAt: new Date(), error: String(innerErr) },
      });
      throw innerErr;
    }
  } catch (error) {
    console.error('[api/github/analyze] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed. Check server logs.' },
      { status: 500 },
    );
  }
}
