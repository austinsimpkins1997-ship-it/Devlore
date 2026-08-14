import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getRelationship } from '@/lib/social';

export const runtime = 'nodejs';

const PAGE_SIZE = 24;

/**
 * GET /api/heroes?q=...&sort=xp|level|streak&page=0
 * Searchable directory of public hero profiles. When signed in, each row
 * includes the viewer's relationship so the UI can render the right action.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().slice(0, 64) ?? '';
  const sort = searchParams.get('sort') ?? 'xp';
  const page = Math.max(0, Math.min(200, Number(searchParams.get('page') ?? 0) || 0));

  const orderBy =
    sort === 'level'
      ? [{ level: 'desc' as const }, { xp: 'desc' as const }]
      : sort === 'streak'
        ? [{ longestStreak: 'desc' as const }, { xp: 'desc' as const }]
        : [{ xp: 'desc' as const }, { username: 'asc' as const }];

  const where = {
    isPublic: true,
    username: { not: null },
    heroClass: { not: null },
    ...(q
      ? {
          OR: [
            { username: { contains: q, mode: 'insensitive' as const } },
            { displayName: { contains: q, mode: 'insensitive' as const } },
            { heroClass: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  try {
    const [total, heroes] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          heroClass: true,
          heroTitle: true,
          level: true,
          xp: true,
          longestStreak: true,
          totalCommits: true,
          tier: true,
          _count: { select: { trophies: true } },
        },
      }),
    ]);

    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    const rows = await Promise.all(
      heroes.map(async (h) => ({
        username: h.username,
        displayName: h.displayName,
        avatarUrl: h.avatarUrl,
        heroClass: h.heroClass,
        heroTitle: h.heroTitle,
        level: h.level,
        xp: h.xp,
        longestStreak: h.longestStreak,
        totalCommits: h.totalCommits,
        tier: h.tier,
        trophyCount: h._count.trophies,
        relationship: viewerId ? await getRelationship(viewerId, h.id) : null,
      })),
    );

    return NextResponse.json({
      heroes: rows,
      total,
      page,
      pageSize: PAGE_SIZE,
      hasMore: (page + 1) * PAGE_SIZE < total,
    });
  } catch (error) {
    console.error('[api/heroes] Failed:', error);
    return NextResponse.json({ error: 'Failed to load heroes' }, { status: 500 });
  }
}
