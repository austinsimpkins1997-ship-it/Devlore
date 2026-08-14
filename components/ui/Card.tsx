import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  variant?: 'default' | 'glass' | 'rune';
  glow?: 'gold' | 'arcane' | 'none';
  hoverable?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  glow = 'none',
  hoverable = false,
  children,
  className = '',
  style,
  onClick,
}) => {
  const classNames = [
    styles.card,
    styles[variant],
    glow !== 'none' ? styles[`glow-${glow}`] : '',
    hoverable ? styles.hoverable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} style={style} onClick={onClick}>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
