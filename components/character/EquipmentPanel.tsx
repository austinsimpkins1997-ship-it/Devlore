'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { HeroAvatar } from './HeroAvatar';
import { CharacterCreator } from './CharacterCreator';
import styles from './EquipmentPanel.module.css';
import type { CharacterAppearance } from '@/lib/character';

interface EquipmentItem {
  id: string;
  slot: 'WEAPON' | 'ARMOR' | 'HELM' | 'RELIC';
  rarity: 'RARE' | 'EPIC' | 'UNIQUE' | 'LEGENDARY';
  name: string;
  flavorText: string;
  power: number;
  levelAwarded: number;
  equipped: boolean;
}

interface StatSheet {
  stats: { might: number; wisdom: number; endurance: number; fortune: number; total: number };
  bonuses: Array<{ label: string; detail: string; amount: number }>;
  gearPower: number;
  equippedCount: number;
}

interface CharacterData {
  appearance: CharacterAppearance;
  charCreated: boolean;
  hero: {
    displayName: string | null;
    username: string | null;
    heroClass: string | null;
    heroTitle: string | null;
    level: number;
    xp: number;
    tier: string;
  };
  equipment: EquipmentItem[];
  sheet: StatSheet;
}

const SLOT_ORDER: EquipmentItem['slot'][] = ['HELM', 'WEAPON', 'ARMOR', 'RELIC'];

const SLOT_ICONS: Record<EquipmentItem['slot'], string> = {
  WEAPON: '⚔️',
  ARMOR: '🛡️',
  HELM: '⛑️',
  RELIC: '🔮',
};

const RARITY_COLOR: Record<EquipmentItem['rarity'], string> = {
  RARE: 'var(--rarity-rare)',
  EPIC: 'var(--rarity-epic)',
  UNIQUE: '#f97316',
  LEGENDARY: 'var(--rarity-legendary)',
};

function SlotButton({
  slot,
  item,
  onToggle,
}: {
  slot: EquipmentItem['slot'];
  item: EquipmentItem | undefined;
  onToggle: (item: EquipmentItem) => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.slot} ${item ? styles.slotFilled : ''}`}
      style={item ? { borderColor: RARITY_COLOR[item.rarity] } : undefined}
      title={item ? `${item.name} — click to unequip` : `${slot}: empty`}
      onClick={() => item && onToggle(item)}
    >
      <span className={styles.slotIcon}>{SLOT_ICONS[slot]}</span>
      <span className={styles.slotLabel}>{slot}</span>
      {item && <span className={styles.slotPower}>+{item.power}</span>}
    </button>
  );
}

export default function EquipmentPanel() {
  const [data, setData] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/character');
      if (!res.ok) throw new Error('Failed to load character');
      setData(await res.json());
      setError(null);
    } catch {
      setError('Could not load your character. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleEquip = async (item: EquipmentItem) => {
    if (busyId) return;
    setBusyId(item.id);
    setError(null);
    try {
      const res = await fetch('/api/equipment/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId: item.id, equip: !item.equipped }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(typeof payload?.error === 'string' ? payload.error : 'Could not change gear');
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change gear');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className={styles.stateMsg}>Opening the armory...</div>;
  if (error && !data) return <div className={styles.stateMsg}>{error}</div>;
  if (!data) return null;

  if (editing) {
    return (
      <CharacterCreator
        initial={data.appearance}
        onSaved={async () => {
          setEditing(false);
          await load();
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const equippedBySlot = new Map(
    data.equipment.filter((e) => e.equipped).map((e) => [e.slot, e]),
  );
  const equippedSlots = Array.from(equippedBySlot.keys());
  const { stats, bonuses } = data.sheet;

  return (
    <div className={styles.panel}>
      <div className={styles.dollColumn}>
        <h2 className={styles.title}>Equipment</h2>
        <div className={styles.dollRow}>
          <div className={styles.slotStack}>
            <SlotButton slot="HELM" item={equippedBySlot.get('HELM')} onToggle={toggleEquip} />
            <SlotButton slot="ARMOR" item={equippedBySlot.get('ARMOR')} onToggle={toggleEquip} />
          </div>
          <div className={styles.dollFrame}>
            <HeroAvatar appearance={data.appearance} size={190} equippedSlots={equippedSlots} />
          </div>
          <div className={styles.slotStack}>
            <SlotButton slot="WEAPON" item={equippedBySlot.get('WEAPON')} onToggle={toggleEquip} />
            <SlotButton slot="RELIC" item={equippedBySlot.get('RELIC')} onToggle={toggleEquip} />
          </div>
        </div>
        <p className={styles.heroName}>{data.hero.displayName ?? data.hero.username}</p>
        <p className={styles.heroMeta}>
          {data.hero.heroClass ?? 'Adventurer'} · Level {data.hero.level}
        </p>
        <button type="button" className={styles.editLink} onClick={() => setEditing(true)}>
          ✎ Customize appearance
        </button>
      </div>

      <div className={styles.statsColumn}>
        <div>
          <h3 className={styles.subTitle}>Combat Stats</h3>
          <div className={styles.statGrid}>
            {[
              ['Might', stats.might],
              ['Wisdom', stats.wisdom],
              ['Endurance', stats.endurance],
              ['Fortune', stats.fortune],
            ].map(([label, value]) => (
              <div key={label as string} className={styles.statBox}>
                <div className={styles.statLabel}>{label}</div>
                <div className={styles.statValue}>{(value as number).toLocaleString()}</div>
              </div>
            ))}
            <div className={`${styles.statBox} ${styles.totalBox}`}>
              <div className={styles.statLabel}>Total Power</div>
              <div className={`${styles.statValue} ${styles.totalValue}`}>
                {stats.total.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className={styles.subTitle}>Active Bonuses</h3>
          {bonuses.length === 0 ? (
            <p className={styles.empty}>
              No bonuses yet — streaks, commits, languages, and trophies all add to your stats.
            </p>
          ) : (
            <ul className={styles.bonusList}>
              {bonuses.map((bonus) => (
                <li key={bonus.label} className={styles.bonusRow}>
                  <span>
                    <span className={styles.bonusLabel}>{bonus.label}</span>
                    <span className={styles.bonusDetail}>{bonus.detail}</span>
                  </span>
                  <span className={styles.bonusAmount}>+{bonus.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className={styles.subTitle}>Inventory ({data.equipment.length})</h3>
          {error && <p className={styles.error}>{error}</p>}
          {data.equipment.length === 0 ? (
            <p className={styles.empty}>
              Empty for now. Every level you gain drops a piece of gear.
            </p>
          ) : (
            <div className={styles.inventory}>
              {data.equipment.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => toggleEquip(item)}
                  className={`${styles.invItem} ${item.equipped ? styles.invItemEquipped : ''}`}
                  style={{ borderLeftColor: RARITY_COLOR[item.rarity] }}
                  title={item.flavorText}
                >
                  <span className={styles.invName}>
                    {SLOT_ICONS[item.slot]} {item.name}
                  </span>
                  <span className={styles.invMeta}>
                    <span className={styles.invRarity} style={{ color: RARITY_COLOR[item.rarity] }}>
                      {item.rarity}
                    </span>
                    <span className={styles.invPower}>+{item.power} PWR</span>
                  </span>
                  {item.equipped && <span className={styles.equipTag}>✓ Equipped</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
