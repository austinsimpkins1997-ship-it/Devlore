// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Equipment & loot
//
// Every level gained drops one piece of equipment. Drops are deterministic
// (seeded by userId + level), so replays and retries can never duplicate loot —
// reinforced by the @@unique([userId, levelAwarded]) constraint.
//
// Gear power feeds directly into Arena battle scores.
// ─────────────────────────────────────────────────────────────────────────────

import type { Prisma, PrismaClient } from '@prisma/client';
import { getLevel } from '@/lib/narrative/xp';

export type EquipmentSlotName = 'WEAPON' | 'ARMOR' | 'HELM' | 'RELIC';
export type EquipmentRarityName = 'RARE' | 'EPIC' | 'UNIQUE' | 'LEGENDARY';

type Tx = Prisma.TransactionClient | PrismaClient;

const SLOTS: readonly EquipmentSlotName[] = ['WEAPON', 'ARMOR', 'HELM', 'RELIC'];

/** Base power per rarity; scaled further by the level that dropped the item. */
export const RARITY_POWER: Record<EquipmentRarityName, number> = {
  RARE: 40,
  EPIC: 90,
  UNIQUE: 160,
  LEGENDARY: 250,
};

/** Three named forms per slot × rarity — which one drops depends on the seed. */
const CATALOG: Record<EquipmentSlotName, Record<EquipmentRarityName, readonly string[]>> = {
  WEAPON: {
    RARE: ['Runed Shortblade', 'Oaken Castingstaff', 'Lantern-Forged Dagger'],
    EPIC: ['Blade of the Twin Moons', 'Staff of Cascading Logic', 'Warhammer of the Deep Build'],
    UNIQUE: ['Fang of the Compiler', 'The Null-Splitter', 'Quill of Burning Commits'],
    LEGENDARY: ['Worldrender', 'The First Incantation', 'Dawnbreaker of the Endless Merge'],
  },
  ARMOR: {
    RARE: ['Scalemail of Patience', 'Wandering Coder’s Cloak', 'Bronzeweave Hauberk'],
    EPIC: ['Aegis of Reviewed Code', 'Mantle of the Night Shift', 'Plate of the Unbroken Pipeline'],
    UNIQUE: ['The Refactored Shell', 'Skin of the Chameleon Branch', 'Bulwark of Ten Thousand Tests'],
    LEGENDARY: ['Raiment of the Architect Eternal', 'The Unbreakable Monolith', 'Voidsilk Regalia'],
  },
  HELM: {
    RARE: ['Circlet of Focus', 'Hood of Quiet Mornings', 'Visor of the Debugger'],
    EPIC: ['Crown of Parsed Dreams', 'Helm of the Storm Sprint', 'Diadem of Clean Diffs'],
    UNIQUE: ['The Third Eye of Logs', 'Mask of the Anonymous Contributor', 'Halo of Cache Hits'],
    LEGENDARY: ['Crown of the Realm’s First Commit', 'The All-Seeing Compile', 'Corona of Infinite Uptime'],
  },
  RELIC: {
    RARE: ['Charm of Small Wins', 'Token of the First Star', 'Inkwell of Steady Hands'],
    EPIC: ['Orb of Rolling Releases', 'Chalice of Merged Conflicts', 'Idol of the Green Checkmark'],
    UNIQUE: ['Heart of the Monorepo', 'The Semver Stone', 'Phylactery of Deleted Branches'],
    LEGENDARY: ['The Origin Commit', 'Relic of the Eternal Streak', 'Sigil of the Living Legend'],
  },
};

const FLAVOR: Record<EquipmentRarityName, string> = {
  RARE: 'A fine piece, earned in honest toil.',
  EPIC: 'Forged in the heat of many long nights — few carry its equal.',
  UNIQUE: 'Only one such artifact exists in all the realm.',
  LEGENDARY: 'Bards will sing of the hero who bears this into the Arena.',
};

/** FNV-1a hash — deterministic seed from userId + level. */
function seedHash(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Rarity odds: 55% rare, 25% epic, 13% unique, 7% legendary. */
function rollRarity(seed: number): EquipmentRarityName {
  const roll = seed % 100;
  if (roll < 55) return 'RARE';
  if (roll < 80) return 'EPIC';
  if (roll < 93) return 'UNIQUE';
  return 'LEGENDARY';
}

export interface EquipmentDrop {
  slot: EquipmentSlotName;
  rarity: EquipmentRarityName;
  name: string;
  flavorText: string;
  power: number;
  levelAwarded: number;
}

/** Deterministic drop for reaching `level`. */
export function rollEquipmentForLevel(userId: string, level: number): EquipmentDrop {
  const seed = seedHash(`${userId}:${level}`);
  const rarity = rollRarity(seed);
  const slot = SLOTS[(seed >>> 8) % SLOTS.length];
  const forms = CATALOG[slot][rarity];
  const name = forms[(seed >>> 16) % forms.length];
  return {
    slot,
    rarity,
    name,
    flavorText: FLAVOR[rarity],
    power: RARITY_POWER[rarity] + level * 5,
    levelAwarded: level,
  };
}

export interface XpAwardResult {
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
  drops: EquipmentDrop[];
}

/**
 * Central XP award: updates xp + level and drops one equipment piece per level
 * gained. Call inside a transaction wherever XP is granted (forge, quests,
 * trophies, chapters) so progression and loot stay consistent.
 */
export async function awardXpWithLoot(
  tx: Tx,
  userId: string,
  currentXp: number,
  currentLevel: number,
  xpDelta: number,
): Promise<XpAwardResult> {
  const newXp = currentXp + xpDelta;
  const newLevel = getLevel(newXp);

  const drops: EquipmentDrop[] = [];
  for (let lvl = currentLevel + 1; lvl <= newLevel; lvl++) {
    drops.push(rollEquipmentForLevel(userId, lvl));
  }

  await tx.user.update({ where: { id: userId }, data: { xp: newXp, level: newLevel } });

  if (drops.length > 0) {
    await tx.equipment.createMany({
      data: drops.map((d) => ({
        userId,
        slot: d.slot,
        rarity: d.rarity,
        name: d.name,
        flavorText: d.flavorText,
        power: d.power,
        levelAwarded: d.levelAwarded,
      })),
      skipDuplicates: true,
    });
  }

  return { newXp, newLevel, leveledUp: newLevel > currentLevel, drops };
}

/** Total gear power for a user — used by the Arena battle score. */
export async function getGearPower(tx: Tx, userId: string): Promise<number> {
  const agg = await tx.equipment.aggregate({
    where: { userId },
    _sum: { power: true },
  });
  return agg._sum.power ?? 0;
}
