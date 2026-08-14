// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Milestone tracks
//
// Milestones are derived from stats DevLore already stores (no extra tables):
// the thresholds live in MILESTONE_TRIGGERS and progress is computed on read.
// ─────────────────────────────────────────────────────────────────────────────

import { MILESTONE_TRIGGERS } from '@/lib/constants';

export interface MilestoneTrack {
  key: string;
  label: string;
  icon: string;
  /** Current verified value (e.g. total commits). */
  current: number;
  /** Next threshold to reach, or null when every milestone is achieved. */
  nextTarget: number | null;
  /** Previous threshold reached (0 if none) — used for progress bars. */
  prevTarget: number;
  achievedCount: number;
  totalCount: number;
  /** 0–100 progress from the previous threshold toward the next. */
  percentage: number;
}

export interface MilestoneStats {
  totalCommits: number;
  currentStreak: number;
  longestStreak: number;
  chaptersCount: number;
}

function buildTrack(
  key: string,
  label: string,
  icon: string,
  current: number,
  thresholds: readonly number[],
): MilestoneTrack {
  const achieved = thresholds.filter((t) => current >= t);
  const prevTarget = achieved.length > 0 ? achieved[achieved.length - 1] : 0;
  const nextTarget = thresholds.find((t) => current < t) ?? null;

  let percentage = 100;
  if (nextTarget !== null) {
    const span = nextTarget - prevTarget;
    percentage = span > 0 ? Math.min(100, Math.max(0, ((current - prevTarget) / span) * 100)) : 0;
  }

  return {
    key,
    label,
    icon,
    current,
    nextTarget,
    prevTarget,
    achievedCount: achieved.length,
    totalCount: thresholds.length,
    percentage: Math.round(percentage),
  };
}

export function buildMilestoneTracks(stats: MilestoneStats): MilestoneTrack[] {
  const bestStreak = Math.max(stats.currentStreak, stats.longestStreak);
  return [
    buildTrack('commits', 'Commits', '⚔️', stats.totalCommits, MILESTONE_TRIGGERS.COMMITS),
    buildTrack('streak', 'Streak Days', '🔥', bestStreak, MILESTONE_TRIGGERS.STREAK_DAYS),
    buildTrack('chapters', 'Chapters', '📖', stats.chaptersCount, MILESTONE_TRIGGERS.CHAPTERS),
  ];
}
