'use client';

import styles from './DashboardTabs.module.css';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'overview', label: '⚔️ Overview' },
  { id: 'character', label: '🧙 Character' },
  { id: 'chronicles', label: '📖 Chronicles' },
  { id: 'collection', label: '🃏 Collection' },
  { id: 'quests', label: '🎯 Quests' },
  { id: 'forge', label: '🔥 The Forge' },
  { id: 'fellowship', label: '🤝 Fellowship' },
];

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className={styles.tabContainer}>
      <nav className={styles.tabList} role="tablist">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`${styles.tab} ${isActive ? styles.active : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className={styles.tabLabel}>{tab.label}</span>
              {isActive && <div className={styles.indicator} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
