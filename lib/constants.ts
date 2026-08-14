/**
 * DEVLORE — Constants
 * Centralized app-wide constants for tiers, limits, milestones, etc.
 */

import type { Tier } from '@/types';

// ── App ───────────────────────────────────────────────────────────────────────

export const APP_NAME = 'DEVLORE';
export const APP_TAGLINE = 'Your commits. Your legend.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://devlore.app';
export const APP_EMAIL = 'chronicles@devlore.app';

// ── Tier Limits ───────────────────────────────────────────────────────────────

export const TIER_LIMITS: Record<Tier, {
  chapterHistory: number;       // Max chapters visible (-1 = unlimited)
  loreCards: number;            // Max lore cards (-1 = unlimited)
  manualAnalysis: boolean;      // Can trigger analysis manually
  privateRepos: boolean;        // Can analyze private repos
  chronicleEmail: boolean;      // Receives weekly email
  teamSagas: boolean;           // Can create org-wide sagas
  aiArtStyles: number;          // Number of AI art styles (future)
}> = {
  FREE: {
    chapterHistory: 2,
    loreCards: 3,
    manualAnalysis: false,
    privateRepos: false,
    chronicleEmail: false,
    teamSagas: false,
    aiArtStyles: 0,
  },
  PRO: {
    chapterHistory: -1,
    loreCards: 50,
    manualAnalysis: true,
    privateRepos: false,
    chronicleEmail: true,
    teamSagas: false,
    aiArtStyles: 3,
  },
  LEGEND: {
    chapterHistory: -1,
    loreCards: -1,
    manualAnalysis: true,
    privateRepos: true,
    chronicleEmail: true,
    teamSagas: true,
    aiArtStyles: 12,
  },
};

// ── Milestone Triggers (for lore card generation) ─────────────────────────────

export const MILESTONE_TRIGGERS = {
  COMMITS: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  STREAK_DAYS: [3, 7, 14, 30, 60, 100, 365],
  REPOS: [1, 3, 5, 10, 25, 50],
  MERGED_PRS: [1, 10, 25, 50, 100, 250],
  CHAPTERS: [1, 5, 10, 25, 52], // Weekly chapters
} as const;

// ── XP Values ─────────────────────────────────────────────────────────────────

export const XP_RATES = {
  PER_COMMIT: 5,
  PER_MERGED_PR: 25,
  PER_CLOSED_ISSUE: 10,
  PER_NEW_REPO: 100,
  STREAK_MULTIPLIER: 1.5,   // Multiply base XP when on a streak >= 3 days
  STREAK_THRESHOLD: 3,       // Minimum streak days to get multiplier
} as const;

// ── Language → Fantasy Translation ────────────────────────────────────────────

export const LANGUAGE_TO_MAGIC: Record<string, string> = {
  TypeScript: 'Strict Arcane Binding',
  JavaScript: 'Free-Form Elemental Script',
  Python: 'Serpent Tongue Sorcery',
  Rust: 'Ironclad Rune Forging',
  Go: 'Wind-Swift Crafting',
  Java: 'Ancient Temple Inscription',
  'C++': 'Raw Metal Alchemy',
  C: 'Primal Force Manipulation',
  Ruby: 'Gemstone Enchantment',
  PHP: 'The Old Ways',
  Swift: 'Falcon-Speed Weaving',
  Kotlin: 'Dragon-Tongue Harmonics',
  Scala: 'Mathematical Divination',
  Haskell: 'Pure Logic Transcendence',
  Elixir: 'Philosopher\'s Brew',
  Clojure: 'Ancient Lisp Mysteries',
  HTML: 'Structural Spellform',
  CSS: 'Visual Glamour Craft',
  SQL: 'Oracle Stone Communion',
  Shell: 'Shell Wraith Incantation',
  Dockerfile: 'Vessel Conjuration',
  HCL: 'Cloud-Binding Ritual',
  YAML: 'Configuration Sigils',
  Markdown: 'Lore Inscription',
};

// ── Hero Class Rune Symbols ───────────────────────────────────────────────────

export const CLASS_RUNES: Record<string, string> = {
  'arcane-architect': '⚔',
  'script-sorcerer': '🐍',
  'shell-wraith': '💀',
  'pixel-paladin': '🛡',
  'data-druid': '🌿',
  'iron-forger': '⚒',
  'cloud-wanderer': '☁',
  'lore-keeper': '📜',
  'chaos-mage': '⚡',
  'night-wraith': '🌙',
  'the-architect': '🏛',
  'open-sage': '🌟',
};

// ── Rate Limits ───────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  MANUAL_ANALYSIS_COOLDOWN_MS: 60 * 60 * 1000, // 1 hour
  WEBHOOK_CHAPTER_COOLDOWN_MS: 6 * 60 * 60 * 1000, // 6 hours min between webhook-triggered updates
  MAX_COMMIT_MESSAGES_PER_CHAPTER: 20, // Max commit messages to include in AI prompt
} as const;
