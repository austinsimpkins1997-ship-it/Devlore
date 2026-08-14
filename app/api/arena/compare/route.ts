import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export interface ArenaFighter {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  heroClass: string | null;
  level: number;
  xp: number;
  totalCommits: number;
  longestStreak: number;
  topLanguage: string | null;
  trophyCount: number;
  gearPower: number;
  bestItem: string | null;
  score: number;
}

/**
 * Battle score — deterministic and fully derived from verified stats:
 * XP + (commits × 2) + (streak × 50) + (level × 100) + (trophies × 500) + gear power
 */
function battleScore(f: Omit<ArenaFighter, 'score'>): number {
  return (
    f.xp +
    f.totalCommits * 2 +
    f.longestStreak * 50 +
    f.level * 100 +
    f.trophyCount * 500 +
    f.gearPower
  );
}

async function loadFighter(username: string): Promise<ArenaFighter | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true, username: true, displayName: true, avatarUrl: true,
      heroClass: true, level: true, xp: true, totalCommits: true,
      longestStreak: true, topLanguages: true, isPublic: true,
      _count: { select: { trophies: true } },
    },
  });
  if (!user || !user.isPublic || !user.username) return null;

  const langs = (user.topLanguages as Record<string, number> | null) ?? {};
  const topLanguage =
    Object.entries(langs).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const [gearAgg, bestGear] = await Promise.all([
    prisma.equipment.aggregate({ where: { userId: user.id }, _sum: { power: true } }),
    prisma.equipment.findFirst({
      where: { userId: user.id },
      orderBy: [{ power: 'desc' }, { awardedAt: 'asc' }],
      select: { name: true },
    }),
  ]);

  const base = {
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    heroClass: user.heroClass,
    level: user.level,
    xp: user.xp,
    totalCommits: user.totalCommits,
    longestStreak: user.longestStreak,
    topLanguage,
    trophyCount: user._count.trophies,
    gearPower: gearAgg._sum.power ?? 0,
    bestItem: bestGear?.name ?? null,
  };
  return { ...base, score: battleScore(base) };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const a = searchParams.get('a')?.trim() ?? '';
  const b = searchParams.get('b')?.trim() ?? '';

  if (!a || !b || a.length > 64 || b.length > 64) {
    return NextResponse.json({ error: 'Provide two usernames (a, b)' }, { status: 400 });
  }
  if (a.toLowerCase() === b.toLowerCase()) {
    return NextResponse.json({ error: 'A hero cannot battle their own reflection' }, { status: 400 });
  }

  try {
    const [fighterA, fighterB] = await Promise.all([loadFighter(a), loadFighter(b)]);

    const missing: string[] = [];
    if (!fighterA) missing.push(a);
    if (!fighterB) missing.push(b);
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `${missing.join(' and ')} ${missing.length === 1 ? 'has' : 'have'} not joined DevLore (or their codex is private). Only heroes of the realm may enter the Arena.`,
        },
        { status: 404 },
      );
    }

    const winner =
      fighterA!.score === fighterB!.score
        ? null
        : fighterA!.score > fighterB!.score
          ? fighterA!.username
          : fighterB!.username;

    return NextResponse.json({ fighterA, fighterB, winner });
  } catch (error) {
    console.error('[api/arena/compare] Failed:', error);
    return NextResponse.json({ error: 'The Arena grounds trembled. Try again.' }, { status: 500 });
  }
}
