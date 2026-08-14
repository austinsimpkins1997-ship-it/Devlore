'use client';

import React, { useState } from 'react';
import styles from './CodexHeader.module.css';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface CodexHeaderProps {
  user: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    heroClass: string;
    heroTitle: string;
    heroClassSlug: string;
    level: number;
    currentStreak: number;
    totalCommits: number;
    topLanguages: Record<string, number> | null;
    createdAt: string;
  };
}

export const CodexHeader: React.FC<CodexHeaderProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const yearsActive = Math.max(1, new Date().getFullYear() - new Date(user.createdAt).getFullYear());

  const topLangs = user.topLanguages 
    ? Object.entries(user.topLanguages).sort((a, b) => b[1] - a[1]).slice(0, 3)
    : [];

  return (
    <div className={`${styles.headerContainer} ${styles[user.heroClassSlug]}`}>
      <div className={styles.particleBg}></div>
      
      <div className={styles.content}>
        <div className={styles.avatarWrapper}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{user.displayName.charAt(0)}</div>
          )}
          <div className={styles.levelBadge}>
            <Badge variant="level" value={user.level.toString()} />
          </div>
        </div>

        <div className={styles.identityData}>
          <h1 className={styles.heroClass}>{user.heroClass}</h1>
          <p className={styles.heroTitle}>{user.heroTitle}</p>
          <div className={styles.nameRow}>
            <span className={styles.displayName}>{user.displayName}</span>
            <span className={styles.username}>@{user.username}</span>
          </div>
          
          {topLangs.length > 0 && (
            <div className={styles.sigils}>
              {topLangs.map(([lang]) => (
                <div key={lang} className={styles.sigil} title={lang}>
                  <span className={styles.sigilDot}></span>
                  {lang}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.statsStrip}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>🔥 {user.currentStreak}</div>
            <div className={styles.statLabel}>Day Streak</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>⚔️ {user.totalCommits.toLocaleString()}</div>
            <div className={styles.statLabel}>Commits</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>⏳ {yearsActive}</div>
            <div className={styles.statLabel}>Years Active</div>
          </div>
        </div>

        <div className={styles.actionRow}>
          <Button variant="secondary" onClick={handleShare} icon="🔗">
            {copied ? 'Copied!' : 'Share Codex'}
          </Button>
        </div>
      </div>
    </div>
  );
};
