import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/marketing/Navbar';
import { startOfIsoWeek } from '@/lib/quests/period';
import styles from './leaderboard.module.css';

export const metadata: Metadata = {
  title: 'Leaderboard — DEVLORE',
  description: 'The mightiest heroes of the realm, ranked by XP, streaks, and weekly deeds.',
};

// Always render fresh from the database (never at build time).
export const dynamic = 'force-dynamic';

interface RankedUser {
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  heroClass: string | null;
  tier: string;
  value: string;
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

function TierChip({ tier }: { tier: string }) {
  if (tier === 'PRO') return <span className={`${styles.tierChip} ${styles.tierPro}`}>PRO</span>;
  if (tier === 'LEGEND') return <span className={`${styles.tierChip} ${styles.tierLegend}`}>LEGEND</span>;
  return null;
}

function BoardRow({ user, rank }: { user: RankedUser; rank: number }) {
  const medal = RANK_MEDALS[rank - 1];
  return (
    <Link href={`/u/${user.username}`} className={styles.row}>
      <span className={`${styles.rank} ${medal ? styles.rankTop : ''}`}>{medal ?? rank}</span>
      {user.avatarUrl ? (
        <Image src={user.avatarUrl} alt={user.displayName} width={36} height={36} className={styles.avatar} />
      ) : (
        <span className={styles.avatarFallback}>{user.displayName.charAt(0)}</span>
      )}
      <span className={styles.userBlock}>
        <span className={styles.userName}>
          {user.displayName}
          <TierChip tier={user.tier} />
        </span>
        <span className={styles.userClass}>{user.heroClass ?? 'Unclassed'}</span>
      </span>
      <span className={styles.value}>{user.value}</span>
    </Link>
  );
}

function Board({ title, users, emptyText }: { title: string; users: RankedUser[]; emptyText: string }) {
  return (
    <div className={styles.board}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {users.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        users.map((user, i) => <BoardRow key={user.username ?? i} user={user} rank={i + 1} />)
      )}
    </div>
  );
}

const TROPHY_ICONS: Record<string, string> = {
  BEST_SUBMISSION: '🏆',
  MOST_XP: '🔥',
  LONGEST_STREAK: '⛓️',
};

const publicHero = {
  isPublic: true,
  heroClass: { not: null },
  username: { not: null },
};

export default async function LeaderboardPage() {
  const weekStart = startOfIsoWeek();

  const [topXp, topStreaks, weeklyForge, recentTrophies] = await Promise.all([
    prisma.user.findMany({
      where: publicHero,
      orderBy: [{ xp: 'desc' }, { username: 'asc' }],
      take: 10,
      select: {
        username: true, displayName: true, avatarUrl: true,
        heroClass: true, tier: true, xp: true, level: true,
      },
    }),
    prisma.user.findMany({
      where: { ...publicHero, longestStreak: { gt: 0 } },
      orderBy: [{ longestStreak: 'desc' }, { username: 'asc' }],
      take: 10,
      select: {
        username: true, displayName: true, avatarUrl: true,
        heroClass: true, tier: true, longestStreak: true,
      },
    }),
    prisma.forgeEntry.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: weekStart } },
      _sum: { xpEarned: true },
      orderBy: [{ _sum: { xpEarned: 'desc' } }, { userId: 'asc' }],
      take: 10,
    }),
    prisma.trophy.findMany({
      orderBy: { awardedAt: 'desc' },
      take: 9,
      select: {
        id: true, kind: true, weekKey: true, title: true,
        user: { select: { username: true, displayName: true, isPublic: true } },
      },
    }),
  ]);

  // Resolve weekly-forge leaders to their public profiles
  const weeklyUserIds = weeklyForge.map((row) => row.userId);
  const weeklyUsers = weeklyUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: weeklyUserIds }, ...publicHero },
        select: {
          id: true, username: true, displayName: true, avatarUrl: true,
          heroClass: true, tier: true,
        },
      })
    : [];
  const weeklyUserMap = new Map(weeklyUsers.map((u) => [u.id, u]));

  const xpBoard: RankedUser[] = topXp.map((u) => ({
    username: u.username, displayName: u.displayName, avatarUrl: u.avatarUrl,
    heroClass: u.heroClass, tier: u.tier,
    value: `Lv ${u.level} · ${u.xp.toLocaleString()} XP`,
  }));

  const streakBoard: RankedUser[] = topStreaks.map((u) => ({
    username: u.username, displayName: u.displayName, avatarUrl: u.avatarUrl,
    heroClass: u.heroClass, tier: u.tier,
    value: `${u.longestStreak}d`,
  }));

  const forgeBoard: RankedUser[] = weeklyForge
    .map((row) => {
      const u = weeklyUserMap.get(row.userId);
      if (!u) return null;
      return {
        username: u.username, displayName: u.displayName, avatarUrl: u.avatarUrl,
        heroClass: u.heroClass, tier: u.tier,
        value: `${(row._sum.xpEarned ?? 0).toLocaleString()} XP`,
      };
    })
    .filter((row): row is RankedUser => row !== null);

  const champions = recentTrophies.filter((t) => t.user.isPublic && t.user.username);

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <h1 className={styles.headline}>The Leaderboard</h1>
            <p className={styles.subhead}>
              The realm&apos;s mightiest heroes — ranked by experience, unbroken streaks, and deeds
              recorded in the Forge this week. Trophies are awarded automatically every Monday.
            </p>
          </header>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🏆 Hall of Champions</h2>
            {champions.length === 0 ? (
              <p className={styles.empty}>
                No trophies awarded yet. Forge an entry this week — the best submission wins the
                Champion&apos;s Quill on Monday.
              </p>
            ) : (
              <div className={styles.champGrid}>
                {champions.map((trophy) => (
                  <Link key={trophy.id} href={`/u/${trophy.user.username}`} className={styles.champCard}>
                    <span className={styles.champIcon}>{TROPHY_ICONS[trophy.kind] ?? '🏆'}</span>
                    <span>
                      <h3 className={styles.champTitle}>{trophy.title}</h3>
                      <p className={styles.champMeta}>
                        {trophy.user.displayName} · Week {trophy.weekKey}
                      </p>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.boardGrid}>
              <Board title="⚡ Highest XP" users={xpBoard} emptyText="No public heroes yet." />
              <Board title="🔥 Longest Streaks" users={streakBoard} emptyText="No streaks recorded yet." />
              <Board
                title="🔨 Forge XP This Week"
                users={forgeBoard}
                emptyText="No forge entries yet this week — be the first."
              />
            </div>
          </section>

          <div className={styles.cta}>
            <p className={styles.ctaText}>Your name belongs on this board.</p>
            <Link href="/sign-in" className={styles.ctaBtn}>
              Begin Your Legend
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
