'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './DemoSaga.module.css';
import { HeroCard } from '../saga/HeroCard';
import { ChapterCard } from '../saga/ChapterCard';
import { LoreCard } from '../saga/LoreCard';
import { Button } from '../ui/Button';

const DEMO_HERO = {
  displayName: "DemoHero",
  username: "demo_hero",
  avatarUrl: null,
  heroClass: "Arcane Architect",
  heroTitle: "Weaver of the Front-End Arts",
  heroClassSlug: "arcane-architect",
  level: 42,
  xp: 42850,
  tier: "PRO",
  currentStreak: 12,
  longestStreak: 45,
  totalCommits: 1337,
  firstCommitDate: "2020-01-01T00:00:00Z"
};

const DEMO_CHAPTER = {
  id: "demo-chap-1",
  number: 42,
  title: "The Great Refactoring",
  summary: "In which our hero boldly dismantled the monolith, braving the spaghetti code to emerge victorious with a decoupled micro-frontend architecture.",
  weekStart: "2023-10-15T00:00:00Z",
  weekEnd: "2023-10-21T00:00:00Z",
  commitCount: 54,
  xpEarned: 1200,
  createdAt: "2023-10-22T00:00:00Z"
};

const DEMO_LORE = {
  id: "demo-lore-1",
  cardType: "Achievement",
  rarity: "Legendary",
  name: "Monolith Breaker",
  flavorText: "It took a hundred PRs, but the beast finally fell.",
  milestone: "100th PR Merged",
  xpValue: 500,
  unlockedAt: "2023-10-20T00:00:00Z"
};

export const DemoSaga: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="demo-saga" ref={sectionRef} className={styles.demoSection}>
      <div className={styles.container}>
        
        <div className={styles.textColumn}>
          <div className={styles.badge}>Live Demo</div>
          <h2 className={styles.heading}>Your GitHub history,<br/>reimagined.</h2>
          <p className={styles.description}>
            We transform your raw git commits and pull requests into an immersive fantasy narrative. Watch your developer profile evolve into a legendary hero card.
          </p>
          
          <ul className={styles.featureList}>
            <li>✨ AI-generated weekly chapters based on your actual code</li>
            <li>🃏 Collectible lore cards for your milestones</li>
            <li>📈 Meaningful progression and XP tracking</li>
          </ul>

          <div className={styles.cta}>
            <Button size="lg" onClick={() => window.location.href='/sign-in'}>
              Connect GitHub to Begin
            </Button>
          </div>
        </div>

        <div className={`${styles.visualColumn} ${isVisible ? styles.visible : ''}`}>
          <div className={styles.mockupContainer}>
            <div className={styles.heroWrapper}>
              <HeroCard {...DEMO_HERO} />
            </div>
            
            <div className={styles.chapterWrapper}>
              <ChapterCard 
                chapter={DEMO_CHAPTER} 
                onRead={() => {}} 
              />
            </div>
            
            <div className={styles.loreWrapper}>
              <LoreCard card={DEMO_LORE} isNew={true} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
