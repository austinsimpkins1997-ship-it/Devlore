import React from 'react';
import styles from './Armory.module.css';

export interface EquipmentDisplay {
  id: string;
  slot: 'WEAPON' | 'ARMOR' | 'HELM' | 'RELIC';
  rarity: 'RARE' | 'EPIC' | 'UNIQUE' | 'LEGENDARY';
  name: string;
  flavorText: string;
  power: number;
  levelAwarded: number;
}

const SLOT_ICONS: Record<EquipmentDisplay['slot'], string> = {
  WEAPON: '⚔️',
  ARMOR: '🛡️',
  HELM: '⛑️',
  RELIC: '🔮',
};

const RARITY_CLASS: Record<EquipmentDisplay['rarity'], string> = {
  RARE: styles.rare,
  EPIC: styles.epic,
  UNIQUE: styles.unique,
  LEGENDARY: styles.legendary,
};

const RARITY_COLOR: Record<EquipmentDisplay['rarity'], string> = {
  RARE: 'var(--rarity-rare)',
  EPIC: 'var(--rarity-epic)',
  UNIQUE: '#f97316',
  LEGENDARY: 'var(--rarity-legendary)',
};

interface ArmoryProps {
  equipment: EquipmentDisplay[];
  title?: string;
}

/** Presentational armory — pure, renders in server and client trees. */
export function Armory({ equipment, title = '🗡️ The Armory' }: ArmoryProps) {
  const totalPower = equipment.reduce((sum, item) => sum + item.power, 0);

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.power}>
          {equipment.length} item{equipment.length === 1 ? '' : 's'} · {totalPower.toLocaleString()} gear power
        </span>
      </div>
      {equipment.length === 0 ? (
        <p className={styles.empty}>
          No equipment yet. Every level you gain drops a piece of gear — rare, epic, unique, or
          legendary — and its power counts toward your Arena battle score.
        </p>
      ) : (
        <div className={styles.grid}>
          {equipment.map((item) => (
            <div key={item.id} className={`${styles.item} ${RARITY_CLASS[item.rarity]}`}>
              <div className={styles.itemHeader}>
                <span className={styles.slotIcon}>{SLOT_ICONS[item.slot]}</span>
                <h3 className={styles.itemName}>{item.name}</h3>
              </div>
              <p className={styles.itemFlavor}>{item.flavorText}</p>
              <div className={styles.itemMeta}>
                <span className={styles.rarityTag} style={{ color: RARITY_COLOR[item.rarity] }}>
                  {item.rarity}
                </span>
                <span className={styles.powerTag}>
                  +{item.power} PWR · Lv {item.levelAwarded}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
