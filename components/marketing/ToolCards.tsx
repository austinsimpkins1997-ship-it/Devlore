'use client';

import Link from 'next/link';
import styles from './ToolCards.module.css';

export function ToolCards() {
  return (
    <div>
      <div className={styles.grid}>
        {/* Quiz Card */}
        <Link href="/quiz" className={styles.cardLink}>
          <div className={`${styles.card} ${styles.quizCard}`}>
            <div className={`${styles.topBar} ${styles.quizBar}`} />
            <div className={styles.cardEmoji}>⚡</div>
            <div className={`${styles.cardTitle} ${styles.quizTitle}`}>Hero Class Quiz</div>
            <div className={styles.cardMeta}>8 Questions · 30 Seconds</div>
            <p className={styles.cardBody}>
              Are you an Arcane Architect? A Chaos Mage? A Data Druid? Answer 8 questions and discover your hero class — no GitHub, no account, just you and your instincts.
            </p>
            <div className={styles.tagRow}>
              {['🏛️ Arcane Architect', '🔥 Chaos Mage', '🌿 Data Druid', '+5 more'].map((c) => (
                <span key={c} className={`${styles.tag} ${styles.quizTag}`}>{c}</span>
              ))}
            </div>
            <div className={`${styles.cta} ${styles.quizCta}`}>
              Discover Your Class →
            </div>
          </div>
        </Link>

        {/* Arena Card */}
        <Link href="/arena" className={styles.cardLink}>
          <div className={`${styles.card} ${styles.arenaCard}`}>
            <div className={`${styles.topBar} ${styles.arenaBar}`} />
            <div className={styles.cardEmoji}>⚔️</div>
            <div className={`${styles.cardTitle} ${styles.arenaTitle}`}>The Arena</div>
            <div className={styles.cardMeta}>Two Heroes · One Saga</div>
            <p className={styles.cardBody}>
              Enter two GitHub usernames and watch DevLore narrate an epic battle of commits, streaks, and lore. Who built the greater legend? Find out.
            </p>
            <div className={styles.tagRow}>
              {['📊 Commit count', '🔥 Streak battle', '🌐 Language mastery', '⚡ Lore score'].map((c) => (
                <span key={c} className={`${styles.tag} ${styles.arenaTag}`}>{c}</span>
              ))}
            </div>
            <div className={`${styles.cta} ${styles.arenaCta}`}>
              Enter the Arena →
            </div>
          </div>
        </Link>
      </div>

      {/* The Forge teaser */}
      <div className={styles.forgeBanner}>
        <div className={styles.forgeBannerLeft}>
          <span className={styles.forgeEmoji}>🔥</span>
          <div>
            <div className={styles.forgeTitle}>The Forge</div>
            <div className={styles.forgeBody}>
              Describe ANYTHING you did — code, design, learning, exercise — and AI turns it into saga prose. Non-coders welcome.
            </div>
          </div>
        </div>
        <Link href="/sign-in" className={styles.forgeCta}>
          Try The Forge →
        </Link>
      </div>
    </div>
  );
}
