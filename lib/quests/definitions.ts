// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Quest catalog
//
// Quests are defined in code (single source of truth, type-safe) while
// per-user progress and claims live in the QuestProgress table. Every quest's
// progress is recomputed server-side from data DevLore already holds, so a
// claim can always be verified — nothing is trusted from the client.
// ─────────────────────────────────────────────────────────────────────────────

export type QuestCadence = 'DAILY' | 'WEEKLY' | 'MILESTONE';
export type QuestDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Legendary';

/** Everything a quest may inspect, gathered in one pass by the engine. */
export interface QuestContext {
  currentStreak: number;
  longestStreak: number;
  totalCommits: number;
  chaptersCount: number;
  loreCardsCount: number;
  forgeToday: { count: number; maxWords: number };
  forgeWeek: { count: number; maxWords: number; categoryCount: number };
}

export interface QuestDefinition {
  slug: string;
  title: string;
  description: string;
  icon: string;
  cadence: QuestCadence;
  difficulty: QuestDifficulty;
  target: number;
  xpReward: number;
  /** Minimum tier required to CLAIM (viewing is open to everyone). */
  requiresTier?: 'PRO' | 'LEGEND';
  /** Current progress toward `target`, computed from verified server data. */
  progress: (ctx: QuestContext) => number;
}

export const QUESTS: readonly QuestDefinition[] = [
  // ── Daily ──────────────────────────────────────────────────────────────────
  {
    slug: 'daily-chronicle',
    title: 'Chronicle Keeper',
    description: 'Record today in your saga with a Forge entry',
    icon: '📖',
    cadence: 'DAILY',
    difficulty: 'Easy',
    target: 1,
    xpReward: 75,
    progress: (ctx) => ctx.forgeToday.count,
  },
  {
    slug: 'daily-detail',
    title: 'The Detailed Account',
    description: 'Forge an entry of 60+ words today',
    icon: '🖋️',
    cadence: 'DAILY',
    difficulty: 'Easy',
    target: 1,
    xpReward: 100,
    progress: (ctx) => (ctx.forgeToday.maxWords >= 60 ? 1 : 0),
  },
  // ── Weekly (Pro & Legend can claim) ────────────────────────────────────────
  {
    slug: 'weekly-scribe',
    title: 'The Relentless Scribe',
    description: 'Forge 3 entries this week',
    icon: '🔥',
    cadence: 'WEEKLY',
    difficulty: 'Medium',
    target: 3,
    xpReward: 250,
    requiresTier: 'PRO',
    progress: (ctx) => ctx.forgeWeek.count,
  },
  {
    slug: 'weekly-scholar',
    title: 'The Scholar',
    description: 'Forge an entry of 100+ words this week',
    icon: '📚',
    cadence: 'WEEKLY',
    difficulty: 'Medium',
    target: 1,
    xpReward: 200,
    requiresTier: 'PRO',
    progress: (ctx) => (ctx.forgeWeek.maxWords >= 100 ? 1 : 0),
  },
  {
    slug: 'weekly-polymath',
    title: 'The Polymath',
    description: 'Forge entries in 2 different categories this week',
    icon: '🌐',
    cadence: 'WEEKLY',
    difficulty: 'Hard',
    target: 2,
    xpReward: 300,
    requiresTier: 'PRO',
    progress: (ctx) => ctx.forgeWeek.categoryCount,
  },
  // ── Milestones (all-time, everyone can claim) ──────────────────────────────
  {
    slug: 'milestone-streak-7',
    title: 'Weekbearer',
    description: 'Reach a 7-day commit streak',
    icon: '⚡',
    cadence: 'MILESTONE',
    difficulty: 'Medium',
    target: 7,
    xpReward: 350,
    progress: (ctx) => Math.max(ctx.currentStreak, ctx.longestStreak),
  },
  {
    slug: 'milestone-commits-100',
    title: 'Hundredfold Hand',
    description: 'Reach 100 total commits',
    icon: '⚔️',
    cadence: 'MILESTONE',
    difficulty: 'Medium',
    target: 100,
    xpReward: 200,
    progress: (ctx) => ctx.totalCommits,
  },
  {
    slug: 'milestone-commits-1000',
    title: 'Thousand Incantations',
    description: 'Reach 1,000 total commits',
    icon: '🌟',
    cadence: 'MILESTONE',
    difficulty: 'Hard',
    target: 1000,
    xpReward: 750,
    progress: (ctx) => ctx.totalCommits,
  },
  {
    slug: 'milestone-chapters-5',
    title: 'Storied',
    description: 'Collect 5 chapters in your chronicle',
    icon: '📜',
    cadence: 'MILESTONE',
    difficulty: 'Medium',
    target: 5,
    xpReward: 300,
    progress: (ctx) => ctx.chaptersCount,
  },
  {
    slug: 'milestone-cards-10',
    title: 'The Archivist',
    description: 'Unlock 10 lore cards',
    icon: '🃏',
    cadence: 'MILESTONE',
    difficulty: 'Medium',
    target: 10,
    xpReward: 300,
    progress: (ctx) => ctx.loreCardsCount,
  },
  {
    slug: 'milestone-iron-month',
    title: 'The Iron Month',
    description: 'Hold a 30-day commit streak',
    icon: '👑',
    cadence: 'MILESTONE',
    difficulty: 'Legendary',
    target: 30,
    xpReward: 5000,
    progress: (ctx) => Math.max(ctx.currentStreak, ctx.longestStreak),
  },
] as const;

export function getQuestBySlug(slug: string): QuestDefinition | undefined {
  return QUESTS.find((q) => q.slug === slug);
}
