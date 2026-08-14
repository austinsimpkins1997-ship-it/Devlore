import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { syncUserGitHubStats } from '@/lib/github/sync';
import { RATE_LIMITS } from '@/lib/constants';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/account/sync
 * Re-reads the user's GitHub stats and refreshes the cached values on their
 * account. Distinct from /api/github/analyze, which also regenerates the AI
 * origin story and hero class - this is the cheap "just refresh my numbers"
 * path exposed in Settings.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastAnalyzedAt: true,
        tier: true,
        accounts: {
          where: { provider: 'github' },
          select: { access_token: true },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Free accounts get a cooldown; paid tiers sync on demand.
    if (user.tier === 'FREE' && user.lastAnalyzedAt) {
      const elapsed = Date.now() - user.lastAnalyzedAt.getTime();
      const cooldown = RATE_LIMITS.MANUAL_ANALYSIS_COOLDOWN_MS;
      if (elapsed < cooldown) {
        const minutes = Math.ceil((cooldown - elapsed) / 60000);
        return NextResponse.json(
          {
            error: `Sync is on cooldown. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}, or upgrade for on-demand syncing.`,
            retryInMinutes: minutes,
          },
          { status: 429 },
        );
      }
    }

    const accessToken = user.accounts[0]?.access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No GitHub token on file. Sign out and sign back in to reconnect GitHub.' },
        { status: 400 },
      );
    }

    const stats = await syncUserGitHubStats(userId, accessToken);

    return NextResponse.json({
      ok: true,
      syncedAt: new Date().toISOString(),
      stats: {
        totalCommits: stats.totalCommits,
        totalRepos: stats.totalRepos,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        languageCount: stats.languageCount,
      },
    });
  } catch (error) {
    console.error('[api/account/sync] Failed:', error);
    const message =
      error instanceof Error && /bad credentials|401/i.test(error.message)
        ? 'GitHub rejected the stored token. Sign out and sign back in to reconnect.'
        : 'Sync failed. Please try again shortly.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
