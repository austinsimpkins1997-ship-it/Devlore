'use client';

import { useState, Suspense } from 'react';
import { HeroCard } from '@/components/saga/HeroCard';
import { SagaTimeline } from '@/components/saga/SagaTimeline';
import { LoreCard } from '@/components/saga/LoreCard';
import { AnalyzeButton } from '@/components/dashboard/AnalyzeButton';
import { AutoAnalyze } from '@/components/dashboard/AutoAnalyze';
import { GenerateChapterButton } from '@/components/dashboard/GenerateChapterButton';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import QuestsPanel from '@/components/dashboard/QuestsPanel';
import ForgePanel from '@/components/dashboard/ForgePanel';
import Link from 'next/link';

/* ── Types (inline, match Prisma shape) ── */
interface Chapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  weekStart: string;
  weekEnd: string;
  commitCount: number;
  xpEarned: number;
  createdAt: string;
}

interface LoreCardData {
  id: string;
  cardType: string;
  rarity: string;
  name: string;
  flavorText: string;
  milestone: string;
  xpValue: number;
  unlockedAt: string;
}

interface DashboardUser {
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  heroClass: string | null;
  heroTitle: string | null;
  heroClassSlug: string | null;
  level: number;
  xp: number;
  tier: string;
  currentStreak: number;
  longestStreak: number;
  totalCommits: number;
  firstCommitDate: Date | null;
  originStory: string | null;
  chapters: Chapter[];
  loreCards: LoreCardData[];
}

interface DashboardClientProps {
  user: DashboardUser;
  canGenerateChapter: boolean;
  hasHeroClass: boolean;
}

type Tab = 'overview' | 'chronicles' | 'collection' | 'quests' | 'forge';

export function DashboardClient({ user, canGenerateChapter, hasHeroClass }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-frost)', margin: 0 }}>
            Your Saga
          </h1>
          {user.heroClass && (
            <p style={{ color: 'var(--color-mist)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {user.heroClass} · Level {user.level} · {user.xp.toLocaleString()} XP
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {user.username && (
            <Link href={`/u/${user.username}`} style={{ color: 'var(--color-rune)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
              Public Codex →
            </Link>
          )}
          <Link href="/quiz" style={{ color: 'var(--color-arcane)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
            ⚡ Take the Quiz
          </Link>
          <Link href="/arena" style={{ color: 'var(--color-mist)', textDecoration: 'none', fontSize: '0.875rem' }}>
            ⚔️ Arena
          </Link>
          <Link href="/dashboard/settings" style={{
            padding: '0.5rem 1rem',
            background: 'var(--color-abyss)',
            border: '1px solid var(--color-dusk)',
            borderRadius: '6px',
            color: 'var(--color-mist)',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}>
            Settings
          </Link>
        </div>
      </header>

      {/* ── No Hero Class: Auto-Analyze State ── */}
      {!hasHeroClass ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--color-abyss)', borderRadius: '12px', border: '1px solid var(--color-dusk)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--color-rune-dim), var(--color-rune), var(--color-arcane))' }} />
          <AutoAnalyze />
          <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', animation: 'pulse 2s ease-in-out infinite' }}>✺</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-frost)', marginBottom: '1rem', fontSize: '1.75rem' }}>
            Your Legend is Being Written...
          </h2>
          <p style={{ color: 'var(--color-mist)', maxWidth: '480px', margin: '0 auto 1rem', lineHeight: '1.7' }}>
            We are reading your GitHub history and forging your origin story, hero class, and lore cards. This takes 30–60 seconds. The page will reload automatically when ready.
          </p>
          <p style={{ color: 'var(--color-shadow)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            If it does not reload in 60 seconds:
          </p>
          <AnalyzeButton label="↺ Start Analysis Manually" />
        </div>
      ) : (
        <>
          {/* ── Tab Navigation ── */}
          <DashboardTabs activeTab={activeTab} onTabChange={(t: string) => setActiveTab(t as Tab)} />

          {/* ── Tab: Overview ── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <HeroCard
                displayName={user.displayName ?? user.username ?? 'Adventurer'}
                username={user.username ?? ''}
                avatarUrl={user.avatarUrl}
                heroClass={user.heroClass ?? 'Adventurer'}
                heroTitle={user.heroTitle ?? 'The Unnamed'}
                heroClassSlug={user.heroClassSlug ?? 'chaos-mage'}
                level={user.level}
                xp={user.xp}
                tier={user.tier}
                currentStreak={user.currentStreak}
                longestStreak={user.longestStreak}
                totalCommits={user.totalCommits}
                firstCommitDate={user.firstCommitDate?.toISOString() ?? null}
              />

              {/* Origin Story */}
              {user.originStory && (
                <div style={{ padding: '2rem', background: 'var(--color-abyss)', border: '1px solid var(--color-dusk)', borderRadius: '12px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--color-rune), transparent)' }} />
                  <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-rune)', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                    ✦ Your Origin Story
                  </h2>
                  <p style={{ color: 'var(--color-mist)', fontStyle: 'italic', lineHeight: '1.85', fontSize: '1.05rem' }}>
                    {user.originStory}
                  </p>
                </div>
              )}

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Total Commits', value: user.totalCommits.toLocaleString(), icon: '📝' },
                  { label: 'Current Streak', value: `${user.currentStreak}d`, icon: '🔥' },
                  { label: 'Longest Streak', value: `${user.longestStreak}d`, icon: '⚡' },
                  { label: 'Lore Cards', value: user.loreCards.length, icon: '🃏' },
                  { label: 'Chapters', value: user.chapters.length, icon: '📖' },
                ].map((stat) => (
                  <div key={stat.label} style={{ padding: '1.25rem', background: 'var(--color-abyss)', border: '1px solid var(--color-dusk)', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--color-rune)' }}>{stat.value}</div>
                    <div style={{ color: 'var(--color-shadow)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Latest Chapter or Generate Button */}
              {user.chapters.length === 0 ? (
                <div style={{ padding: '2rem', background: 'var(--color-abyss)', border: '1px dashed var(--color-dusk)', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-mist)', marginBottom: '1.5rem' }}>
                    Your first chapter is waiting to be written. Generate it from last week&apos;s commits.
                  </p>
                  {canGenerateChapter ? (
                    <GenerateChapterButton />
                  ) : (
                    <Link href="/pricing" style={{ color: 'var(--color-rune)', textDecoration: 'none', fontWeight: 600 }}>
                      Upgrade to Pro to generate chapters →
                    </Link>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>
                    Latest: Chapter {user.chapters[0]?.number} — {user.chapters[0]?.title}
                  </div>
                  {canGenerateChapter && <GenerateChapterButton />}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Chronicles ── */}
          {activeTab === 'chronicles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-frost)', fontSize: '1.5rem' }}>
                  📖 Your Chronicles
                </h2>
                {canGenerateChapter && <GenerateChapterButton />}
              </div>
              {user.chapters.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-abyss)', borderRadius: '12px', border: '1px dashed var(--color-dusk)' }}>
                  <p style={{ color: 'var(--color-mist)', marginBottom: '1.5rem' }}>No chapters yet. Generate your first one above.</p>
                </div>
              ) : (
                <SagaTimeline chapters={user.chapters as Parameters<typeof SagaTimeline>[0]['chapters']} />
              )}
            </div>
          )}

          {/* ── Tab: Collection ── */}
          {activeTab === 'collection' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-frost)', fontSize: '1.5rem' }}>
                🃏 Lore Card Collection
              </h2>
              {user.loreCards.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-abyss)', borderRadius: '12px', border: '1px dashed var(--color-dusk)' }}>
                  <p style={{ color: 'var(--color-mist)', marginBottom: '1rem' }}>No cards yet. Re-analyze your GitHub history to unlock your milestone cards.</p>
                  <AnalyzeButton label="↺ Re-analyze to Unlock Cards" />
                </div>
              ) : (
                <>
                  <p style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>{user.loreCards.length} cards collected</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {user.loreCards.map((card) => (
                      <LoreCard
                        key={card.id}
                        card={card as Parameters<typeof LoreCard>[0]['card']}
                        isNew={false}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Tab: Quests ── */}
          {activeTab === 'quests' && QuestsPanel && (
            <Suspense fallback={<div style={{ color: 'var(--color-mist)' }}>Loading quests...</div>}>
              <QuestsPanel />
            </Suspense>
          )}

          {/* ── Tab: The Forge ── */}
          {activeTab === 'forge' && ForgePanel && (
            <Suspense fallback={<div style={{ color: 'var(--color-mist)' }}>Loading The Forge...</div>}>
              <ForgePanel userId={user.username ?? 'anonymous'} />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
