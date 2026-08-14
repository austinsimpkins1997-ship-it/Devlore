import React from 'react';
import styles from './ChapterCard.module.css';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface ChapterCardProps {
  chapter: {
    id: string;
    number: number;
    title: string;
    summary: string;
    weekStart: string;
    weekEnd: string;
    commitCount: number;
    xpEarned: number;
    createdAt: string;
  };
  onRead: (chapterId: string) => void;
  isLocked?: boolean;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onRead, isLocked = false }) => {
  const start = new Date(chapter.weekStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  return (
    <Card hoverable className={`${styles.chapterCard} ${isLocked ? styles.locked : ''}`}>
      <div className={styles.chapterNumber}>{chapter.number.toString().padStart(2, '0')}</div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{chapter.title}</h3>
          <span className={styles.date}>The Week of {start}</span>
        </div>
        
        <p className={styles.summary}>{chapter.summary}</p>
        
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statIcon}>⚔️</span>
            <span className={styles.statText}>{chapter.commitCount} Acts of Creation</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>✨</span>
            <span className={styles.statText}>+{chapter.xpEarned} XP</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button 
            variant={isLocked ? "ghost" : "secondary"} 
            onClick={() => onRead(chapter.id)}
            disabled={isLocked}
            icon={isLocked ? "🔒" : "📖"}
          >
            {isLocked ? "Locked" : "Read Chapter"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
