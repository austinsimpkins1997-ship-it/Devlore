'use client';

import React, { useState } from 'react';
import styles from './PricingTable.module.css';
import { Button } from '../ui/Button';

export const PricingTable: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className={styles.pricingSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>Choose Your Path</h2>
        <p className={styles.subtitle}>Unlock the full potential of your developer saga.</p>
        
        <div className={styles.toggleWrapper}>
          <span className={`${styles.toggleLabel} ${!isAnnual ? styles.active : ''}`}>Monthly</span>
          <button 
            className={styles.toggleBtn} 
            onClick={() => setIsAnnual(!isAnnual)}
            aria-pressed={isAnnual}
          >
            <span className={`${styles.toggleKnob} ${isAnnual ? styles.knobAnnual : ''}`} />
          </button>
          <span className={`${styles.toggleLabel} ${isAnnual ? styles.active : ''}`}>
            Annually <span className={styles.discountBadge}>Save 20%</span>
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        {/* FREE TIER */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.tierName}>Wanderer</h3>
            <div className={styles.priceBlock}>
              <span className={styles.currency}>$</span>
              <span className={styles.price}>0</span>
              <span className={styles.period}>/mo</span>
            </div>
            <p className={styles.tierDesc}>Begin your journey and see what DevLore is about.</p>
          </div>
          
          <ul className={styles.featureList}>
            <li className={styles.included}>Basic Hero Card</li>
            <li className={styles.included}>First 3 Saga Chapters</li>
            <li className={styles.included}>Common & Uncommon Lore Cards</li>
            <li className={styles.excluded}>Private Repositories</li>
            <li className={styles.excluded}>Custom Themes</li>
          </ul>
          
          <Button 
            variant="ghost" 
            className={styles.cta}
            onClick={() => window.location.href='/sign-in'}
          >
            Start Free
          </Button>
        </div>

        {/* PRO TIER */}
        <div className={`${styles.card} ${styles.proCard}`}>
          <div className={styles.popularBadge}>Most Popular</div>
          <div className={styles.cardHeader}>
            <h3 className={styles.tierName}>Hero</h3>
            <div className={styles.priceBlock}>
              <span className={styles.currency}>$</span>
              <span className={styles.price}>{isAnnual ? '9' : '12'}</span>
              <span className={styles.period}>/mo</span>
            </div>
            <p className={styles.tierDesc}>Unlock your full history and advanced stats.</p>
          </div>
          
          <ul className={styles.featureList}>
            <li className={styles.included}>Everything in Wanderer</li>
            <li className={styles.included}>Unlimited Saga Chapters</li>
            <li className={styles.included}>Rare & Epic Lore Cards</li>
            <li className={styles.included}>Private Repositories Support</li>
            <li className={styles.excluded}>Custom Domains</li>
          </ul>
          
          <Button 
            variant="primary" 
            className={styles.cta}
            onClick={() => window.location.href='/sign-in?plan=pro'}
          >
            Begin Your Legend
          </Button>
        </div>

        {/* LEGEND TIER */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.tierName}>Legend</h3>
            <div className={styles.priceBlock}>
              <span className={styles.currency}>$</span>
              <span className={styles.price}>{isAnnual ? '19' : '25'}</span>
              <span className={styles.period}>/mo</span>
            </div>
            <p className={styles.tierDesc}>For the elite coders who want ultimate customization.</p>
          </div>
          
          <ul className={styles.featureList}>
            <li className={styles.included}>Everything in Hero</li>
            <li className={styles.included}>Legendary Animated Cards</li>
            <li className={styles.included}>Custom Domains</li>
            <li className={styles.included}>Custom Hero Themes</li>
            <li className={styles.included}>API Access</li>
          </ul>
          
          <Button 
            variant="secondary" 
            className={styles.cta}
            onClick={() => window.location.href='/sign-in?plan=legend'}
          >
            Become Legendary
          </Button>
        </div>
      </div>
    </section>
  );
};
