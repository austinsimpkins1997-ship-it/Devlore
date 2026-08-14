import React from 'react';
import styles from './BadgeShelf.module.css';
import type { ProfileBadge } from '@/lib/badges';

interface BadgeShelfProps {
  badges: ProfileBadge[];
  title?: string;
}

/** Presentational badge shelf — pure, renders in server and client trees. */
export function BadgeShelf({ badges, title = '🎖️ Contribution Badges' }: BadgeShelfProps) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      {badges.length === 0 ? (
        <p className={styles.empty}>
          No badges yet — they unlock automatically from verified GitHub activity as commits,
          streaks, and open-source contributions grow.
        </p>
      ) : (
        <div className={styles.grid}>
          {badges.map((badge) => (
            <div key={badge.slug} className={styles.badge} title={badge.description}>
              <span className={styles.badgeIcon}>{badge.icon}</span>
              <span>
                <span className={styles.badgeLabel}>{badge.label}</span>
                <br />
                <span className={styles.badgeDesc}>{badge.description}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
