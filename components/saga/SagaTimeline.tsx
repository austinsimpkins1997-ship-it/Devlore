'use client';

import React from 'react';
import styles from './SagaTimeline.module.css';
import { ChapterCard, ChapterCardProps } from './ChapterCard';
import { Button } from '../ui/Button';
import Link from 'next/link';

export interface SagaTimelineProps {
  chapters: ChapterCardProps['chapter'][];
  /** If provided, chapters beyond this index are locked (free tier gate) */
  lockedAfter?: number;
  /** Passed to ChapterCard.onRead handler. Defaults to no-op. */
  onReadChapter?: (id: string) => void;
  /** Controls whether the upgrade CTA is shown */
  userTier?: string;
  /** Total chapter count for the upgrade CTA message */
  totalChapters?: number;
  /** If true, hides lock gates (public view) */
  isPublicView?: boolean;
}

export const SagaTimeline: React.FC<SagaTimelineProps> = ({
  chapters,
  lockedAfter,
  onReadChapter,
  userTier = 'FREE',
  totalChapters,
  isPublicView = false,
}) => {
  const isFreeTier = !isPublicView && userTier.toUpperCase() === 'FREE';
  const freeLimit = lockedAfter ?? 3;

  const handleRead = (id: string) => {
    if (onReadChapter) onReadChapter(id);
  };

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineLine} />

      <div className={styles.chaptersList}>
        {chapters.map((chapter, index) => {
          const isLocked = isFreeTier && index >= freeLimit;
          const isLeft = index % 2 === 0;

          return (
            <div
              key={chapter.id}
              className={`${styles.timelineNode} ${isLeft ? styles.leftNode : styles.rightNode}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.nodeMarker} />
              <div className={styles.cardWrapper}>
                <ChapterCard
                  chapter={chapter}
                  onRead={handleRead}
                  isLocked={isLocked}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.originMarker}>
        <div className={styles.originIcon}>✨</div>
        <div className={styles.originText}>Your Legend Begins Here</div>
      </div>

      {isFreeTier && chapters.length >= freeLimit && (
        <div className={styles.upgradeCTA}>
          <div className={styles.upgradeContent}>
            <h3 className={styles.upgradeTitle}>Unlock Your Full Saga</h3>
            <p className={styles.upgradeDesc}>
              The free tier shows the first {freeLimit} chapters. Upgrade to PRO to read
              your complete history
              {totalChapters ? ` (${totalChapters} chapters)` : ''} and access legendary lore cards.
            </p>
            <Link href="/pricing">
              <Button variant="primary">Become Legendary</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
