// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Quest period helpers (all UTC)
// ─────────────────────────────────────────────────────────────────────────────

/** "2026-08-14" — UTC calendar day key for daily quests. */
export function dayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * ISO-8601 week key, e.g. "2026-W33" — used for weekly quests and trophies.
 * Weeks start Monday; week 1 contains the first Thursday of the year (UTC).
 */
export function isoWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Shift to the Thursday of the current ISO week
  const dayOfWeek = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Start of the current UTC day. */
export function startOfUtcDay(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Start of the current ISO week (Monday 00:00 UTC). */
export function startOfIsoWeek(date: Date = new Date()): Date {
  const d = startOfUtcDay(date);
  const dayOfWeek = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (dayOfWeek - 1));
  return d;
}

/** Period key for the milestone (all-time) cadence. */
export const ALL_TIME_KEY = 'all-time';
