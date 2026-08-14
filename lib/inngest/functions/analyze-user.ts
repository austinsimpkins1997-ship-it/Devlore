import { inngest } from '../client';
import { syncUserGitHubStats } from '@/lib/github/sync';
import { generateOriginStory } from '@/lib/narrative/generator';
import { prisma } from '@/lib/prisma';
import { assignHeroClass } from '@/lib/narrative/hero-class';

export const analyzeUser = inngest.createFunction(
  {
    id: 'analyze-user',
    concurrency: { limit: 1, key: 'event.data.userId' },
    retries: 3,
  },
  { event: 'devlore/user.analyze' },
  async ({ event, step }) => {
    const { userId, accessToken, triggeredBy } = event.data as {
      userId: string;
      accessToken: string;
      triggeredBy?: string;
    };

    // Step 1: Record analysis as started
    await step.run('record-analysis-start', async () => {
      await prisma.analysis.create({
        data: {
          userId,
          status: 'RUNNING' as const,
          triggeredBy: triggeredBy ?? 'unknown',
        },
      });
    });

    // Step 2: Fetch and cache GitHub stats
    const stats = await step.run('fetch-github-stats', async () => {
      return await syncUserGitHubStats(userId, accessToken);
    });

    // Step 3: Assign hero class + update DB
    const heroClass = await step.run('assign-hero-class', async () => {
      const hc = assignHeroClass({
        topLang: Object.keys(stats.topLanguages)[0] ?? 'JavaScript',
        languageCount: stats.languageCount,
        nightCommitRatio: stats.nightCommitRatio,
        docCommitRatio: stats.docCommitRatio,
        avgRepoSize: stats.avgRepoSize,
        hasInfraRepos: stats.hasInfraRepos,
        openSourceContribCount: stats.openSourceContribCount,
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          heroClass: hc.name,
          heroTitle: hc.title,
          heroClassSlug: hc.slug,
        },
      });

      return hc;
    });

    // Step 4: Generate origin story with AI
    const originResult = await step.run('generate-origin-story', async () => {
      const result = await generateOriginStory(stats);

      await prisma.user.update({
        where: { id: userId },
        data: {
          originStory: result.originStory,
          // Update class in case AI assigns differently — use the deterministic one
          heroClass: heroClass.name,
          heroTitle: heroClass.title,
          heroClassSlug: heroClass.slug,
          lastAnalyzedAt: new Date(),
        },
      });

      return result;
    });

    // Step 5: Create 3 starter lore cards for new users
    await step.run('create-starter-lore-cards', async () => {
      // Only create if user has no lore cards yet
      const existingCount = await prisma.loreCard.count({ where: { userId } });
      if (existingCount > 0) return { skipped: true };

      await prisma.loreCard.createMany({
        data: [
          {
            userId,
            cardType: 'ACHIEVEMENT',
            rarity: 'COMMON',
            name: 'The Awakening',
            flavorText:
              'You felt the pull of the arcane. The moment a hero hears the call, the world shifts to meet them.',
            milestone: 'Joined DevLore',
            xpValue: 10,
          },
          {
            userId,
            cardType: 'CLASS_EVOLUTION',
            rarity: 'UNCOMMON',
            name: heroClass.name,
            flavorText: `The ${heroClass.name} emerges from the mist. ${heroClass.title} — a title earned in fire and focus.`,
            milestone: 'Hero class assigned',
            xpValue: 25,
          },
          {
            userId,
            cardType: 'ACHIEVEMENT',
            rarity: 'COMMON',
            name: 'Rune Carver',
            flavorText:
              'Every legend begins with a single incantation etched into stone. Yours is now written.',
            milestone: 'First analysis complete',
            xpValue: 10,
          },
        ],
        skipDuplicates: true,
      });

      return { created: 3 };
    });

    // Step 6: Mark analysis complete
    await step.run('mark-analysis-complete', async () => {
      await prisma.analysis.updateMany({
        where: { userId, status: 'RUNNING' },
        data: { status: 'COMPLETE', completedAt: new Date() },
      });
    });

    return {
      success: true,
      heroClass: heroClass.name,
      hasOriginStory: !!originResult.originStory,
    };
  },
);
