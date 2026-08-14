// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Deterministic narrative fallbacks
//
// Used whenever the AI is unavailable (missing/invalid GEMINI_API_KEY, quota,
// network). Every feature keeps working; the prose is generated from the
// hero's real stats instead of the model.
// ─────────────────────────────────────────────────────────────────────────────

import type { GeneratedChapter, GitHubStats, NarrativeInput } from '@/types';

export function buildFallbackOriginStory(
  stats: GitHubStats,
  heroClass: string,
  heroTitle: string,
): string {
  const topLang = Object.keys(stats.topLanguages)[0] ?? 'an unknown tongue';
  const since = stats.firstCommitDate
    ? new Date(stats.firstCommitDate).getFullYear()
    : 'a forgotten year';
  return (
    `In ${since}, a new name was carved into the ledgers of the realm: ${stats.displayName}. ` +
    `The archives record ${stats.totalCommits.toLocaleString()} incantations cast across ${stats.totalRepos} strongholds, ` +
    `spoken chiefly in the ${topLang} school of magic. ` +
    `Their longest unbroken vigil lasted ${stats.longestStreak} days — the kind of discipline that does not go unnoticed by the old powers. ` +
    `And so the title was bestowed: ${heroClass}, ${heroTitle}. ` +
    `The chronicle that follows is written by their own hands, one commit at a time.`
  );
}

export function buildFallbackChapter(input: NarrativeInput): GeneratedChapter {
  const { user, week, chapterNumber } = input;
  const langs = Object.keys(week.languages);
  const langLine =
    langs.length > 0
      ? `The ${langs.slice(0, 3).join(', ')} school${langs.length > 1 ? 's' : ''} of magic answered their call.`
      : 'The old magics stirred quietly this week.';
  const repoLine =
    week.newRepos.length > 0
      ? ` New strongholds were raised: ${week.newRepos.slice(0, 3).join(', ')}.`
      : '';
  const prLine =
    week.mergedPRs > 0
      ? ` ${week.mergedPRs} banner${week.mergedPRs === 1 ? '' : 's'} of merged work now fly over the keep.`
      : '';

  const xpEarned = Math.min(
    500,
    Math.max(25, week.totalCommits * 5 + week.mergedPRs * 25 + week.closedIssues * 10),
  );

  const content =
    `The ${chapterNumber === 1 ? 'first' : `${chapterNumber}th`} chapter of ${user.displayName}'s saga opens at the war table. ` +
    `Over seven days, ${week.totalCommits} incantation${week.totalCommits === 1 ? '' : 's'} were cast into the void. ${langLine}` +
    `${repoLine}${prLine} ` +
    `${week.closedIssues > 0 ? `${week.closedIssues} lurking beast${week.closedIssues === 1 ? ' was' : 's were'} slain in the issue-dark. ` : ''}` +
    `The ${user.heroClass} pressed on, streak burning at ${user.currentStreak} days, and the realm took notice. ` +
    `Thus the week passed into legend, and the chronicle waits, hungry, for the next.`;

  return {
    title: `Chapter ${chapterNumber}: The Week of ${week.totalCommits} Incantations`,
    content,
    summary: `${week.totalCommits} commits, ${week.mergedPRs} merged PRs, and ${week.closedIssues} closed issues carved into the saga.`,
    xpEarned,
    newCards: [],
  };
}
