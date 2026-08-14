import { createGraphQLClient } from '@/lib/github/client';
import type { ContributionDay, ContributionWeek } from '@/types';
import { getWeeklyCommitMessages } from '@/lib/github/commits';

// ── GraphQL Query ─────────────────────────────────────────────────────────────

const GET_CONTRIBUTIONS_QUERY = `
  query GetContributions($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        restrictedContributionsCount
        pullRequestContributionsByRepository(maxRepositories: 10) {
          repository {
            nameWithOwner
          }
          contributions {
            totalCount
          }
        }
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
              weekday
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 25) {
          repository {
            nameWithOwner
            primaryLanguage {
              name
            }
            createdAt
          }
          contributions {
            totalCount
          }
        }
      }
    }
  }
`;

interface ContributionQueryResult {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalIssueContributions: number;
      restrictedContributionsCount: number;
      contributionCalendar: {
        weeks: Array<{
          contributionDays: ContributionDay[];
        }>;
      };
      commitContributionsByRepository: Array<{
        repository: {
          nameWithOwner: string;
          primaryLanguage: { name: string } | null;
          createdAt: string;
        };
        contributions: { totalCount: number };
      }>;
    };
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch all contribution days for a user, year by year from firstYear to now.
 * GitHub's GraphQL API limits contributions queries to 1-year windows.
 */
export async function getContributionCalendar(
  accessToken: string,
  username: string,
  fromYear?: number,
): Promise<ContributionDay[]> {
  const gql = createGraphQLClient(accessToken);
  const startYear = fromYear ?? new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const allDays: ContributionDay[] = [];

  for (let year = startYear; year <= currentYear; year++) {
    const from = new Date(year, 0, 1).toISOString();
    const to = new Date(year, 11, 31, 23, 59, 59).toISOString();

    try {
      const result = await gql<ContributionQueryResult>(GET_CONTRIBUTIONS_QUERY, {
        username,
        from,
        to,
      });

      const weeks = result.user.contributionsCollection.contributionCalendar.weeks;
      for (const week of weeks) {
        allDays.push(...week.contributionDays);
      }
    } catch (err) {
      console.error(`[contributions] Failed for ${username} in ${year}:`, err);
    }
  }

  return allDays;
}

/**
 * Calculate currentStreak and longestStreak from an array of contribution days.
 * - Today with 0 contributions does not break the streak (you might still commit today)
 * - Sorted oldest → newest
 */
export function calculateStreaks(
  days: ContributionDay[],
): { currentStreak: number; longestStreak: number } {
  if (days.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sorted = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  let longestStreak = 0;
  let tempStreak = 0;

  for (const day of sorted) {
    if (day.contributionCount > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak (walking backwards from yesterday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const day = sorted[i];
    // Skip today — don't penalize if today has 0 commits yet
    if (day.date === todayStr) continue;

    if (day.contributionCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Fetch all contribution data for a specific week.
 * Used by the weekly chapter generation Inngest function.
 */
export async function getWeeklyContributions(
  accessToken: string,
  username: string,
  weekStart: Date,
  weekEnd: Date,
): Promise<ContributionWeek> {
  const gql = createGraphQLClient(accessToken);
  const from = weekStart.toISOString();
  const to = weekEnd.toISOString();

  const result = await gql<ContributionQueryResult>(GET_CONTRIBUTIONS_QUERY, {
    username,
    from,
    to,
  });

  const collection = result.user.contributionsCollection;
  const days: ContributionDay[] = [];

  for (const week of collection.contributionCalendar.weeks) {
    days.push(...week.contributionDays);
  }

  // Build language usage map
  const languages: Record<string, number> = {};
  const repoNamesForCommitMessages: string[] = [];

  // Detect new repos (created during this week)
  const newRepos: string[] = [];

  for (const repoContrib of collection.commitContributionsByRepository) {
    const { nameWithOwner, primaryLanguage, createdAt } = repoContrib.repository;
    repoNamesForCommitMessages.push(nameWithOwner);

    const lang = primaryLanguage?.name ?? 'Unknown';
    languages[lang] = (languages[lang] ?? 0) + repoContrib.contributions.totalCount;

    // Flag repos created during the week
    if (new Date(createdAt) >= weekStart && new Date(createdAt) <= weekEnd) {
      newRepos.push(nameWithOwner.split('/')[1] ?? nameWithOwner);
    }
  }

  // Fetch commit messages for narrative flavor (non-fatal if fails)
  let commitMessages: string[] = [];
  try {
    commitMessages = await getWeeklyCommitMessages(
      accessToken,
      username,
      repoNamesForCommitMessages,
      from,
      to,
    );
  } catch (err) {
    console.warn('[contributions] Failed to fetch commit messages:', err);
  }

  return {
    days,
    totalCommits: collection.totalCommitContributions,
    totalPRs: collection.totalPullRequestContributions,
    totalIssues: collection.totalIssueContributions,
    mergedPRs: collection.totalPullRequestContributions, // Merged PRs counted same as total for now
    closedIssues: collection.totalIssueContributions,
    languages,
    commitMessages,
    newRepos,
  };
}
