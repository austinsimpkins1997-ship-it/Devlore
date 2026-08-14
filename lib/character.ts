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
  { id: 'towering', label: 'Towering', color: '#8b7355' },
  { id: 'compact', label: 'Compact', color: '#8b7355' },
];

export const SKINS: readonly AppearanceOption[] = [
  { id: 'porcelain', label: 'Porcelain', color: '#f1d3bd' },
  { id: 'sand', label: 'Sand', color: '#e0b48c' },
  { id: 'umber', label: 'Umber', color: '#c79067' },
  { id: 'bronze', label: 'Bronze', color: '#a3663d' },
  { id: 'chestnut', label: 'Chestnut', color: '#82502f' },
  { id: 'ebony', label: 'Ebony', color: '#5a3a24' },
  { id: 'ashen', label: 'Ashen', color: '#b8b0c4' },
  { id: 'stoneborn', label: 'Stoneborn', color: '#8d8f94' },
  { id: 'verdant', label: 'Verdantkin', color: '#7d9a6a' },
  { id: 'voidtouched', label: 'Voidtouched', color: '#6b5a8a' },
];

export const HAIRS: readonly AppearanceOption[] = [
  { id: 'raven', label: 'Raven', color: '#1c1c22' },
  { id: 'chestnut', label: 'Chestnut', color: '#5a3418' },
  { id: 'ember', label: 'Ember', color: '#a3401f' },
  { id: 'copper', label: 'Copper', color: '#c2622a' },
  { id: 'wheat', label: 'Wheat', color: '#d6b46a' },
  { id: 'frost', label: 'Frost', color: '#dfe6f0' },
  { id: 'silver', label: 'Silver', color: '#a8adb8' },
  { id: 'arcane', label: 'Arcane', color: '#8b5cf6' },
  { id: 'seafoam', label: 'Seafoam', color: '#4fb8a5' },
  { id: 'bloodmoon', label: 'Blood Moon', color: '#8f2233' },
  { id: 'shorn', label: 'Shorn', color: 'transparent' },
];

export const CLOAKS: readonly AppearanceOption[] = [
  { id: 'wanderer', label: 'Wanderer Grey', color: '#4b5162' },
  { id: 'scholar', label: 'Scholar Blue', color: '#2f5b8c' },
  { id: 'verdant', label: 'Verdant', color: '#2f6b4a' },
  { id: 'crimson', label: 'Crimson', color: '#8c2f34' },
  { id: 'void', label: 'Voidweave', color: '#221b3a' },
  { id: 'gilded', label: 'Gilded', color: '#a8852f' },
  { id: 'ashcloth', label: 'Ashcloth', color: '#6d6a63' },
  { id: 'tidewalker', label: 'Tidewalker', color: '#1f6b7a' },
  { id: 'plum', label: 'Nightplum', color: '#5b2d5c' },
  { id: 'bone', label: 'Bonewhite', color: '#ded6c4' },
];

export const AURAS: readonly AppearanceOption[] = [
  { id: 'none', label: 'None', color: 'transparent' },
  { id: 'rune', label: 'Rune Glow', color: '#c9a84c' },
  { id: 'arcane', label: 'Arcane Pulse', color: '#7c3aed' },
  { id: 'ember', label: 'Ember Halo', color: '#f97316' },
  { id: 'frost', label: 'Frostlight', color: '#67d5e8' },
  { id: 'verdant', label: 'Verdant Bloom', color: '#4ade80' },
  { id: 'shadow', label: 'Shadowveil', color: '#4c2a6b' },
  { id: 'blood', label: 'Bloodlight', color: '#c2334d' },
];

export const EYES: readonly AppearanceOption[] = [
  { id: 'slate', label: 'Slate', color: '#3f4552' },
  { id: 'amber', label: 'Amber', color: '#d59a2a' },
  { id: 'emerald', label: 'Emerald', color: '#2f8f5b' },
  { id: 'azure', label: 'Azure', color: '#2f7fc4' },
  { id: 'violet', label: 'Violet', color: '#8b5cf6' },
  { id: 'crimson', label: 'Crimson', color: '#b3303f' },
  { id: 'gold', label: 'Molten Gold', color: '#e0b422' },
  { id: 'pale', label: 'Pale Seer', color: '#d8dee9' },
];

export const MARKINGS: readonly AppearanceOption[] = [
  { id: 'none', label: 'None', color: 'transparent' },
  { id: 'warpaint', label: 'War Paint', color: '#b3303f' },
  { id: 'runes', label: 'Rune Sigils', color: '#c9a84c' },
  { id: 'scar', label: 'Duelling Scar', color: '#8a5c4a' },
  { id: 'tearline', label: 'Tearline', color: '#7c3aed' },
  { id: 'circuit', label: 'Circuit Traces', color: '#4fb8a5' },
];

export interface CharacterAppearance {
  charBody: string;
  charSkin: string;
  charHair: string;
  charCloak: string;
  charAura: string;
  charEyes: string;
  charMarking: string;
}

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  charBody: 'neutral',
  charSkin: 'umber',
  charHair: 'raven',
  charCloak: 'wanderer',
  charAura: 'none',
  charEyes: 'slate',
  charMarking: 'none',
};

/**
 * Preset archetypes - one-click starting points. Every preset is expressible
 * through the normal option lists, so nothing here can produce an appearance
 * the validator would reject.
 */
export interface CharacterPreset {
  id: string;
  label: string;
  blurb: string;
  appearance: CharacterAppearance;
}

export const PRESETS: readonly CharacterPreset[] = [
  {
    id: 'arcanist',
    label: 'The Arcanist',
    blurb: 'Violet-eyed, rune-marked, wreathed in arcane light.',
    appearance: {
      charBody: 'lithe', charSkin: 'porcelain', charHair: 'arcane',
      charCloak: 'void', charAura: 'arcane', charEyes: 'violet', charMarking: 'runes',
    },
  },
  {
    id: 'ironclad',
    label: 'The Ironclad',
    blurb: 'Broad-shouldered, scarred, built for the long siege.',
    appearance: {
      charBody: 'broad', charSkin: 'chestnut', charHair: 'raven',
      charCloak: 'crimson', charAura: 'ember', charEyes: 'amber', charMarking: 'scar',
    },
  },
  {
    id: 'nightwarden',
    label: 'The Night Warden',
    blurb: 'Shadow-cloaked and silent. Commits after midnight.',
    appearance: {
      charBody: 'neutral', charSkin: 'voidtouched', charHair: 'silver',
      charCloak: 'plum', charAura: 'shadow', charEyes: 'pale', charMarking: 'tearline',
    },
  },
  {
    id: 'grovekeeper',
    label: 'The Grovekeeper',
    blurb: 'Verdant and patient. Tends systems like gardens.',
    appearance: {
      charBody: 'towering', charSkin: 'verdant', charHair: 'seafoam',
      charCloak: 'verdant', charAura: 'verdant', charEyes: 'emerald', charMarking: 'circuit',
    },
  },
  {
    id: 'goldenherald',
    label: 'The Golden Herald',
    blurb: 'Gilded and unmistakable. Ships in daylight.',
    appearance: {
      charBody: 'compact', charSkin: 'sand', charHair: 'wheat',
      charCloak: 'gilded', charAura: 'rune', charEyes: 'gold', charMarking: 'warpaint',
    },
  },
  {
    id: 'stonewrought',
    label: 'The Stonewrought',
    blurb: 'Carved from bedrock. Nothing breaks the build.',
    appearance: {
      charBody: 'broad', charSkin: 'stoneborn', charHair: 'shorn',
      charCloak: 'ashcloth', charAura: 'frost', charEyes: 'slate', charMarking: 'runes',
    },
  },
];

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
    charEyes: pick(EYES, input.charEyes ?? '', DEFAULT_APPEARANCE.charEyes),
    charMarking: pick(MARKINGS, input.charMarking ?? '', DEFAULT_APPEARANCE.charMarking),
  };
}

export function colorOf(options: readonly AppearanceOption[], id: string): string {
  return options.find((o) => o.id === id)?.color ?? options[0].color;
}

/** Total number of distinct appearance combinations the creator can produce. */
export const APPEARANCE_COMBINATIONS =
  BODIES.length * SKINS.length * HAIRS.length * CLOAKS.length *
  AURAS.length * EYES.length * MARKINGS.length;

/** Uniformly random, always-valid appearance. */
export function randomAppearance(): CharacterAppearance {
  const any = (options: readonly AppearanceOption[]) =>
    options[Math.floor(Math.random() * options.length)].id;
  return {
    charBody: any(BODIES),
    charSkin: any(SKINS),
    charHair: any(HAIRS),
    charCloak: any(CLOAKS),
    charAura: any(AURAS),
    charEyes: any(EYES),
    charMarking: any(MARKINGS),
  };
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
