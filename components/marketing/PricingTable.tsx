'use client';

import React from 'react';
import styles from './PricingTable.module.css';
import { Button } from '../ui/Button';
import { UpgradeButton } from '../billing/UpgradeButton';

export const PricingTable: React.FC = () => {
  return (
    <section className={styles.pricingSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>Choose Your Path</h2>
        <p className={styles.subtitle}>
          Unlock the full potential of your developer saga. Paid tiers start with a 14-day free trial.
        </p>
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
            <li className={styles.included}>Hero card & AI origin story</li>
            <li className={styles.included}>Daily quests & milestone XP</li>
            <li className={styles.included}>The Forge, Arena & leaderboard</li>
            <li className={styles.included}>Weekly trophy eligibility</li>
            <li className={styles.excluded}>Automatic weekly chronicles</li>
            <li className={styles.excluded}>Weekly quest XP claims</li>
          </ul>

          <Button
            variant="ghost"
            className={styles.cta}
            onClick={() => (window.location.href = '/sign-in')}
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
              <span className={styles.price}>5</span>
              <span className={styles.period}>/mo</span>
            </div>
            <p className={styles.tierDesc}>Your saga writes itself — every single week.</p>
          </div>

          <ul className={styles.featureList}>
            <li className={styles.included}>Everything in Wanderer</li>
            <li className={styles.included}>Automatic weekly AI chronicles</li>
            <li className={styles.included}>Unlimited chapter history</li>
            <li className={styles.included}>Weekly quest XP claims</li>
            <li className={styles.included}>Chronicle emails & manual re-analysis</li>
          </ul>

          <UpgradeButton plan="PRO" label="Start 14-day trial" style={{ width: '100%' }} />
        </div>

        {/* LEGEND TIER */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.tierName}>Legend</h3>
            <div className={styles.priceBlock}>
              <span className={styles.currency}>$</span>
              <span className={styles.price}>15</span>
              <span className={styles.period}>/mo</span>
            </div>
            <p className={styles.tierDesc}>For heroes who want every edge in the realm.</p>
          </div>

          <ul className={styles.featureList}>
            <li className={styles.included}>Everything in Hero</li>
            <li className={styles.included}>1.5× XP on every quest claim</li>
            <li className={styles.included}>Unlimited lore card collection</li>
            <li className={styles.included}>Legend flair on the leaderboard</li>
            <li className={styles.included}>First access to new Legend features</li>
          </ul>

          <UpgradeButton plan="LEGEND" label="Become Legendary" style={{ width: '100%' }} />
        </div>
      </div>
    </section>
  );
};
