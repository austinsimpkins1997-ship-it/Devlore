// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — AI client with free-tier failover
//
// Tries each configured provider in order. When one is rate-limited or down,
// it is placed in a short cooldown and the next provider takes over, so a
// single exhausted free tier never takes the feature offline.
//
// Cooldown state is in-memory and therefore per-instance. On serverless that
// means it helps within a warm instance and resets on cold start — which is
// the correct trade-off here: no extra infrastructure, and the worst case is
// one wasted request that immediately fails over anyway.
// ─────────────────────────────────────────────────────────────────────────────

import {
  ProviderUnavailableError,
  getProviderOrder,
  isConfigured,
  modelFor,
  type GenerateOptions,
  type ProviderId,
} from './providers';

/** How long a provider sits out after a quota/outage error. */
const COOLDOWN_MS = 5 * 60 * 1000;

const cooldownUntil = new Map<ProviderId, number>();

function isCoolingDown(id: ProviderId): boolean {
  const until = cooldownUntil.get(id);
  if (until === undefined) return false;
  if (Date.now() >= until) {
    cooldownUntil.delete(id);
    return false;
  }
  return true;
}

export interface GenerationResult {
  text: string;
  providerId: ProviderId;
  model: string;
  /** Providers that failed before this one succeeded. */
  attempts: Array<{ providerId: ProviderId; error: string }>;
}

export class AllProvidersFailedError extends Error {
  constructor(public readonly attempts: Array<{ providerId: ProviderId; error: string }>) {
    const detail = attempts.map((a) => `${a.providerId}: ${a.error}`).join(' | ');
    super(`All AI providers failed. ${detail || 'No providers configured.'}`);
    this.name = 'AllProvidersFailedError';
  }
}

/**
 * Generate text from the first provider that answers.
 * Throws AllProvidersFailedError only when every configured provider fails —
 * callers are expected to fall back to deterministic prose at that point.
 */
export async function generateText(opts: GenerateOptions): Promise<GenerationResult> {
  const attempts: Array<{ providerId: ProviderId; error: string }> = [];
  const providers = getProviderOrder().filter(isConfigured);

  if (providers.length === 0) {
    throw new AllProvidersFailedError(attempts);
  }

  // Prefer providers that are not cooling down, but keep the rest as a last
  // resort rather than dropping them entirely.
  const ready = providers.filter((p) => !isCoolingDown(p.id));
  const queue = ready.length > 0 ? [...ready, ...providers.filter((p) => isCoolingDown(p.id))] : providers;

  for (const provider of queue) {
    const apiKey = process.env[provider.keyEnv]!;
    const model = modelFor(provider);

    try {
      const text = await provider.generate(opts, apiKey, model);
      cooldownUntil.delete(provider.id);
      return { text, providerId: provider.id, model, attempts };
    } catch (err) {
      const message =
        err instanceof ProviderUnavailableError
          ? err.message
          : err instanceof Error
            ? err.message
            : String(err);

      attempts.push({ providerId: provider.id, error: message });
      console.warn(`[ai] ${provider.id} failed (${model}): ${message}`);

      if (err instanceof ProviderUnavailableError && err.retryable) {
        cooldownUntil.set(provider.id, Date.now() + COOLDOWN_MS);
      }
    }
  }

  throw new AllProvidersFailedError(attempts);
}

/** Strips markdown fences some providers wrap around JSON, then parses. */
export function parseJsonResponse<T>(text: string): T {
  let cleaned = text.trim();

  // Remove ```json ... ``` fences anywhere in the response.
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) cleaned = fenced[1].trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Some models prepend prose before the object — recover the outermost {...}.
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        /* fall through to the shared error below */
      }
    }
    throw new Error(`[ai] Failed to parse JSON response. Raw: ${text.slice(0, 300)}`);
  }
}

/** True when at least one provider has an API key configured. */
export function hasAnyProvider(): boolean {
  return getProviderOrder().some(isConfigured);
}
