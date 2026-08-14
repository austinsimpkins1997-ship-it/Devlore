import { ContributionWeek, XPBreakdown, LEVEL_THRESHOLDS } from '@/types';

export function calculateChapterXP(week: ContributionWeek): XPBreakdown {
  const base = week.totalCommits * 5;
  const streak = Math.floor(base * 0.5); 
  const prs = week.totalPRs * 25;
  const issues = week.totalIssues * 10;
  const newRepo = week.newRepos.length * 100;
  
  return {
    base,
    streak,
    prs,
    issues,
    newRepo,
    total: base + streak + prs + issues + newRepo
  };
}

export function getLevel(totalXP: number): number {
  let low = 0;
  let high = LEVEL_THRESHOLDS.length - 1;
  let level = 1;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (totalXP >= LEVEL_THRESHOLDS[mid]) {
      level = mid + 1;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return level;
}

export function getXPToNextLevel(totalXP: number): { current: number; required: number; percentage: number } {
  const level = getLevel(totalXP);
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[level] || currentLevelXP;
  
  if (currentLevelXP === nextLevelXP) return { current: totalXP, required: totalXP, percentage: 100 };
  
  const current = totalXP - currentLevelXP;
  const required = nextLevelXP - currentLevelXP;
  return {
    current,
    required,
    percentage: Math.min(100, Math.max(0, (current / required) * 100))
  };
}

export function getLevelTitle(level: number): string {
  if (level >= 20) return 'Mythic';
  if (level >= 15) return 'Legendary';
  if (level >= 10) return 'Seasoned Veteran';
  if (level >= 5) return 'Journeyman';
  return 'Freshly Called';
}
