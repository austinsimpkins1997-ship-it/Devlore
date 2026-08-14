'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';

interface ArenaFighter {
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

interface BattleResult {
  fighterA: ArenaFighter;
  fighterB: ArenaFighter;
  winner: string | null;
}

function FighterCard({ fighter, color, isWinner }: { fighter: ArenaFighter; color: string; isWinner: boolean }) {
  const stats: Array<[string, string]> = [
    ['LEVEL', `${fighter.level}`],
    ['XP', fighter.xp.toLocaleString()],
    ['COMMITS', fighter.totalCommits.toLocaleString()],
    ['LONGEST STREAK', `${fighter.longestStreak}d`],
    ['TOP LANGUAGE', fighter.topLanguage ?? '—'],
    ['TROPHIES', `${fighter.trophyCount}`],
    ['GEAR POWER', fighter.gearPower.toLocaleString()],
    ['SIGNATURE GEAR', fighter.bestItem ?? '—'],
  ];

  return (
    <div
      style={{
        flex: '1 1 300px',
        backgroundColor: 'var(--color-abyss)',
        border: `1px solid ${color}`,
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: isWinner ? `0 0 30px ${color}` : `0 0 10px ${color}40`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isWinner && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.5rem' }}>👑</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        {fighter.avatarUrl && (
          <Image
            src={fighter.avatarUrl}
            alt={fighter.displayName}
            width={56}
            height={56}
            style={{ borderRadius: '50%' }}
          />
        )}
        <div>
          <Link
            href={`/u/${fighter.username}`}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: '#fff', textDecoration: 'none' }}
          >
            @{fighter.username}
          </Link>
          <div style={{ color: 'var(--color-mist)', fontSize: '0.85rem' }}>
            {fighter.heroClass ?? 'Unclassed wanderer'}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {stats.map(([label, value]) => (
          <div key={label}>
            <div style={{ color: 'var(--color-mist)', fontSize: '0.75rem' }}>{label}</div>
            <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-frost)' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ color: 'var(--color-mist)', fontSize: '0.75rem' }}>BATTLE SCORE</div>
        <div style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color }}>
          {fighter.score.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default function ArenaPage() {
  const [fighterA, setFighterA] = useState('');
  const [fighterB, setFighterB] = useState('');
  const [battling, setBattling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BattleResult | null>(null);

  const handleBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fighterA || !fighterB || battling) return;

    setBattling(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/arena/compare?a=${encodeURIComponent(fighterA.trim())}&b=${encodeURIComponent(fighterB.trim())}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'The battle could not begin.');
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The battle could not begin.');
    } finally {
      setBattling(false);
    }
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-void)',
          paddingTop: '100px',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingBottom: '4rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: 'white',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '4rem',
              margin: '0 0 1rem 0',
              background: 'linear-gradient(to right, var(--color-rune), var(--color-arcane))',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            The Arena
          </h1>
          <p style={{ color: 'var(--color-mist)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
            Two legends. One saga. Battle scores are computed from real XP, commits, streaks, and
            trophies — both heroes must have a public DevLore codex.
          </p>
        </div>

        <form
          onSubmit={handleBattle}
          style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem',
            maxWidth: '800px',
            width: '100%',
          }}
        >
          <input
            type="text"
            placeholder="GitHub Username"
            value={fighterA}
            onChange={(e) => setFighterA(e.target.value)}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--color-rune)',
              backgroundColor: 'var(--color-abyss)',
              color: 'white',
              fontSize: '1.25rem',
              fontFamily: 'var(--font-mono)',
              width: '100%',
              flex: '1 1 250px',
              outline: 'none',
              boxShadow: '0 0 10px var(--color-rune-glow)',
            }}
          />
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-mist)', fontWeight: 'bold' }}>
            VS
          </div>
          <input
            type="text"
            placeholder="GitHub Username"
            value={fighterB}
            onChange={(e) => setFighterB(e.target.value)}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--color-arcane)',
              backgroundColor: 'var(--color-abyss)',
              color: 'white',
              fontSize: '1.25rem',
              fontFamily: 'var(--font-mono)',
              width: '100%',
              flex: '1 1 250px',
              outline: 'none',
              boxShadow: '0 0 10px var(--color-arcane-glow)',
            }}
          />
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={battling || !fighterA || !fighterB}
              style={{
                padding: '1rem 3rem',
                fontSize: '1.25rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 'bold',
                backgroundColor: 'var(--color-rune)',
                color: 'var(--color-void)',
                border: 'none',
                borderRadius: '8px',
                cursor: battling || !fighterA || !fighterB ? 'not-allowed' : 'pointer',
                opacity: battling || !fighterA || !fighterB ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px var(--color-rune-glow)',
              }}
            >
              {battling ? 'Summoning Heroes...' : 'Begin the Battle'}
            </button>
          </div>
        </form>

        {error && (
          <div
            style={{
              maxWidth: '600px',
              textAlign: 'center',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: 'var(--color-danger)',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem',
            }}
          >
            {error}
          </div>
        )}

        {result && (
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <div
              style={{
                textAlign: 'center',
                backgroundColor: 'rgba(245,158,11,0.1)',
                border: '1px solid var(--color-rune)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '3rem',
              }}
            >
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--color-rune)', fontSize: '1.75rem' }}>
                {result.winner ? `Victory: @${result.winner}` : 'A perfect draw — the bards will sing of both'}
              </h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-mist)', fontSize: '0.875rem' }}>
                Score = XP + commits×2 + streak×50 + level×100 + trophies×500 + gear power
              </p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <FighterCard
                fighter={result.fighterA}
                color="var(--color-rune)"
                isWinner={result.winner === result.fighterA.username}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '3rem',
                  color: 'var(--color-shadow)',
                }}
              >
                ⚡
              </div>
              <FighterCard
                fighter={result.fighterB}
                color="var(--color-arcane)"
                isWinner={result.winner === result.fighterB.username}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
