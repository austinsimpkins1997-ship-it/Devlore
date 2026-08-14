/**
 * DEVLORE — Gemini AI Narrative Generator
 *
 * Wraps Google Gemini 2.0 Flash to generate:
 * 1. Origin stories (one-time, on first login)
 * 2. Weekly saga chapters (recurring, every Monday)
 *
 * Cost profile: ~$0.001 per origin story, ~$0.0005 per chapter
 * at Gemini 2.0 Flash rates (as of 2025).
 */

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import type {
  GitHubStats,
  OriginStoryResult,
  NarrativeInput,
  GeneratedChapter,
  GeneratedLoreCard,
  HeroClassSlug,
} from '@/types';
import {
  buildOriginStoryPrompt,
  buildChapterPrompt,
  buildLoreCardPrompt,
} from './prompts';
import { assignHeroClass } from './hero-class';

// ── Client Setup ──────────────────────────────────────────────────────────────

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('[generator] GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

function getModel() {
  const ai = getAI();
  return ai.getGenerativeModel({
    model: 'gemini-2.0-flash',
    // Relaxed safety for creative fantasy writing
    // (the content is never about real harm — it's fantasy metaphor)
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ],
  });
}

// ── Retry Helper ──────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLast = attempt === maxRetries;
      if (isLast) break;

      // Exponential backoff with jitter
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
      console.warn(`[generator] Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms:`, err);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

// ── JSON Parser ───────────────────────────────────────────────────────────────

function parseJsonResponse<T>(text: string): T {
  // Strip markdown code fences if Gemini wraps the JSON
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(`[generator] Failed to parse JSON response: ${err}\n\nRaw text:\n${text.slice(0, 500)}`);
  }
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

    const prompt = buildOriginStoryPrompt(stats);

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,     // Slightly creative but consistent
        topP: 0.92,
        maxOutputTokens: 1024, // Origin story ~500 words ≈ 700 tokens
      },
    });

    const originStory = result.response.text().trim();

    if (originStory.length < 100) {
      throw new Error('[generator] Origin story too short — likely a safety block or empty response');
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
    const prompt = buildChapterPrompt(input);

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.80,
        topP: 0.92,
        maxOutputTokens: 2048, // Chapter ~700 words + JSON overhead ≈ 1200 tokens
        responseMimeType: 'application/json',
      },
    });

    const raw = result.response.text();
    const parsed = parseJsonResponse<{
      title: string;
      content: string;
      summary: string;
      xpEarned: number;
      newCards?: GeneratedLoreCard[];
    }>(raw);

    // Validate required fields
    if (!parsed.title || typeof parsed.title !== 'string') {
      throw new Error('[generator] Chapter missing required field: title');
    }
    if (!parsed.content || typeof parsed.content !== 'string') {
      throw new Error('[generator] Chapter missing required field: content');
    }
    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('[generator] Chapter missing required field: summary');
    }

    // Clamp XP to sensible range
    const xpEarned = Math.min(500, Math.max(25, Number(parsed.xpEarned) || 100));

    // Validate new cards if present
    const newCards: GeneratedLoreCard[] = (parsed.newCards ?? [])
      .filter((c): c is GeneratedLoreCard =>
        typeof c === 'object' &&
        c !== null &&
        typeof c.name === 'string' &&
        typeof c.flavorText === 'string'
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
    const prompt = buildLoreCardPrompt(milestone, context);

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 256,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonResponse<{ name: string; flavorText: string }>(
      result.response.text(),
    );

    if (!parsed.name || !parsed.flavorText) {
      throw new Error('[generator] Lore card missing required fields');
    }

    return parsed;
  });
}
