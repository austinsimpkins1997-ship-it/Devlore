import { createUserClient } from '@/lib/github/client';
import { getContributionCalendar, calculateStreaks } from '@/lib/github/contributions';
import { getUserRepos, getLanguageStats } from '@/lib/github/commits';
import type { GitHubStats } from '@/types';
import { prisma } from '@/lib/prisma';

/**
 * Sync a user's GitHub stats to the database and return a GitHubStats object
 * for downstream processing (hero class assignment, narrative generation, etc.)
 */
export async function syncUserGitHubStats(
  userId: string,
  accessToken: string,
): Promise<GitHubStats> {
  const octokit = createUserClient(accessToken);

  // Fetch user profile
  const { data: ghUser } = await octokit.rest.users.getAuthenticated();

  // Fetch repos once, then derive language stats from the same set
  const repos = await getUserRepos(accessToken);
  const languageBytes = await getLanguageStats(
    accessToken,
    repos.map((r) => r.full_name),
  );

  // Normalize language stats to percentages
  const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
  const topLanguages: Record<string, number> = {};
  for (const [lang, bytes] of Object.entries(languageBytes)) {
    if (totalBytes > 0) {
      topLanguages[lang] = Math.round((bytes / totalBytes) * 100);
    }
  }

  // Fetch contribution calendar from first commit year
  const firstCommitDate = ghUser.created_at;
  const fromYear = new Date(firstCommitDate).getFullYear();
  const calendar = await getContributionCalendar(accessToken, ghUser.login, fromYear);
  const { currentStreak, longestStreak } = calculateStreaks(calendar);

  // Total commits from calendar
  const totalCommits = calendar.reduce((sum, d) => sum + d.contributionCount, 0);

  // Night commit ratio (commits between 10pm - 6am, rough estimate)
  // We don't have timestamps from calendar API — estimate from repo commit patterns
  // TODO: Fetch per-repo commits for accurate timing in a future update
  const nightCommitRatio = 0.15; // Default estimate

  // Doc commit ratio — check if user has markdown/docs heavy repos
  const docCommitRatio = repos.some((r) =>
    r.topics?.includes('documentation') || r.name.toLowerCase().includes('docs'),
  )
    ? 0.2
    : 0.05;

  const avgRepoSize =
    repos.length > 0
      ? repos.reduce((sum, r) => sum + r.size, 0) / repos.length
      : 0;

  const hasInfraRepos = repos.some(
    (r) =>
      r.topics?.includes('terraform') ||
      r.topics?.includes('infrastructure') ||
      r.topics?.includes('devops') ||
      r.name.toLowerCase().includes('infra'),
  );

  // Open source: count repos owned by orgs (contributions to others)
  const openSourceContribCount = repos.filter((r) =>
    r.full_name.split('/')[0] !== ghUser.login,
  ).length;

  const stats: GitHubStats = {
    username: ghUser.login,
    displayName: ghUser.name ?? ghUser.login,
    avatarUrl: ghUser.avatar_url,
    bio: ghUser.bio ?? null,
    totalCommits,
    totalRepos: repos.length,
    totalPRs: 0, // Not available without GraphQL pagination
    totalIssues: 0,
    totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    currentStreak,
    longestStreak,
    firstCommitDate,
    topLanguages,
    languageCount: Object.keys(topLanguages).length,
    nightCommitRatio,
    docCommitRatio,
    avgRepoSize,
    hasInfraRepos,
    openSourceContribCount,
  };

  // Persist to database — update all cached fields
  await prisma.user.update({
    where: { id: userId },
    data: {
      username: stats.username,
      displayName: stats.displayName,
      avatarUrl: stats.avatarUrl,
      bio: stats.bio,
      totalCommits: stats.totalCommits,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      topLanguages: stats.topLanguages,
      languageCount: stats.languageCount,
      firstCommitDate: stats.firstCommitDate ? new Date(stats.firstCommitDate) : null,
      nightCommitRatio: stats.nightCommitRatio,
      docCommitRatio: stats.docCommitRatio,
      avgRepoSize: stats.avgRepoSize,
      hasInfraRepos: stats.hasInfraRepos,
      openSourceContribCount: stats.openSourceContribCount,
      lastAnalyzedAt: new Date(),
    },
  });

  return stats;
}
