import React from 'react';
import styles from './TrophyCase.module.css';

export interface TrophyDisplay {
  id: string;
  kind: 'BEST_SUBMISSION' | 'MOST_XP' | 'LONGEST_STREAK';
  weekKey: string;
  title: string;
  description: string;
  awardedAt: string;
}

const TROPHY_ICONS: Record<TrophyDisplay['kind'], string> = {
  BEST_SUBMISSION: '🏆',
  MOST_XP: '🔥',
  LONGEST_STREAK: '⛓️',
};

interface TrophyCaseProps {
  trophies: TrophyDisplay[];
  title?: string;
  emptyText?: string;
}

/**
 * Presentational trophy case — pure, so it renders in both server components
 * (public codex, leaderboard) and client trees (dashboard).
 */
export function TrophyCase({
  trophies,
  title = '🏆 Trophy Case',
  emptyText = 'No trophies yet. The best Forge submission each week earns the Champion’s Quill — awarded automatically every Monday.',
}: TrophyCaseProps) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      {trophies.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <div className={styles.grid}>
          {trophies.map((trophy) => (
            <div key={trophy.id} className={styles.trophy}>
              <span className={styles.trophyIcon}>{TROPHY_ICONS[trophy.kind]}</span>
              <div>
                <h3 className={styles.trophyTitle}>{trophy.title}</h3>
                <p className={styles.trophyDesc}>{trophy.description}</p>
                <span className={styles.trophyWeek}>Week {trophy.weekKey}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
