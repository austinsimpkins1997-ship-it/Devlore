'use client';

import React from 'react';

const DAILY_QUESTS = [
  { id: 'dq1', title: 'The First Watch', desc: 'Make a commit or write a journal entry today', xp: 75, icon: '⚔️', difficulty: 'Easy' },
  { id: 'dq2', title: 'Chronicle Keeper', desc: 'Use The Forge to record today in your saga', xp: 100, icon: '📖', difficulty: 'Easy' },
  { id: 'dq3', title: 'The Comparison', desc: 'Visit the Arena to test your legend', xp: 50, icon: '🏟️', difficulty: 'Easy' },
];

const WEEKLY_QUESTS = [
  { id: 'wq1', title: 'The Relentless', desc: '5 consecutive days of commits this week', xp: 500, icon: '🔥', difficulty: 'Hard' },
  { id: 'wq2', title: 'The Polymath', desc: 'Commit in 3 different repositories', xp: 300, icon: '🌐', difficulty: 'Medium' },
  { id: 'wq3', title: 'The Scholar', desc: 'Generate a Forge entry longer than 100 words', xp: 200, icon: '📚', difficulty: 'Medium' },
  { id: 'wq4', title: 'Weekend Warrior', desc: 'Make commits on both Saturday and Sunday', xp: 350, icon: '🛡️', difficulty: 'Medium' },
];

const LEGENDARY_CHALLENGE = {
  id: 'lc1', title: 'The Iron Month', desc: 'Code every single day for 30 days straight', xp: 5000, icon: '👑', difficulty: 'Legendary'
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return '#22c55e'; // green
    case 'Medium': return '#3b82f6'; // blue
    case 'Hard': return '#ea580c'; // orange
    case 'Legendary': return '#f59e0b'; // gold
    default: return '#94a3b8';
  }
};

interface Quest {
  id: string;
  title: string;
  desc: string;
  xp: number;
  icon: string;
  difficulty: string;
}

const QuestCard = ({ quest }: { quest: Quest }) => {
  const color = getDifficultyColor(quest.difficulty);
  const isLegendary = quest.difficulty === 'Legendary';
  
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1.25rem',
        background: isLegendary ? 'linear-gradient(to right, rgba(245, 158, 11, 0.1), rgba(0,0,0,0.4))' : 'rgba(18, 18, 42, 0.6)',
        borderRadius: '0.75rem',
        borderLeft: `4px solid ${color}`,
        border: isLegendary ? `1px solid rgba(245, 158, 11, 0.3)` : undefined,
        borderLeftWidth: '4px',
        borderLeftColor: color,
        marginBottom: '1rem',
        boxShadow: isLegendary ? '0 0 15px rgba(245, 158, 11, 0.15)' : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ fontSize: '2rem', marginRight: '1.25rem' }}>{quest.icon}</div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: isLegendary ? '#f59e0b' : '#fff', fontSize: '1.1rem' }}>
          {quest.title}
        </h4>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-mist, #94a3b8)', fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>
          {quest.desc}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        <span style={{ 
          background: `rgba(${isLegendary ? '245, 158, 11' : '255, 255, 255'}, 0.1)`, 
          color: color, 
          padding: '0.25rem 0.5rem', 
          borderRadius: '0.25rem', 
          fontSize: '0.75rem', 
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {quest.difficulty}
        </span>
        <span style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>+{quest.xp} XP</span>
      </div>
      <button 
        onClick={() => alert('Quest tracking is live in Pro — coming to all tiers soon!')}
        style={{
          marginLeft: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
      >
        Claim XP
      </button>
    </div>
  );
};

export default function QuestsPanel() {
  const totalWeeklyXp = WEEKLY_QUESTS.reduce((acc, q) => acc + q.xp, 0);

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(13, 13, 26, 0.8)', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', color: '#fff' }}>Weekly Progress</h3>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: '0%', height: '100%', background: 'var(--color-rune, #f59e0b)' }} />
        </div>
        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-mist, #94a3b8)', fontSize: '0.85rem' }}>
          0 / {totalWeeklyXp} XP available this week
        </p>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#22c55e' }}>✦</span> Daily Quests
        </h2>
        {DAILY_QUESTS.map(q => <QuestCard key={q.id} quest={q} />)}
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#3b82f6' }}>✦</span> Weekly Quests
        </h2>
        {WEEKLY_QUESTS.map(q => <QuestCard key={q.id} quest={q} />)}
      </div>

      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#f59e0b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textShadow: '0 0 10px rgba(245, 158, 11, 0.5)' }}>
          <span style={{ color: '#f59e0b' }}>✧</span> Legendary Challenge <span style={{ color: '#f59e0b' }}>✧</span>
        </h2>
        <QuestCard quest={LEGENDARY_CHALLENGE} />
      </div>
    </div>
  );
}
