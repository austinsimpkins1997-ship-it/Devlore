import { ContributionDay, ContributionWeek, GitHubStats, NarrativeInput, HeroClassSlug } from '@/types';

export function calculateNightCommitRatio(days: ContributionDay[], commitsByHour?: number[]): number {
  if (commitsByHour && commitsByHour.length === 24) {
    const nightCommits = commitsByHour.slice(22, 24).reduce((a,b)=>a+b, 0) + commitsByHour.slice(0, 5).reduce((a,b)=>a+b, 0);
    const total = commitsByHour.reduce((a,b)=>a+b, 0);
    return total > 0 ? nightCommits / total : 0;
  }
  return 0.1;
}

export function calculateHeroClassSignals(stats: GitHubStats, repos: Array<{name: string; full_name: string; language: string | null; size: number; stargazers_count: number; topics: string[]; private: boolean;}>) {
  const sortedLangs = Object.entries(stats.topLanguages).sort((a,b)=>b[1]-a[1]);
  const topLang = sortedLangs.length > 0 ? sortedLangs[0][0] : 'Unknown';
  
  return {
    topLang,
    languageCount: stats.languageCount,
    nightCommitRatio: stats.nightCommitRatio,
    docCommitRatio: stats.docCommitRatio,
    avgRepoSize: stats.avgRepoSize,
    hasInfraRepos: stats.hasInfraRepos,
    openSourceContribCount: stats.openSourceContribCount
  };
}

export function buildNarrativeInput(
  user: { username: string; displayName: string; heroClass: string; heroTitle: string; heroClassSlug: HeroClassSlug; level: number; xp: number; firstCommitDate: string | null; currentStreak: number; longestStreak: number; topLanguages: Record<string, number>; },
  week: ContributionWeek,
  chapterNumber: number,
  previousSummary: string | null
): NarrativeInput {
  return {
    user,
    week,
    chapterNumber,
    previousChapterSummary: previousSummary
  };
}
