import React from 'react';
import styles from './MilestonesPanel.module.css';
import type { MilestoneTrack } from '@/lib/milestones';

interface MilestonesPanelProps {
  tracks: MilestoneTrack[];
  title?: string;
}

/**
 * Presentational milestone progress panel — pure, so it renders in both
 * server components (public codex) and client trees (dashboard).
 */
export function MilestonesPanel({ tracks, title = '✦ Milestones' }: MilestonesPanelProps) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.tracks}>
        {tracks.map((track) => {
          const done = track.nextTarget === null;
          return (
            <div key={track.key} className={styles.track}>
              <div className={styles.trackHeader}>
                <span className={styles.trackLabel}>
                  {track.icon} {track.label}
                </span>
                <span className={styles.trackCount}>
                  {track.achievedCount}/{track.totalCount} earned
                </span>
              </div>
              <div className={styles.bar}>
                <div
                  className={`${styles.fill} ${done ? styles.fillComplete : ''}`}
                  style={{ width: `${track.percentage}%` }}
                />
              </div>
              <div className={styles.trackMeta}>
                {done
                  ? `${track.current.toLocaleString()} — every milestone conquered`
                  : `${track.current.toLocaleString()} / next at ${track.nextTarget?.toLocaleString()}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
