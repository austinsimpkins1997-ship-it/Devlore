'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import styles from './heroes.module.css';

type Relationship = 'self' | 'friends' | 'request_sent' | 'request_received' | 'none' | null;

interface HeroRow {
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  heroClass: string | null;
  heroTitle: string | null;
  level: number;
  xp: number;
  longestStreak: number;
  totalCommits: number;
  tier: string;
  trophyCount: number;
  relationship: Relationship;
}

const SORTS: Array<{ id: string; label: string }> = [
  { id: 'xp', label: 'Top XP' },
  { id: 'level', label: 'Level' },
  { id: 'streak', label: 'Streak' },
];

function TierChip({ tier }: { tier: string }) {
  if (tier === 'PRO') return <span className={`${styles.tierChip} ${styles.tierPro}`}>PRO</span>;
  if (tier === 'LEGEND') return <span className={`${styles.tierChip} ${styles.tierLegend}`}>LEGEND</span>;
  return null;
}

export default function HeroesPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState('xp');
  const [page, setPage] = useState(0);
  const [heroes, setHeroes] = useState<HeroRow[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(query);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page: String(page) });
      if (debounced) params.set('q', debounced);
      const res = await fetch(`/api/heroes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load heroes');
      const data = await res.json();
      setHeroes(data.heroes ?? []);
      setHasMore(Boolean(data.hasMore));
      setError(null);
    } catch {
      setError('Could not load the Hall of Heroes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debounced, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  const addFriend = async (username: string) => {
    if (busy) return;
    setBusy(username);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = '/sign-in';
        return;
      }
      if (!res.ok) throw new Error(data?.error ?? 'Could not send request');
      setHeroes((prev) =>
        prev.map((h) =>
          h.username === username ? { ...h, relationship: data.status as Relationship } : h,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request');
    } finally {
      setBusy(null);
    }
  };

  const renderAction = (hero: HeroRow) => {
    if (!hero.username) return null;
    switch (hero.relationship) {
      case 'self':
        return (
          <Link href="/dashboard" className={`${styles.actionBtn} ${styles.actionNeutral}`}>
            This is you — open dashboard
          </Link>
        );
      case 'friends':
        return (
          <button className={`${styles.actionBtn} ${styles.actionNeutral}`} disabled>
            ✓ Companions
          </button>
        );
      case 'request_sent':
        return (
          <button className={`${styles.actionBtn} ${styles.actionNeutral}`} disabled>
            Request sent
          </button>
        );
      case 'request_received':
        return (
          <Link href="/dashboard" className={styles.actionBtn}>
            Respond in Fellowship →
          </Link>
        );
      default:
        return (
          <button
            className={styles.actionBtn}
            disabled={busy === hero.username}
            onClick={() => addFriend(hero.username!)}
          >
            {busy === hero.username ? 'Sending...' : '+ Add Friend'}
          </button>
        );
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <h1 className={styles.headline}>Hall of Heroes</h1>
            <p className={styles.subhead}>
              Every public legend in the realm. Search for a hero, study their codex, and send a
              request to add them to your fellowship.
            </p>
          </header>

          <div className={styles.controls}>
            <input
              className={styles.search}
              type="text"
              placeholder="Search by name, username, or hero class..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className={styles.sortGroup}>
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  className={`${styles.sortBtn} ${sort === s.id ? styles.sortBtnActive : ''}`}
                  onClick={() => {
                    setSort(s.id);
                    setPage(0);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className={styles.stateMsg}>{error}</p>}

          {loading ? (
            <p className={styles.stateMsg}>Summoning the heroes...</p>
          ) : heroes.length === 0 ? (
            <p className={styles.stateMsg}>No heroes match that search.</p>
          ) : (
            <div className={styles.grid}>
              {heroes.map((hero) => (
                <div key={hero.username ?? hero.displayName} className={styles.card}>
                  <div className={styles.cardTop}>
                    {hero.avatarUrl ? (
                      <Image
                        src={hero.avatarUrl}
                        alt={hero.displayName}
                        width={48}
                        height={48}
                        className={styles.avatar}
                      />
                    ) : (
                      <span className={styles.avatarFallback}>{hero.displayName.charAt(0)}</span>
                    )}
                    <span className={styles.identity}>
                      <Link href={`/u/${hero.username}`} className={styles.name}>
                        {hero.displayName}
                        <TierChip tier={hero.tier} />
                      </Link>
                      <span className={styles.klass}>
                        {hero.heroClass ?? 'Adventurer'} · Lv {hero.level}
                      </span>
                    </span>
                  </div>

                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{hero.xp.toLocaleString()}</div>
                      <div className={styles.statLabel}>XP</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{hero.longestStreak}d</div>
                      <div className={styles.statLabel}>Streak</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{hero.trophyCount}</div>
                      <div className={styles.statLabel}>Trophies</div>
                    </div>
                  </div>

                  {renderAction(hero)}
                </div>
              ))}
            </div>
          )}

          <div className={styles.footerRow}>
            <button
              className={styles.pageBtn}
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ← Previous
            </button>
            <button
              className={styles.pageBtn}
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
