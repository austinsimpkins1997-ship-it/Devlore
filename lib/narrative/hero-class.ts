import { HeroClass, HeroClassSlug } from '@/types';

export const HERO_CLASSES: HeroClass[] = [
  {
    slug: 'arcane-architect',
    name: 'Arcane Architect',
    title: 'Weaver of Typed Sorcery',
    description: 'Master of structural integrity and typed incantations.',
    primaryColor: '#7c3aed',
    accentColor: '#c9a84c',
    runeSymbol: '⚔',
    element: 'Aether'
  },
  {
    slug: 'script-sorcerer',
    name: 'Script Sorcerer',
    title: 'Binder of Automated Will',
    description: 'Commander of scripts and swift automations.',
    primaryColor: '#059669',
    accentColor: '#34d399',
    runeSymbol: '🐍',
    element: 'Nature'
  },
  {
    slug: 'shell-wraith',
    name: 'Shell Wraith',
    title: 'Haunter of the Command Line',
    description: 'Ghost in the shell, unseen operator of terminals.',
    primaryColor: '#475569',
    accentColor: '#94a3b8',
    runeSymbol: '💀',
    element: 'Void'
  },
  {
    slug: 'pixel-paladin',
    name: 'Pixel Paladin',
    title: 'Guardian of Beautiful Interfaces',
    description: 'Champion of user experience and visual harmony.',
    primaryColor: '#ec4899',
    accentColor: '#f9a8d4',
    runeSymbol: '🛡',
    element: 'Light'
  },
  {
    slug: 'data-druid',
    name: 'Data Druid',
    title: 'Whisperer to Databases',
    description: 'Channeler of data streams and statistical groves.',
    primaryColor: '#0891b2',
    accentColor: '#67e8f9',
    runeSymbol: '🌿',
    element: 'Water'
  },
  {
    slug: 'iron-forger',
    name: 'Iron Forger',
    title: 'Shaper of Raw Metal',
    description: 'Smith of bare metal, fast and unyielding.',
    primaryColor: '#b45309',
    accentColor: '#fbbf24',
    runeSymbol: '⚒',
    element: 'Earth'
  },
  {
    slug: 'cloud-wanderer',
    name: 'Cloud Wanderer',
    title: 'Drifter Between Serverless Planes',
    description: 'Architect of ethereal domains and scalable horizons.',
    primaryColor: '#2563eb',
    accentColor: '#93c5fd',
    runeSymbol: '☁',
    element: 'Air'
  },
  {
    slug: 'lore-keeper',
    name: 'Lore Keeper',
    title: 'Protector of Sacred Knowledge',
    description: 'Scribe of documentation and preserver of intent.',
    primaryColor: '#92400e',
    accentColor: '#fcd34d',
    runeSymbol: '📜',
    element: 'Arcane'
  },
  {
    slug: 'chaos-mage',
    name: 'Chaos Mage',
    title: 'Untameable Force of Creation',
    description: 'Polyglot of chaos, blending domains without fear.',
    primaryColor: '#7c3aed',
    accentColor: '#f43f5e',
    runeSymbol: '⚡',
    element: 'Chaos'
  },
  {
    slug: 'night-wraith',
    name: 'Night Wraith',
    title: 'Creature of Darkness and Caffeine',
    description: 'Operates in the twilight, powered by caffeine.',
    primaryColor: '#1e1b4b',
    accentColor: '#a78bfa',
    runeSymbol: '🌙',
    element: 'Shadow'
  },
  {
    slug: 'the-architect',
    name: 'The Architect',
    title: 'Builder of Digital Cathedrals',
    description: 'Designer of monolithic systems and vast codebases.',
    primaryColor: '#374151',
    accentColor: '#9ca3af',
    runeSymbol: '🏛',
    element: 'Stone'
  },
  {
    slug: 'open-sage',
    name: 'Open Sage',
    title: 'Keeper of the Eternal Gift',
    description: 'Contributor to the commons, sharing wisdom freely.',
    primaryColor: '#065f46',
    accentColor: '#6ee7b7',
    runeSymbol: '🌟',
    element: 'Spirit'
  }
];

export function getHeroClassBySlug(slug: HeroClassSlug): HeroClass {
  return HERO_CLASSES.find(h => h.slug === slug) || HERO_CLASSES[0];
}

export function assignHeroClass(signals: { topLang: string; languageCount: number; nightCommitRatio: number; docCommitRatio: number; avgRepoSize: number; hasInfraRepos: boolean; openSourceContribCount: number; }): HeroClass {
  if (signals.nightCommitRatio > 0.6) return getHeroClassBySlug('night-wraith');
  if (signals.openSourceContribCount > 20) return getHeroClassBySlug('open-sage');
  if (signals.docCommitRatio > 0.3) return getHeroClassBySlug('lore-keeper');
  if (signals.languageCount > 8) return getHeroClassBySlug('chaos-mage');
  if (signals.avgRepoSize > 10000) return getHeroClassBySlug('the-architect');
  if (signals.hasInfraRepos || signals.topLang === 'HCL') return getHeroClassBySlug('cloud-wanderer');
  
  const lang = signals.topLang.toLowerCase();
  if (['typescript', 'java', 'c#'].includes(lang)) return getHeroClassBySlug('arcane-architect');
  if (['python', 'ruby', 'php'].includes(lang)) return getHeroClassBySlug('script-sorcerer');
  if (['shell', 'go', 'bash'].includes(lang)) return getHeroClassBySlug('shell-wraith');
  if (['css', 'html', 'vue', 'svelte', 'javascript'].includes(lang)) return getHeroClassBySlug('pixel-paladin');
  if (['sql', 'r', 'julia', 'jupyter notebook'].includes(lang)) return getHeroClassBySlug('data-druid');
  if (['rust', 'c++', 'c', 'zig'].includes(lang)) return getHeroClassBySlug('iron-forger');
  
  return getHeroClassBySlug('arcane-architect');
}
