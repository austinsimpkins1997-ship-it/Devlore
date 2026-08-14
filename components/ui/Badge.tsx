import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant: 'tier' | 'rarity' | 'class' | 'level';
  value: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, value }) => {
  const isRarity = variant === 'rarity';
  const rarityClass = isRarity ? styles[value.toLowerCase()] : '';
  
  return (
    <span className={`${styles.badge} ${styles[variant]} ${rarityClass}`}>
      {value}
    </span>
  );
};
