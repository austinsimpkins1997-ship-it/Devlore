import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — DEVLORE',
  description: 'Your personal developer saga.',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      chapters: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      loreCards: {
        orderBy: { unlockedAt: 'desc' },
      },
    },
  });

  if (!user) redirect('/sign-in');

  const canGenerateChapter =
    user.heroClass !== null &&
    (user.tier === 'PRO' || user.tier === 'LEGEND' || user.chapters.length === 0);

  const hasHeroClass = user.heroClass !== null;

  // Serialize dates for the client
  const serializedUser = {
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    heroClass: user.heroClass,
    heroTitle: user.heroTitle,
    heroClassSlug: user.heroClassSlug,
    level: user.level,
    xp: user.xp,
    tier: user.tier,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    totalCommits: user.totalCommits,
    firstCommitDate: user.firstCommitDate,
    originStory: user.originStory,
    chapters: user.chapters.map((c) => ({
      id: c.id,
      number: c.number,
      title: c.title,
      summary: c.summary,
      weekStart: c.weekStart.toISOString(),
      weekEnd: c.weekEnd.toISOString(),
      commitCount: c.commitCount,
      xpEarned: c.xpEarned,
      createdAt: c.createdAt.toISOString(),
    })),
    loreCards: user.loreCards.map((lc) => ({
      id: lc.id,
      cardType: lc.cardType,
      rarity: lc.rarity,
      name: lc.name,
      flavorText: lc.flavorText,
      milestone: lc.milestone,
      xpValue: lc.xpValue,
      unlockedAt: lc.unlockedAt.toISOString(),
    })),
  };

  return (
    <DashboardClient
      user={serializedUser}
      canGenerateChapter={canGenerateChapter}
      hasHeroClass={hasHeroClass}
    />
  );
}
