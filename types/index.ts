// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Shared Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums (mirroring Prisma schema) ──────────────────────────────────────────

export type Tier = 'FREE' | 'PRO' | 'LEGEND';

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type CardType =
  | 'ACHIEVEMENT'
  | 'STREAK'
  | 'LANGUAGE'
  | 'PROJECT'
  | 'COLLABORATION'
  | 'CLASS_EVOLUTION';

export type AnalysisStatus = 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';

// ── Hero Classes ──────────────────────────────────────────────────────────────

export type HeroClassSlug =
  | 'arcane-architect'
  | 'script-sorcerer'
  | 'shell-wraith'
  | 'pixel-paladin'
  | 'data-druid'
  | 'iron-forger'
  | 'cloud-wanderer'
  | 'lore-keeper'
  | 'chaos-mage'
  | 'night-wraith'
  | 'the-architect'
  | 'open-sage';

export interface HeroClass {
  slug: HeroClassSlug;
  name: string;
  title: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  runeSymbol: string; // Unicode or emoji rune-like symbol
  element: string; // Fantasy element name
}

// ── GitHub Data ───────────────────────────────────────────────────────────────

export interface ContributionDay {
  date: string; // ISO date string "2024-03-15"
  contributionCount: number;
  weekday: number;
}

export interface ContributionWeek {
  days: ContributionDay[];
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  languages: Record<string, number>; // { TypeScript: 45, Python: 30 } (%)
  commitMessages: string[];
  newRepos: string[];
  mergedPRs: number;
  closedIssues: number;
}

export interface GitHubStats {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string | null;

  // Totals
  totalCommits: number;
  totalRepos: number;
  totalPRs: number;
  totalIssues: number;
  totalStars: number;

  // Streak
  currentStreak: number;
  longestStreak: number;
  firstCommitDate: string | null;

  // Languages (percentage breakdown)
  topLanguages: Record<string, number>;
  languageCount: number;

  // Behavioral signals for hero class
  nightCommitRatio: number; // 0–1, % commits between 10pm–5am
  docCommitRatio: number; // 0–1, % commits with doc-related messages
  avgRepoSize: number; // avg KB across repos
  hasInfraRepos: boolean; // has repos with terraform/k8s/docker topics
  openSourceContribCount: number; // PRs to repos not owned by user
}

// ── Narrative ─────────────────────────────────────────────────────────────────

export interface NarrativeInput {
  user: {
    username: string;
    displayName: string;
    heroClass: string;
    heroTitle: string;
    heroClassSlug: HeroClassSlug;
    level: number;
    xp: number;
    firstCommitDate: string | null;
    currentStreak: number;
    longestStreak: number;
    topLanguages: Record<string, number>;
  };
  week: ContributionWeek;
  previousChapterSummary: string | null;
  chapterNumber: number;
}

export interface GeneratedChapter {
  title: string;
  content: string;
  summary: string;
  xpEarned: number;
  newCards: GeneratedLoreCard[];
}

export interface GeneratedLoreCard {
  cardType: CardType;
  rarity: Rarity;
  name: string;
  flavorText: string;
  milestone: string;
  xpValue: number;
}

export interface OriginStoryResult {
  heroClassSlug: HeroClassSlug;
  heroClass: string;
  heroTitle: string;
  originStory: string;
}

// ── Database Models (safe for client use — no sensitive fields) ───────────────

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  heroClass: string | null;
  heroTitle: string | null;
  heroClassSlug: string | null;
  level: number;
  xp: number;
  tier: Tier;
  topLanguages: Record<string, number> | null;
  currentStreak: number;
  longestStreak: number;
  totalCommits: number;
  firstCommitDate: string | null;
  isPublic: boolean;
  createdAt: string;
}

export interface ChapterSummary {
  id: string;
  number: number;
  title: string;
  summary: string;
  weekStart: string;
  weekEnd: string;
  commitCount: number;
  xpEarned: number;
  createdAt: string;
}

export interface ChapterFull extends ChapterSummary {
  content: string;
  prsMerged: number;
  bugsFixed: number;
  languages: Record<string, number> | null;
  newRepos: string[];
}

export interface LoreCardPublic {
  id: string;
  cardType: CardType;
  rarity: Rarity;
  name: string;
  flavorText: string;
  milestone: string;
  xpValue: number;
  unlockedAt: string;
}

// ── XP System ─────────────────────────────────────────────────────────────────

export interface XPBreakdown {
  base: number; // XP for commits
  streak: number; // XP bonus for streak
  prs: number; // XP for merged PRs
  issues: number; // XP for closed issues
  newRepo: number; // XP for starting new repo
  total: number;
}

export const LEVEL_THRESHOLDS: number[] = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5500, // Level 8
  8000, // Level 9
  11000, // Level 10
  15000, // Level 11
  20000, // Level 12
  26000, // Level 13
  33000, // Level 14
  42000, // Level 15
  52000, // Level 16
  65000, // Level 17
  80000, // Level 18
  100000, // Level 19
  125000, // Level 20 — Legendary
];

// ── Stripe ────────────────────────────────────────────────────────────────────

export interface SubscriptionStatus {
  tier: Tier;
  isActive: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Next-Auth Session Extension ───────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    githubId: string;
    username: string;
  }

  interface JWT {
    accessToken?: string;
    githubId?: string;
    username?: string;
  }
}
