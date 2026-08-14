import { redirect } from 'next/navigation';
import crypto from 'crypto';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SettingsClient } from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings — DEVLORE',
  description: 'Manage your account, membership, and public codex.',
};

export const dynamic = 'force-dynamic';

/**
 * Settings is a SERVER component.
 *
 * The previous version was a client component calling useSession() from
 * next-auth/react. This app has no <SessionProvider> - it was removed in
 * commit cf2bf3a when sign-in moved to a Server Action - so useSession() threw
 * on render and the whole page died with "a client-side exception has
 * occurred". Reading the session on the server removes that failure mode
 * entirely and also means no settings round-trip on load.
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; plan?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const params = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      heroClass: true,
      heroTitle: true,
      level: true,
      xp: true,
      tier: true,
      isPublic: true,
      emailChronicle: true,
      webhookToken: true,
      createdAt: true,
      lastAnalyzedAt: true,
      trialEndsAt: true,
      subCurrentPeriodEnd: true,
      stripeCustomerId: true,
      totalCommits: true,
      currentStreak: true,
      longestStreak: true,
      languageCount: true,
      charCreated: true,
      accounts: {
        where: { provider: 'github' },
        select: { provider: true, providerAccountId: true, scope: true },
        take: 1,
      },
      _count: { select: { chapters: true, loreCards: true, equipment: true, trophies: true } },
    },
  });

  if (!user) redirect('/sign-in');

  // Ensure a webhook token exists. Derived deterministically on first view so
  // an existing user does not get a different token on every page load.
  let webhookToken = user.webhookToken;
  if (!webhookToken) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET ?? 'devlore-local-secret';
    webhookToken = crypto.createHmac('sha256', secret).update(session.user.id).digest('hex');
    await prisma.user.update({
      where: { id: session.user.id },
      data: { webhookToken },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://devloreapp.vercel.app';

  return (
    <SettingsClient
      appUrl={appUrl}
      checkoutStatus={params.checkout ?? null}
      requestedPlan={params.plan ?? null}
      user={{
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        heroClass: user.heroClass,
        heroTitle: user.heroTitle,
        level: user.level,
        xp: user.xp,
        tier: user.tier,
        isPublic: user.isPublic,
        emailChronicle: user.emailChronicle,
        webhookToken,
        createdAt: user.createdAt.toISOString(),
        lastAnalyzedAt: user.lastAnalyzedAt ? user.lastAnalyzedAt.toISOString() : null,
        trialEndsAt: user.trialEndsAt ? user.trialEndsAt.toISOString() : null,
        subCurrentPeriodEnd: user.subCurrentPeriodEnd
          ? user.subCurrentPeriodEnd.toISOString()
          : null,
        hasBillingAccount: Boolean(user.stripeCustomerId),
        githubConnected: user.accounts.length > 0,
        githubScope: user.accounts[0]?.scope ?? null,
        githubAccountId: user.accounts[0]?.providerAccountId ?? null,
        totalCommits: user.totalCommits,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        languageCount: user.languageCount,
        charCreated: user.charCreated,
        chapterCount: user._count.chapters,
        loreCardCount: user._count.loreCards,
        equipmentCount: user._count.equipment,
        trophyCount: user._count.trophies,
      }}
    />
  );
}
