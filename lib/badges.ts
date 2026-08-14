// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Contribution badges
//
// Badges are derived on read from GitHub stats DevLore has already verified
// and cached on the User record — no extra tables, impossible to fake.
// ─────────────────────────────────────────────────────────────────────────────

export interface BadgeStats {
  totalCommits: number;
  longestStreak: number;
  languageCount: number;
  openSourceContribCount: number;
  hasInfraRepos: boolean;
  chaptersCount: number;
  trophyCount: number;
}

export interface ProfileBadge {
  slug: string;
  label: string;
  icon: string;
  description: string;
}

interface BadgeRule extends ProfileBadge {
  earned: (s: BadgeStats) => boolean;
}

const BADGE_RULES: readonly BadgeRule[] = [
  {
    slug: 'committed-100',
    label: 'Centurion',
    icon: '⚔️',
    description: '100+ commits on GitHub',
    earned: (s) => s.totalCommits >= 100,
  },
  {
    slug: 'committed-1k',
    label: '1K Club',
    icon: '🗡️',
    description: '1,000+ commits on GitHub',
    earned: (s) => s.totalCommits >= 1000,
  },
  {
    slug: 'committed-10k',
    label: 'Myriad Hand',
    icon: '🌌',
    description: '10,000+ commits on GitHub',
    earned: (s) => s.totalCommits >= 10000,
  },
  {
    slug: 'streak-30',
    label: 'Iron Streak',
    icon: '🔥',
    description: '30-day commit streak',
    earned: (s) => s.longestStreak >= 30,
  },
  {
    slug: 'streak-100',
    label: 'Eternal Vigil',
    icon: '🌋',
    description: '100-day commit streak',
    earned: (s) => s.longestStreak >= 100,
  },
  {
    slug: 'polyglot',
    label: 'Polyglot',
    icon: '🗣️',
    description: 'Ships code in 5+ languages',
    earned: (s) => s.languageCount >= 5,
  },
  {
    slug: 'open-source-ally',
    label: 'Open Source Ally',
    icon: '🤝',
    description: 'Contributes to 5+ repos they don’t own',
    earned: (s) => s.openSourceContribCount >= 5,
  },
  {
    slug: 'infra-sage',
    label: 'Infra Sage',
    icon: '🏗️',
    description: 'Maintains infrastructure repositories',
    earned: (s) => s.hasInfraRepos,
  },
  {
    slug: 'chronicler',
    label: 'Chronicler',
    icon: '📖',
    description: '10+ saga chapters written',
    earned: (s) => s.chaptersCount >= 10,
  },
  {
    slug: 'decorated',
    label: 'Decorated',
    icon: '🏆',
    description: 'Holder of a weekly trophy',
    earned: (s) => s.trophyCount >= 1,
  },
];

export function getEarnedBadges(stats: BadgeStats): ProfileBadge[] {
  return BADGE_RULES.filter((rule) => rule.earned(stats)).map(
    ({ slug, label, icon, description }) => ({ slug, label, icon, description }),
  );
}
