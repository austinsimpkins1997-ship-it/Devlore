'use client';

import React from 'react';
import styles from './LandingHero.module.css';
import { Button } from '../ui/Button';


export const LandingHero: React.FC = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.background}>
        <div className={styles.grid}></div>
        <div className={styles.particles}>
          {/* Pure CSS particles generated in module.css */}
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
        </div>
        <div className={styles.runes}>
          <span className={styles.rune} style={{ animationDelay: '0s', left: '10%', top: '20%' }}>ᛟ</span>
          <span className={styles.rune} style={{ animationDelay: '2s', right: '15%', top: '30%' }}>ᚨ</span>
          <span className={styles.rune} style={{ animationDelay: '1s', left: '20%', bottom: '20%' }}>ᚱ</span>
          <span className={styles.rune} style={{ animationDelay: '3s', right: '25%', bottom: '15%' }}>ᛗ</span>
        </div>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.titlePart}>Your commits.</span>
          <span className={styles.titlePart}>Your legend.</span>
        </h1>
        
        <p className={styles.subtitle}>
          Every push of code writes a new page in your epic saga. Join thousands of developers discovering their inner hero.
        </p>
        
        <div className={styles.actions}>
          <Button variant="primary" size="lg" onClick={() => window.location.href = '/sign-in'}>
            Begin Your Legend
          </Button>
          <Button variant="ghost" size="lg" onClick={() => document.getElementById('demo-saga')?.scrollIntoView({ behavior: 'smooth' })}>
            See a Demo Saga
          </Button>
        </div>

        <div className={styles.archetypesCarousel}>
          <div className={styles.archetypeCard}>
            <span className={styles.archIcon}>🔮</span>
            <span className={styles.archName}>Arcane Architect</span>
          </div>
          <div className={styles.archetypeCard}>
            <span className={styles.archIcon}>⚔️</span>
            <span className={styles.archName}>Code Knight</span>
          </div>
          <div className={styles.archetypeCard}>
            <span className={styles.archIcon}>🌿</span>
            <span className={styles.archName}>Logic Druid</span>
          </div>
        </div>
      </div>

      <div className={styles.scrollIndicator}>
        <span className={styles.chevron}>↓</span>
      </div>
    </section>
  );
};
