'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './QuestsPanel.module.css';

interface QuestItem {
  slug: string;
  title: string;
  description: string;
  icon: string;
  cadence: 'DAILY' | 'WEEKLY' | 'MILESTONE';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  target: number;
  xpReward: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  lockedForTier: boolean;
  requiresTier: 'PRO' | 'LEGEND' | null;
}

interface QuestBoardData {
  quests: QuestItem[];
  claimableXp: number;
  tier: 'FREE' | 'PRO' | 'LEGEND';
}

const DIFFICULTY_COLORS: Record<QuestItem['difficulty'], string> = {
  Easy: '#22c55e',
  Medium: '#3b82f6',
  Hard: '#ea580c',
  Legendary: '#f59e0b',
};

function QuestCard({
  quest,
  claiming,
  onClaim,
}: {
  quest: QuestItem;
  claiming: boolean;
  onClaim: (slug: string) => void;
}) {
  const isLegendary = quest.difficulty === 'Legendary';
  const color = DIFFICULTY_COLORS[quest.difficulty];
  const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));

  let action: React.ReactNode;
  if (quest.claimed) {
    action = <span className={styles.claimedTag}>Claimed ✓</span>;
  } else if (quest.lockedForTier) {
    action = (
      <Link href="/pricing" className={styles.lockLink}>
        🔒 Pro Quest
      </Link>
    );
  } else if (quest.completed) {
    action = (
      <button className={styles.claimBtn} disabled={claiming} onClick={() => onClaim(quest.slug)}>
        {claiming ? 'Claiming...' : 'Claim XP'}
      </button>
    );
  } else {
    action = <span className={styles.pendingBtn}>In Progress</span>;
  }

  const cardClasses = [
    styles.questCard,
    isLegendary ? styles.questCardLegendary : '',
    quest.claimed ? styles.questCardClaimed : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} style={{ borderLeftColor: color }}>
      <div className={styles.questIcon}>{quest.icon}</div>
      <div className={styles.questBody}>
        <h4 className={`${styles.questTitle} ${isLegendary ? styles.questTitleLegendary : ''}`}>
          {quest.title}
        </h4>
        <p className={styles.questDesc}>{quest.description}</p>
        <div className={styles.progressTrack}>
          <div
            className={`${styles.progressFill} ${quest.completed ? styles.progressFillDone : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={styles.progressLabel}>
          {quest.progress.toLocaleString()} / {quest.target.toLocaleString()}
        </span>
      </div>
      <div className={styles.questMeta}>
        <span className={styles.difficultyChip} style={{ color }}>
          {quest.difficulty}
        </span>
        <span className={styles.xpLabel}>+{quest.xpReward.toLocaleString()} XP</span>
        {action}
      </div>
    </div>
  );
}

export default function QuestsPanel() {
  const [board, setBoard] = useState<QuestBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [claimingSlug, setClaimingSlug] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const loadBoard = useCallback(async () => {
    try {
      const res = await fetch('/api/quests');
      if (!res.ok) throw new Error('Failed to load quests');
      const data: QuestBoardData = await res.json();
      setBoard(data);
      setLoadError(null);
    } catch {
      setLoadError('Could not load your quest board. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const handleClaim = async (slug: string) => {
    if (claimingSlug) return;
    setClaimingSlug(slug);
    setFeedback(null);
    try {
      const res = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Claim failed');
      }
      setFeedback({
        kind: 'success',
        text: data.leveledUp
          ? `+${data.xpAwarded} XP claimed — you reached Level ${data.newLevel}! ⬆`
          : `+${data.xpAwarded} XP claimed!`,
      });
      await loadBoard();
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Claim failed. Please try again.',
      });
    } finally {
      setClaimingSlug(null);
    }
  };

  if (loading) {
    return <div className={styles.stateMsg}>Consulting the quest ledger...</div>;
  }
  if (loadError || !board) {
    return <div className={styles.stateMsg}>{loadError ?? 'Could not load quests.'}</div>;
  }

  const daily = board.quests.filter((q) => q.cadence === 'DAILY');
  const weekly = board.quests.filter((q) => q.cadence === 'WEEKLY');
  const milestones = board.quests.filter(
    (q) => q.cadence === 'MILESTONE' && q.difficulty !== 'Legendary',
  );
  const legendary = board.quests.filter(
    (q) => q.cadence === 'MILESTONE' && q.difficulty === 'Legendary',
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.summaryCard}>
        <h3 className={styles.summaryTitle}>Quest Ledger</h3>
        <p className={styles.summaryMeta}>
          {board.claimableXp > 0
            ? `${board.claimableXp.toLocaleString()} XP ready to claim — quests reset daily and weekly (UTC).`
            : 'Complete quests by forging entries and keeping your streaks alive. Daily and weekly quests reset automatically (UTC).'}
          {board.tier === 'LEGEND' && ' Legend heroes earn 1.5× quest XP.'}
        </p>
      </div>

      {feedback && (
        <p
          className={`${styles.feedback} ${
            feedback.kind === 'success' ? styles.feedbackSuccess : styles.feedbackError
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span style={{ color: '#22c55e' }}>✦</span> Daily Quests
        </h2>
        {daily.map((q) => (
          <QuestCard key={q.slug} quest={q} claiming={claimingSlug === q.slug} onClaim={handleClaim} />
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span style={{ color: '#3b82f6' }}>✦</span> Weekly Quests
          {board.tier === 'FREE' && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-arcane-glow)', fontFamily: 'var(--font-body)' }}>
              — claiming unlocks with Pro
            </span>
          )}
        </h2>
        {weekly.map((q) => (
          <QuestCard key={q.slug} quest={q} claiming={claimingSlug === q.slug} onClaim={handleClaim} />
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span style={{ color: 'var(--color-rune)' }}>✦</span> Milestones
        </h2>
        {milestones.map((q) => (
          <QuestCard key={q.slug} quest={q} claiming={claimingSlug === q.slug} onClaim={handleClaim} />
        ))}
      </div>

      {legendary.length > 0 && (
        <div className={styles.section}>
          <h2 className={`${styles.sectionTitle} ${styles.legendaryTitle}`}>
            ✧ Legendary Challenge ✧
          </h2>
          {legendary.map((q) => (
            <QuestCard key={q.slug} quest={q} claiming={claimingSlug === q.slug} onClaim={handleClaim} />
          ))}
        </div>
      )}
    </div>
  );
}
