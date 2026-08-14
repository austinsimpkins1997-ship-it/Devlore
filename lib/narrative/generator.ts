/**
 * DEVLORE — AI Narrative Generator
 *
 * Generates origin stories, weekly chapters, and lore cards.
 *
 * Provider-agnostic: requests go through lib/ai/client, which fails over
 * across every configured free tier (Gemini, Groq, Cerebras, Mistral,
 * OpenRouter). If all of them fail, callers fall back to the deterministic
 * writer in lib/narrative/fallback.ts, so the product never hard-stops on a
 * rate limit.
 *
 * The exported signatures are unchanged from the Gemini-only version.
 */

import type {
  GitHubStats,
  OriginStoryResult,
  NarrativeInput,
  GeneratedChapter,
  GeneratedLoreCard,
  HeroClassSlug,
} from '@/types';
import { generateText, parseJsonResponse } from '@/lib/ai/client';
import {
  buildOriginStoryPrompt,
  buildChapterPrompt,
  buildLoreCardPrompt,
} from './prompts';
import { assignHeroClass } from './hero-class';

// ── Retry Helper ──────────────────────────────────────────────────────────────

/**
 * Retries the whole failover chain. Provider-level failover already happens
 * inside generateText; this covers transient faults that hit every provider at
 * once (for example a brief network outage).
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelayMs = 800,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 400;
      console.warn(`[generator] Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms:`, err);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

// ── Origin Story Generation ───────────────────────────────────────────────────

export async function generateOriginStory(stats: GitHubStats): Promise<OriginStoryResult> {
  return withRetry(async () => {
    const heroClass = assignHeroClass({
      topLang: Object.keys(stats.topLanguages)[0] ?? 'JavaScript',
      languageCount: stats.languageCount,
      nightCommitRatio: stats.nightCommitRatio,
      docCommitRatio: stats.docCommitRatio,
      avgRepoSize: stats.avgRepoSize,
      hasInfraRepos: stats.hasInfraRepos,
      openSourceContribCount: stats.openSourceContribCount,
    });

    const { text, providerId } = await generateText({
      prompt: buildOriginStoryPrompt(stats),
      temperature: 0.85,
      topP: 0.92,
      maxTokens: 1024,
    });

    const originStory = text.trim();
    if (originStory.length < 100) {
      throw new Error(
        `[generator] Origin story too short from ${providerId} — likely a safety block or empty response`,
      );
    }

    return {
      heroClassSlug: heroClass.slug as HeroClassSlug,
      heroClass: heroClass.name,
      heroTitle: heroClass.title,
      originStory,
    };
  });
}

// ── Weekly Chapter Generation ─────────────────────────────────────────────────

export async function generateWeeklyChapter(input: NarrativeInput): Promise<GeneratedChapter> {
  return withRetry(async () => {
    const { text } = await generateText({
      prompt: buildChapterPrompt(input),
      json: true,
      temperature: 0.8,
      topP: 0.92,
      maxTokens: 2048,
    });

    const parsed = parseJsonResponse<{
      title: string;
      content: string;
      summary: string;
      xpEarned: number;
      newCards?: GeneratedLoreCard[];
    }>(text);

    if (!parsed.title || typeof parsed.title !== 'string') {
      throw new Error('[generator] Chapter missing required field: title');
    }
    if (!parsed.content || typeof parsed.content !== 'string') {
      throw new Error('[generator] Chapter missing required field: content');
    }
    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('[generator] Chapter missing required field: summary');
    }

    // Clamp XP so a hallucinated number can never distort progression.
    const xpEarned = Math.min(500, Math.max(25, Number(parsed.xpEarned) || 100));

    const newCards: GeneratedLoreCard[] = (parsed.newCards ?? [])
      .filter((c): c is GeneratedLoreCard =>
        typeof c === 'object' &&
        c !== null &&
        typeof c.name === 'string' &&
        typeof c.flavorText === 'string',
      )
      .map((c) => ({
        cardType: c.cardType ?? 'ACHIEVEMENT',
        rarity: c.rarity ?? 'COMMON',
        name: c.name,
        flavorText: c.flavorText,
        milestone: c.milestone ?? 'Weekly contribution',
        xpValue: Number(c.xpValue) || 10,
      }));

    return {
      title: parsed.title,
      content: parsed.content,
      summary: parsed.summary,
      xpEarned,
      newCards,
    };
  });
}

// ── Single Lore Card Generation ───────────────────────────────────────────────

export async function generateLoreCard(
  milestone: string,
  context: string,
): Promise<{ name: string; flavorText: string }> {
  return withRetry(async () => {
    const { text } = await generateText({
      prompt: buildLoreCardPrompt(milestone, context),
      json: true,
      temperature: 0.9,
      maxTokens: 256,
    });

    const parsed = parseJsonResponse<{ name: string; flavorText: string }>(text);
    if (!parsed.name || !parsed.flavorText) {
      throw new Error('[generator] Lore card missing required fields');
    }
    return parsed;
  });
}
