'use client';

import React, { useState } from 'react';
import styles from './LoreCard.module.css';

export interface LoreCardProps {
  card: {
    id: string;
    cardType: string;
    rarity: string;
    name: string;
    flavorText: string;
    milestone: string;
    xpValue: number;
    unlockedAt: string;
  };
  isNew?: boolean;
}

export const LoreCard: React.FC<LoreCardProps> = ({ card, isNew = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const rarityClass = styles[card.rarity.toLowerCase()] || styles.common;

  return (
    <div 
      className={`${styles.cardContainer} ${isNew ? styles.isNew : ''}`}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`${styles.flipper} ${isFlipped ? styles.flipped : ''}`}>
        
        {/* Front of Card */}
        <div className={`${styles.cardFace} ${styles.cardFront} ${rarityClass}`}>
          {isNew && <div className={styles.newBadge}>NEW</div>}
          <div className={styles.typeIcon}>{getTypeIcon(card.cardType)}</div>
          
          <div className={styles.runeSymbol}>
            {getRuneSymbol(card.cardType)}
          </div>
          
          <div className={styles.cardHeader}>
            <h4 className={styles.cardName}>{card.name}</h4>
            <div className={styles.rarityLabel}>{card.rarity}</div>
          </div>
        </div>

        {/* Back of Card */}
        <div className={`${styles.cardFace} ${styles.cardBack} ${rarityClass}`}>
          <div className={styles.backContent}>
            <div className={styles.typeIconSmall}>{getTypeIcon(card.cardType)}</div>
            <h4 className={styles.cardNameSmall}>{card.name}</h4>
            <p className={styles.flavorText}>&ldquo;{card.flavorText}&rdquo;</p>
            <div className={styles.milestoneBlock}>
              <span className={styles.milestoneLabel}>Milestone</span>
              <span className={styles.milestoneText}>{card.milestone}</span>
            </div>
            <div className={styles.xpBadge}>+{card.xpValue} XP</div>
          </div>
        </div>

      </div>
    </div>
  );
};

function getTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'achievement': return '🏆';
    case 'milestone': return '🚩';
    case 'discovery': return '👁️';
    case 'artifact': return '💎';
    default: return '📜';
  }
}

function getRuneSymbol(type: string) {
  switch (type.toLowerCase()) {
    case 'achievement': return 'ᚨ';
    case 'milestone': return 'ᛗ';
    case 'discovery': return 'ᚲ';
    case 'artifact': return 'ᛟ';
    default: return 'ᚱ';
  }
}
