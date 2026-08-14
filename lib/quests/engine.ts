// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Quest engine
//
// Computes verified quest progress from the database and handles claims
// inside a transaction so XP can never be double-claimed (replay-safe via
// the QuestProgress unique constraint + claimedAt check).
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma';
import { awardXpWithLoot, type EquipmentDrop } from '@/lib/equipment';
import type { Tier } from '@/types';
import {
  QUESTS,
  getQuestBySlug,
  type QuestCadence,
  type QuestContext,
  type QuestDefinition,
  type QuestDifficulty,
} from './definitions';
import { ALL_TIME_KEY, dayKey, isoWeekKey, startOfIsoWeek, startOfUtcDay } from './period';

export interface QuestBoardItem {
  slug: string;
  title: string;
  description: string;
  icon: string;
  cadence: QuestCadence;
  difficulty: QuestDifficulty;
  target: number;
  /** XP this user would earn (includes Legend multiplier). */
  xpReward: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  /** True when the quest needs a higher tier to claim. */
  lockedForTier: boolean;
  requiresTier: 'PRO' | 'LEGEND' | null;
}

export interface QuestBoard {
  quests: QuestBoardItem[];
  claimableXp: number;
  tier: Tier;
}

export type ClaimResult =
  | {
      ok: true;
      xpAwarded: number;
      newXp: number;
      newLevel: number;
      leveledUp: boolean;
      drops: EquipmentDrop[];
    }
  | { ok: false; reason: 'unknown_quest' | 'incomplete' | 'already_claimed' | 'tier_required' };

/** Legend heroes earn 1.5× XP from quests — a concrete paid-tier perk. */
const LEGEND_QUEST_XP_MULTIPLIER = 1.5;

function periodKeyFor(cadence: QuestCadence, now: Date): string {
  if (cadence === 'DAILY') return dayKey(now);
  if (cadence === 'WEEKLY') return isoWeekKey(now);
  return ALL_TIME_KEY;
}

function tierCanClaim(tier: Tier, def: QuestDefinition): boolean {
  if (!def.requiresTier) return true;
  if (def.requiresTier === 'PRO') return tier === 'PRO' || tier === 'LEGEND';
  return tier === 'LEGEND';
}

function questXpForTier(tier: Tier, def: QuestDefinition): number {
  return tier === 'LEGEND'
    ? Math.round(def.xpReward * LEGEND_QUEST_XP_MULTIPLIER)
    : def.xpReward;
}

export async function buildQuestContext(userId: string, now: Date = new Date()): Promise<QuestContext> {
  const todayStart = startOfUtcDay(now);
  const weekStart = startOfIsoWeek(now);

  const [user, chaptersCount, loreCardsCount, weekEntries] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, totalCommits: true },
    }),
    prisma.chapter.count({ where: { userId } }),
    prisma.loreCard.count({ where: { userId } }),
    prisma.forgeEntry.findMany({
      where: { userId, createdAt: { gte: weekStart } },
      select: { wordCount: true, category: true, createdAt: true },
    }),
  ]);

  const todayEntries = weekEntries.filter((e) => e.createdAt >= todayStart);
  const maxWords = (entries: { wordCount: number }[]) =>
    entries.reduce((max, e) => Math.max(max, e.wordCount), 0);

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    totalCommits: user.totalCommits,
    chaptersCount,
    loreCardsCount,
    forgeToday: { count: todayEntries.length, maxWords: maxWords(todayEntries) },
    forgeWeek: {
      count: weekEntries.length,
      maxWords: maxWords(weekEntries),
      categoryCount: new Set(weekEntries.map((e) => e.category)).size,
    },
  };
}

export async function getQuestBoard(userId: string, now: Date = new Date()): Promise<QuestBoard> {
  const [user, ctx, claims] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { tier: true } }),
    buildQuestContext(userId, now),
    prisma.questProgress.findMany({
      where: {
        userId,
        periodKey: { in: [dayKey(now), isoWeekKey(now), ALL_TIME_KEY] },
        claimedAt: { not: null },
      },
      select: { questSlug: true, periodKey: true },
    }),
  ]);

  const tier = user.tier as Tier;
  const claimedSet = new Set(claims.map((c) => `${c.questSlug}:${c.periodKey}`));

  const quests: QuestBoardItem[] = QUESTS.map((def) => {
    const periodKey = periodKeyFor(def.cadence, now);
    const progress = Math.min(def.target, Math.max(0, def.progress(ctx)));
    const completed = progress >= def.target;
    const claimed = claimedSet.has(`${def.slug}:${periodKey}`);
    return {
      slug: def.slug,
      title: def.title,
      description: def.description,
      icon: def.icon,
      cadence: def.cadence,
      difficulty: def.difficulty,
      target: def.target,
      xpReward: questXpForTier(tier, def),
      progress,
      completed,
      claimed,
      lockedForTier: !tierCanClaim(tier, def),
      requiresTier: def.requiresTier ?? null,
    };
  });

  const claimableXp = quests
    .filter((q) => q.completed && !q.claimed && !q.lockedForTier)
    .reduce((sum, q) => sum + q.xpReward, 0);

  return { quests, claimableXp, tier };
}

export async function claimQuest(userId: string, slug: string, now: Date = new Date()): Promise<ClaimResult> {
  const def = getQuestBySlug(slug);
  if (!def) return { ok: false, reason: 'unknown_quest' };

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { tier: true, xp: true, level: true },
  });
  const tier = user.tier as Tier;
  if (!tierCanClaim(tier, def)) return { ok: false, reason: 'tier_required' };

  // Recompute progress from verified data — never trust the client.
  const ctx = await buildQuestContext(userId, now);
  const progress = def.progress(ctx);
  if (progress < def.target) return { ok: false, reason: 'incomplete' };

  const periodKey = periodKeyFor(def.cadence, now);
  const xpAwarded = questXpForTier(tier, def);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.questProgress.findUnique({
        where: { userId_questSlug_periodKey: { userId, questSlug: def.slug, periodKey } },
        select: { id: true, claimedAt: true },
      });
      if (existing?.claimedAt) return null;

      await tx.questProgress.upsert({
        where: { userId_questSlug_periodKey: { userId, questSlug: def.slug, periodKey } },
        create: {
          userId,
          questSlug: def.slug,
          periodKey,
          progress,
          target: def.target,
          completedAt: now,
          claimedAt: now,
          xpAwarded,
        },
        update: { progress, completedAt: now, claimedAt: now, xpAwarded },
      });

      return awardXpWithLoot(tx, userId, user.xp, user.level, xpAwarded);
    });

    if (!result) return { ok: false, reason: 'already_claimed' };
    return {
      ok: true,
      xpAwarded,
      newXp: result.newXp,
      newLevel: result.newLevel,
      leveledUp: result.leveledUp,
      drops: result.drops,
    };
  } catch {
    // Unique-constraint race (double click / replay) — treat as already claimed.
    return { ok: false, reason: 'already_claimed' };
  }
}
