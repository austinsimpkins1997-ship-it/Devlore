'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const FEATURES_ITEMS = [
  {
    icon: '✦',
    title: 'Origin Story',
    desc: 'AI writes your mythic backstory from your commits',
    href: '/#origin-story',
  },
  {
    icon: '📖',
    title: 'Weekly Chronicles',
    desc: 'A new chapter every week, automatically',
    href: '/#weekly-chapters',
  },
  {
    icon: '🃏',
    title: 'Lore Cards',
    desc: 'Collectible cards for milestones & streaks',
    href: '/#lore-cards',
  },
  {
    icon: '⚔️',
    title: 'Hero Classes',
    desc: '12 archetypes assigned from your coding style',
    href: '/#hero-classes',
  },
  {
    icon: '🌐',
    title: 'Public Codex',
    desc: 'A shareable page that is your developer identity',
    href: '/#public-codex',
  },
  {
    icon: '📊',
    title: 'XP & Levels',
    desc: 'Real progression tied to your real GitHub activity',
    href: '/#xp-levels',
  },
  {
    icon: '🎯',
    title: 'Quests & Milestones',
    desc: 'Daily and weekly quests with claimable XP',
    href: '/dashboard',
  },
  {
    icon: '🏆',
    title: 'Weekly Trophies',
    desc: 'Best Forge submission wins the Champion’s Quill',
    href: '/leaderboard',
  },
  {
    icon: '🗡️',
    title: 'Gear & Loot',
    desc: 'Every level drops equipment that powers your Arena score',
    href: '/dashboard',
  },
  {
    icon: '🤝',
    title: 'Fellowship',
    desc: 'Add friends, message them, and browse every hero',
    href: '/heroes',
  },
];

const WHY_ITEMS = [
  {
    icon: '🚀',
    title: 'For Developers',
    desc: 'Make coding feel meaningful every single day',
    href: '/why#developers',
  },
  {
    icon: '💼',
    title: 'As a Portfolio',
    desc: 'A living, narrative proof of your work',
    href: '/why#portfolio',
  },
  {
    icon: '🏆',
    title: 'Stay Motivated',
    desc: 'Streaks, XP and chapters keep you showing up',
    href: '/why#motivation',
  },
  {
    icon: '🤝',
    title: 'For Teams',
    desc: 'Shared sagas for org-wide contributions',
    href: '/why#teams',
  },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMouseEnter = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <nav
      ref={navRef}
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="DevLore home">
          <span className={styles.logoRune}>⚔</span>
          <span className={styles.logoText}>DEVLORE</span>
        </Link>

        {/* Desktop Nav */}
        <div className={styles.links}>
          {/* Features Dropdown */}
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => handleMouseEnter('features')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`${styles.navBtn} ${openDropdown === 'features' ? styles.navBtnActive : ''}`}
              aria-expanded={openDropdown === 'features'}
              aria-haspopup="true"
              id="nav-features"
            >
              Features
              <span className={`${styles.chevron} ${openDropdown === 'features' ? styles.chevronUp : ''}`}>›</span>
            </button>
            {openDropdown === 'features' && (
              <div className={styles.dropdown} role="menu" aria-labelledby="nav-features">
                <div className={styles.dropdownGrid}>
                  {FEATURES_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={styles.dropdownItem}
                      role="menuitem"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <span className={styles.dropdownIcon}>{item.icon}</span>
                      <div>
                        <div className={styles.dropdownTitle}>{item.title}</div>
                        <div className={styles.dropdownDesc}>{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Why DevLore Dropdown */}
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => handleMouseEnter('why')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`${styles.navBtn} ${isActive('/why') || openDropdown === 'why' ? styles.navBtnActive : ''}`}
              aria-expanded={openDropdown === 'why'}
              aria-haspopup="true"
              id="nav-why"
            >
              Why DevLore?
              <span className={`${styles.chevron} ${openDropdown === 'why' ? styles.chevronUp : ''}`}>›</span>
            </button>
            {openDropdown === 'why' && (
              <div className={styles.dropdown} role="menu" aria-labelledby="nav-why">
                <div className={styles.dropdownSingle}>
                  {WHY_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={styles.dropdownItem}
                      role="menuitem"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <span className={styles.dropdownIcon}>{item.icon}</span>
                      <div>
                        <div className={styles.dropdownTitle}>{item.title}</div>
                        <div className={styles.dropdownDesc}>{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                  <div className={styles.dropdownDivider} />
                  <Link href="/why" className={styles.dropdownFullLink} onClick={() => setOpenDropdown(null)}>
                    Read the full story → Why DevLore exists
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/pricing" className={`${styles.navLink} ${isActive('/pricing') ? styles.navLinkActive : ''}`}>
            Pricing
          </Link>
          <Link href="/quiz" className={`${styles.navLink} ${styles.navLinkQuiz} ${isActive('/quiz') ? styles.navLinkActive : ''}`}>
            ⚡ Hero Quiz
          </Link>
          <Link href="/arena" className={`${styles.navLink} ${isActive('/arena') ? styles.navLinkActive : ''}`}>
            ⚔️ Arena
          </Link>
          <Link href="/leaderboard" className={`${styles.navLink} ${isActive('/leaderboard') ? styles.navLinkActive : ''}`}>
            🏆 Leaderboard
          </Link>
          <Link href="/heroes" className={`${styles.navLink} ${isActive('/heroes') ? styles.navLinkActive : ''}`}>
            🧭 Heroes
          </Link>
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <Link href="/sign-in" className={styles.ctaBtn} id="nav-signin">
            Begin Your Legend
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          <span className={`${styles.bar} ${mobileOpen ? styles.barOpen1 : ''}`} />
          <span className={`${styles.bar} ${mobileOpen ? styles.barOpen2 : ''}`} />
          <span className={`${styles.bar} ${mobileOpen ? styles.barOpen3 : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileSection}>
            <div className={styles.mobileSectionTitle}>Features</div>
            {FEATURES_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.icon}</span> {item.title}
              </Link>
            ))}
          </div>
          <div className={styles.mobileSection}>
            <div className={styles.mobileSectionTitle}>Why DevLore?</div>
            {WHY_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.icon}</span> {item.title}
              </Link>
            ))}
          </div>
          <div className={styles.mobileSection}>
            <Link href="/pricing" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              💎 Pricing
            </Link>
            <Link href="/arena" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              ⚔️ Arena
            </Link>
            <Link href="/leaderboard" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              🏆 Leaderboard
            </Link>
            <Link href="/heroes" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              🧭 Heroes
            </Link>
          </div>
          <Link href="/sign-in" className={styles.mobileCta} onClick={() => setMobileOpen(false)}>
            Begin Your Legend
          </Link>
        </div>
      )}
    </nav>
  );
};
