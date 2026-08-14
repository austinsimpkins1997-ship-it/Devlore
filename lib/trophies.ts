// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Weekly trophies
//
// Awarded automatically by the Monday cron for the week that just ended.
// Winners are chosen deterministically from verified data, and the
// @@unique([kind, weekKey]) constraint on Trophy makes every award idempotent:
// if the cron fires twice, the second attempt is a no-op.
// ─────────────────────────────────────────────────────────────────────────────

import { Prisma, type TrophyKind } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { awardXpWithLoot } from '@/lib/equipment';
import { isoWeekKey, startOfIsoWeek } from '@/lib/quests/period';

interface TrophySpec {
  kind: TrophyKind;
  title: string;
  description: (weekKey: string) => string;
  bonusXp: number;
  cardRarity: 'LEGENDARY' | 'EPIC';
}

const TROPHY_SPECS: Record<TrophyKind, TrophySpec> = {
  BEST_SUBMISSION: {
    kind: 'BEST_SUBMISSION',
    title: "Champion's Quill",
    description: (weekKey) => `Best Forge submission of week ${weekKey}`,
    bonusXp: 250,
    cardRarity: 'LEGENDARY',
  },
  MOST_XP: {
    kind: 'MOST_XP',
    title: 'Relentless Flame',
    description: (weekKey) => `Most Forge XP earned in week ${weekKey}`,
    bonusXp: 150,
    cardRarity: 'EPIC',
  },
  LONGEST_STREAK: {
    kind: 'LONGEST_STREAK',
    title: 'Unbroken Chain',
    description: (weekKey) => `Longest commit streak among active heroes in week ${weekKey}`,
    bonusXp: 150,
    cardRarity: 'EPIC',
  },
};

export interface WeeklyTrophyReport {
  weekKey: string;
  awarded: Array<{ kind: TrophyKind; userId: string; username: string | null }>;
  skipped: Array<{ kind: TrophyKind; reason: string }>;
}

async function awardTrophy(
  spec: TrophySpec,
  weekKey: string,
  userId: string,
  forgeEntryId: string | null,
): Promise<'awarded' | 'already_awarded'> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { xp: true, level: true },
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.trophy.create({
        data: {
          userId,
          kind: spec.kind,
          weekKey,
          title: spec.title,
          description: spec.description(weekKey),
          forgeEntryId,
        },
      });
      await awardXpWithLoot(tx, userId, user.xp, user.level, spec.bonusXp);
      await tx.loreCard.create({
        data: {
          userId,
          cardType: 'ACHIEVEMENT',
          rarity: spec.cardRarity,
          name: spec.title,
          flavorText: `The realm bore witness: ${spec.description(weekKey)}. Such deeds are carved into legend.`,
          milestone: spec.description(weekKey),
          xpValue: spec.bonusXp,
        },
      });
    });
    return 'awarded';
  } catch (err) {
    // P2002 = unique constraint violation → this week's trophy already exists.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return 'already_awarded';
    }
    throw err;
  }
}

/**
 * Awards the three weekly trophies for the ISO week that ended before `now`.
 * Intended to run from the Monday cron; safe to call repeatedly.
 */
export async function awardWeeklyTrophies(now: Date = new Date()): Promise<WeeklyTrophyReport> {
  const thisWeekStart = startOfIsoWeek(now);
  const prevWeekStart = new Date(thisWeekStart);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);
  const weekKey = isoWeekKey(prevWeekStart);

  const report: WeeklyTrophyReport = { weekKey, awarded: [], skipped: [] };

  const weekWindow = { gte: prevWeekStart, lt: thisWeekStart };

  // ── Best submission: highest-XP forge entry (ties → longer, then earlier) ──
  const bestEntry = await prisma.forgeEntry.findFirst({
    where: { createdAt: weekWindow },
    orderBy: [{ xpEarned: 'desc' }, { wordCount: 'desc' }, { createdAt: 'asc' }],
    select: { id: true, userId: true, user: { select: { username: true } } },
  });

  // ── Most forge XP: summed per user over the week ───────────────────────────
  const xpTotals = await prisma.forgeEntry.groupBy({
    by: ['userId'],
    where: { createdAt: weekWindow },
    _sum: { xpEarned: true },
    orderBy: [{ _sum: { xpEarned: 'desc' } }, { userId: 'asc' }],
    take: 1,
  });

  // ── Longest streak among heroes active in the Forge that week ─────────────
  const activeUserIds = (
    await prisma.forgeEntry.findMany({
      where: { createdAt: weekWindow },
      select: { userId: true },
      distinct: ['userId'],
    })
  ).map((e) => e.userId);
  const streakLeader = activeUserIds.length
    ? await prisma.user.findFirst({
        where: { id: { in: activeUserIds }, currentStreak: { gt: 0 } },
        orderBy: [{ currentStreak: 'desc' }, { id: 'asc' }],
        select: { id: true, username: true },
      })
    : null;

  const candidates: Array<{
    spec: TrophySpec;
    userId: string | null;
    username: string | null;
    forgeEntryId: string | null;
  }> = [
    {
      spec: TROPHY_SPECS.BEST_SUBMISSION,
      userId: bestEntry?.userId ?? null,
      username: bestEntry?.user.username ?? null,
      forgeEntryId: bestEntry?.id ?? null,
    },
    {
      spec: TROPHY_SPECS.MOST_XP,
      userId: xpTotals[0]?.userId ?? null,
      username: null,
      forgeEntryId: null,
    },
    {
      spec: TROPHY_SPECS.LONGEST_STREAK,
      userId: streakLeader?.id ?? null,
      username: streakLeader?.username ?? null,
      forgeEntryId: null,
    },
  ];

  for (const candidate of candidates) {
    if (!candidate.userId) {
      report.skipped.push({ kind: candidate.spec.kind, reason: 'no eligible submissions' });
      continue;
    }
    try {
      const outcome = await awardTrophy(
        candidate.spec,
        weekKey,
        candidate.userId,
        candidate.forgeEntryId,
      );
      if (outcome === 'awarded') {
        report.awarded.push({
          kind: candidate.spec.kind,
          userId: candidate.userId,
          username: candidate.username,
        });
      } else {
        report.skipped.push({ kind: candidate.spec.kind, reason: 'already awarded for this week' });
      }
    } catch (err) {
      report.skipped.push({ kind: candidate.spec.kind, reason: `error: ${String(err)}` });
    }
  }

  return report;
}
