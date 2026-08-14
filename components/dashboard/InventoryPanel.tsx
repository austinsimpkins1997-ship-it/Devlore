'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './InventoryPanel.module.css';

interface InventoryItem {
  id: string;
  slot: 'WEAPON' | 'ARMOR' | 'HELM' | 'RELIC';
  rarity: 'RARE' | 'EPIC' | 'UNIQUE' | 'LEGENDARY';
  name: string;
  flavorText: string;
  power: number;
  levelAwarded: number;
  equipped: boolean;
}

const SLOT_ICONS: Record<InventoryItem['slot'], string> = {
  WEAPON: '⚔️',
  ARMOR: '🛡️',
  HELM: '⛑️',
  RELIC: '🔮',
};

const RARITY_COLOR: Record<InventoryItem['rarity'], string> = {
  RARE: 'var(--rarity-rare)',
  EPIC: 'var(--rarity-epic)',
  UNIQUE: '#f97316',
  LEGENDARY: 'var(--rarity-legendary)',
};

const RARITY_ORDER: Record<InventoryItem['rarity'], number> = {
  LEGENDARY: 0,
  UNIQUE: 1,
  EPIC: 2,
  RARE: 3,
};

type Filter = 'ALL' | 'EQUIPPED' | InventoryItem['slot'];
type SortKey = 'power' | 'rarity' | 'level' | 'name';

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'EQUIPPED', label: '✓ Equipped' },
  { id: 'WEAPON', label: '⚔️ Weapons' },
  { id: 'ARMOR', label: '🛡️ Armor' },
  { id: 'HELM', label: '⛑️ Helms' },
  { id: 'RELIC', label: '🔮 Relics' },
];

export default function InventoryPanel() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [sort, setSort] = useState<SortKey>('power');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/character');
      if (!res.ok) throw new Error('Failed to load inventory');
      const data = await res.json();
      setItems(data.equipment ?? []);
      setError(null);
    } catch {
      setError('Could not load your inventory. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleEquip = async (item: InventoryItem) => {
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

  const equipped = useMemo(() => items.filter((i) => i.equipped), [items]);
  const equippedPower = equipped.reduce((sum, i) => sum + i.power, 0);
  const totalPower = items.reduce((sum, i) => sum + i.power, 0);
  const bestItem = useMemo(
    () => items.reduce<InventoryItem | null>((best, i) => (!best || i.power > best.power ? i : best), null),
    [items],
  );

  const visible = useMemo(() => {
    const filtered = items.filter((i) => {
      if (filter === 'ALL') return true;
      if (filter === 'EQUIPPED') return i.equipped;
      return i.slot === filter;
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'rarity':
          return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] || b.power - a.power;
        case 'level':
          return b.levelAwarded - a.levelAwarded;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.power - a.power;
      }
    });
    return sorted;
  }, [items, filter, sort]);

  if (loading) return <div className={styles.stateMsg}>Opening your pack…</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.summary}>
        <div className={styles.summaryBox}>
          <div className={styles.summaryValue}>{items.length}</div>
          <div className={styles.summaryLabel}>Items Owned</div>
        </div>
        <div className={styles.summaryBox}>
          <div className={styles.summaryValue}>{equipped.length}/4</div>
          <div className={styles.summaryLabel}>Slots Filled</div>
        </div>
        <div className={styles.summaryBox}>
          <div className={styles.summaryValue}>{equippedPower.toLocaleString()}</div>
          <div className={styles.summaryLabel}>Equipped Power</div>
        </div>
        <div className={styles.summaryBox}>
          <div className={styles.summaryValue}>{totalPower.toLocaleString()}</div>
          <div className={styles.summaryLabel}>Total Owned Power</div>
        </div>
        <div className={styles.summaryBox}>
          <div className={styles.summaryValue} style={{ fontSize: '0.95rem' }}>
            {bestItem ? bestItem.name : '—'}
          </div>
          <div className={styles.summaryLabel}>Finest Piece</div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {items.length === 0 ? (
        <div className={styles.empty}>
          Your pack is empty. Every level you gain drops one piece of equipment —
          rare, epic, unique, or legendary.
          <br />
          Earn XP in the Forge, claim quests, or generate a chapter to start levelling.
        </div>
      ) : (
        <>
          <div className={styles.controls}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`${styles.filterBtn} ${filter === f.id ? styles.filterActive : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
            <span className={styles.spacer} />
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort inventory"
            >
              <option value="power">Sort: Power</option>
              <option value="rarity">Sort: Rarity</option>
              <option value="level">Sort: Level found</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          {visible.length === 0 ? (
            <div className={styles.empty}>Nothing matches that filter.</div>
          ) : (
            <div className={styles.grid}>
              {visible.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.item} ${item.equipped ? styles.itemEquipped : ''}`}
                  style={{ borderLeftColor: RARITY_COLOR[item.rarity] }}
                >
                  <div className={styles.itemHead}>
                    <span className={styles.itemIcon}>{SLOT_ICONS[item.slot]}</span>
                    <span>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <span className={styles.itemSlot}>
                        {item.slot} · found at level {item.levelAwarded}
                      </span>
                    </span>
                  </div>

                  <p className={styles.itemFlavor}>{item.flavorText}</p>

                  <div className={styles.itemStats}>
                    <span className={styles.rarityTag} style={{ color: RARITY_COLOR[item.rarity] }}>
                      {item.rarity}
                    </span>
                    <span className={styles.powerTag}>+{item.power} PWR</span>
                  </div>

                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => toggleEquip(item)}
                    className={`${styles.equipBtn} ${item.equipped ? styles.equipBtnOn : styles.equipBtnOff}`}
                  >
                    {busyId === item.id
                      ? 'Working…'
                      : item.equipped
                        ? '✓ Equipped — click to remove'
                        : 'Equip'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
