'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './HeroCard.module.css';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getXPToNextLevel } from '@/lib/narrative/xp';

export interface HeroCardProps {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  heroClass: string;
  heroTitle: string;
  heroClassSlug: string;
  level: number;
  xp: number;
  tier: string;
  currentStreak: number;
  longestStreak: number;
  totalCommits: number;
  firstCommitDate: string | null;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  displayName,
  username,
  avatarUrl,
  heroClass,
  heroTitle,
  heroClassSlug,
  level,
  xp,
  tier,
  currentStreak,
  longestStreak,
  totalCommits,
  firstCommitDate,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const yearsActive = firstCommitDate 
    ? Math.max(1, new Date().getFullYear() - new Date(firstCommitDate).getFullYear())
    : 1;

  // Calculate XP progress using real level thresholds
  const xpProgress = getXPToNextLevel(xp).percentage;

  return (
    <Card variant="glass" className={`${styles.heroCard} ${styles[heroClassSlug]}`}>
      <div className={styles.runesBackground}>
        {/* Animated floating runes via CSS */}
        <div className={styles.rune1}>ᚠ</div>
        <div className={styles.rune2}>ᚢ</div>
        <div className={styles.rune3}>ᚦ</div>
      </div>
      
      <div className={styles.tierBadge}>
        <Badge variant="tier" value={tier} />
      </div>

      <div className={styles.header}>
        <div className={styles.avatarContainer}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt={displayName} width={80} height={80} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{displayName.charAt(0)}</div>
          )}
          <div className={styles.levelBadge}>
            <Badge variant="level" value={level.toString()} />
          </div>
        </div>

        <div className={styles.identity}>
          <h2 className={styles.className}>{heroClass}</h2>
          <p className={styles.heroTitle}>{heroTitle}</p>
          <div className={styles.nameBlock}>
            <span className={styles.displayName}>{displayName}</span>
            <span className={styles.username}>@{username}</span>
          </div>
        </div>
      </div>

      <div className={styles.xpSection}>
        <div className={styles.xpHeader}>
          <span className={styles.xpLabel}>Experience</span>
          <span className={styles.xpValue}>{xp} XP</span>
        </div>
        <div className={styles.xpBarContainer}>
          <div 
            className={styles.xpBarFill} 
            style={{ width: mounted ? `${xpProgress}%` : '0%' }}
          />
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statValue}>{currentStreak}</div>
          <div className={styles.statLabel}>Day Streak</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statIcon}>⚡</div>
          <div className={styles.statValue}>{longestStreak}</div>
          <div className={styles.statLabel}>Best Streak</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statIcon}>⚔️</div>
          <div className={styles.statValue}>{totalCommits.toLocaleString()}</div>
          <div className={styles.statLabel}>Commits</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statValue}>{yearsActive}</div>
          <div className={styles.statLabel}>Years Active</div>
        </div>
      </div>
    </Card>
  );
};
