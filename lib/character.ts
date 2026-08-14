// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Character appearance & combat stats
//
// Appearance options are a fixed catalog (validated server-side). Stats are
// derived from equipped gear, level, verified GitHub activity, and tier —
// so "higher achieving coders" carry real, earned bonuses into the Arena.
// ─────────────────────────────────────────────────────────────────────────────

import type { Tier } from '@/types';

// ── Appearance catalog ───────────────────────────────────────────────────────

export interface AppearanceOption {
  id: string;
  label: string;
  /** Hex color used by the paper-doll renderer. */
  color: string;
}

export const BODIES: readonly AppearanceOption[] = [
  { id: 'neutral', label: 'Balanced', color: '#8b7355' },
  { id: 'broad', label: 'Broad', color: '#8b7355' },
  { id: 'lithe', label: 'Lithe', color: '#8b7355' },
];

export const SKINS: readonly AppearanceOption[] = [
  { id: 'porcelain', label: 'Porcelain', color: '#f1d3bd' },
  { id: 'umber', label: 'Umber', color: '#c79067' },
  { id: 'bronze', label: 'Bronze', color: '#a3663d' },
  { id: 'ebony', label: 'Ebony', color: '#6b4429' },
  { id: 'ashen', label: 'Ashen', color: '#b8b0c4' },
];

export const HAIRS: readonly AppearanceOption[] = [
  { id: 'raven', label: 'Raven', color: '#1c1c22' },
  { id: 'ember', label: 'Ember', color: '#a3401f' },
  { id: 'wheat', label: 'Wheat', color: '#d6b46a' },
  { id: 'frost', label: 'Frost', color: '#dfe6f0' },
  { id: 'arcane', label: 'Arcane', color: '#8b5cf6' },
];

export const CLOAKS: readonly AppearanceOption[] = [
  { id: 'wanderer', label: 'Wanderer Grey', color: '#4b5162' },
  { id: 'scholar', label: 'Scholar Blue', color: '#2f5b8c' },
  { id: 'verdant', label: 'Verdant', color: '#2f6b4a' },
  { id: 'crimson', label: 'Crimson', color: '#8c2f34' },
  { id: 'void', label: 'Voidweave', color: '#221b3a' },
];

export const AURAS: readonly AppearanceOption[] = [
  { id: 'none', label: 'None', color: 'transparent' },
  { id: 'rune', label: 'Rune Glow', color: '#c9a84c' },
  { id: 'arcane', label: 'Arcane Pulse', color: '#7c3aed' },
  { id: 'ember', label: 'Ember Halo', color: '#f97316' },
];

export interface CharacterAppearance {
  charBody: string;
  charSkin: string;
  charHair: string;
  charCloak: string;
  charAura: string;
}

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  charBody: 'neutral',
  charSkin: 'umber',
  charHair: 'raven',
  charCloak: 'wanderer',
  charAura: 'none',
};

function pick(options: readonly AppearanceOption[], id: string, fallback: string): string {
  return options.some((o) => o.id === id) ? id : fallback;
}

/** Validates an appearance payload against the catalog (never trusts input). */
export function sanitizeAppearance(input: Partial<CharacterAppearance>): CharacterAppearance {
  return {
    charBody: pick(BODIES, input.charBody ?? '', DEFAULT_APPEARANCE.charBody),
    charSkin: pick(SKINS, input.charSkin ?? '', DEFAULT_APPEARANCE.charSkin),
    charHair: pick(HAIRS, input.charHair ?? '', DEFAULT_APPEARANCE.charHair),
    charCloak: pick(CLOAKS, input.charCloak ?? '', DEFAULT_APPEARANCE.charCloak),
    charAura: pick(AURAS, input.charAura ?? '', DEFAULT_APPEARANCE.charAura),
  };
}

export function colorOf(options: readonly AppearanceOption[], id: string): string {
  return options.find((o) => o.id === id)?.color ?? options[0].color;
}

// ── Combat stats ─────────────────────────────────────────────────────────────

export interface CombatStats {
  might: number;
  wisdom: number;
  endurance: number;
  fortune: number;
  /** Sum of the four attributes — the gear/bonus contribution to battle score. */
  total: number;
}

export interface StatBonus {
  label: string;
  detail: string;
  amount: number;
}

export interface StatSheet {
  stats: CombatStats;
  bonuses: StatBonus[];
  gearPower: number;
  equippedCount: number;
}

export interface StatInputs {
  level: number;
  tier: Tier;
  currentStreak: number;
  longestStreak: number;
  totalCommits: number;
  languageCount: number;
  openSourceContribCount: number;
  trophyCount: number;
  equipped: Array<{ slot: string; rarity: string; power: number }>;
}

/** Each slot channels its gear power into a different attribute. */
const SLOT_ATTRIBUTE: Record<string, keyof Omit<CombatStats, 'total'>> = {
  WEAPON: 'might',
  HELM: 'wisdom',
  ARMOR: 'endurance',
  RELIC: 'fortune',
};

/** Activity bonuses reward heroes who actually keep shipping. */
const TIER_MULTIPLIER: Record<Tier, number> = {
  FREE: 1,
  PRO: 1.1,
  LEGEND: 1.25,
};

export function computeStatSheet(input: StatInputs): StatSheet {
  const base: CombatStats = { might: 0, wisdom: 0, endurance: 0, fortune: 0, total: 0 };

  // Gear contribution — only equipped items count.
  let gearPower = 0;
  for (const item of input.equipped) {
    const attr = SLOT_ATTRIBUTE[item.slot] ?? 'might';
    base[attr] += item.power;
    gearPower += item.power;
  }

  // Level baseline
  base.might += input.level * 3;
  base.wisdom += input.level * 3;
  base.endurance += input.level * 3;
  base.fortune += input.level * 2;

  const bonuses: StatBonus[] = [];

  const addBonus = (
    label: string,
    detail: string,
    attr: keyof Omit<CombatStats, 'total'>,
    amount: number,
  ) => {
    if (amount <= 0) return;
    base[attr] += amount;
    bonuses.push({ label, detail, amount });
  };

  addBonus(
    'Active Streak',
    `${input.currentStreak}-day current streak`,
    'endurance',
    input.currentStreak * 4,
  );
  addBonus(
    'Peak Discipline',
    `${input.longestStreak}-day best streak`,
    'endurance',
    Math.floor(input.longestStreak * 1.5),
  );
  addBonus(
    'Prolific Hand',
    `${input.totalCommits.toLocaleString()} lifetime commits`,
    'might',
    Math.min(400, Math.floor(input.totalCommits / 25)),
  );
  addBonus(
    'Polyglot Mind',
    `${input.languageCount} languages wielded`,
    'wisdom',
    input.languageCount * 12,
  );
  addBonus(
    'Open Source Ally',
    `${input.openSourceContribCount} outside repos`,
    'fortune',
    input.openSourceContribCount * 15,
  );
  addBonus(
    'Decorated Champion',
    `${input.trophyCount} weekly trophies`,
    'fortune',
    input.trophyCount * 60,
  );

  // Tier multiplier applies last, to every attribute.
  const mult = TIER_MULTIPLIER[input.tier];
  if (mult > 1) {
    const before = base.might + base.wisdom + base.endurance + base.fortune;
    base.might = Math.round(base.might * mult);
    base.wisdom = Math.round(base.wisdom * mult);
    base.endurance = Math.round(base.endurance * mult);
    base.fortune = Math.round(base.fortune * mult);
    const after = base.might + base.wisdom + base.endurance + base.fortune;
    bonuses.push({
      label: input.tier === 'LEGEND' ? 'Legend Patronage' : 'Hero Patronage',
      detail: `${Math.round((mult - 1) * 100)}% to all attributes`,
      amount: after - before,
    });
  }

  base.total = base.might + base.wisdom + base.endurance + base.fortune;

  return {
    stats: base,
    bonuses: bonuses.sort((a, b) => b.amount - a.amount),
    gearPower,
    equippedCount: input.equipped.length,
  };
}
