// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — AI provider registry
//
// DevLore runs on free API tiers. Any single free tier will rate-limit under
// real traffic, so we register several and fail over between them.
//
// Everything except Gemini speaks the OpenAI chat-completions protocol, so one
// adapter covers Groq, Cerebras, Mistral, and OpenRouter. Gemini uses the SDK
// that is already a dependency. No new npm packages are required.
//
// NOTE ON MODEL IDs: provider model names change over time. Every model here is
// overridable by env var so you can swap one without a code change or redeploy.
// ─────────────────────────────────────────────────────────────────────────────

export type ProviderId = 'gemini' | 'groq' | 'cerebras' | 'mistral' | 'openrouter';

export interface GenerateOptions {
  prompt: string;
  /** Ask the provider for strict JSON output. */
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  /** Abort a single provider attempt after this many ms. */
  timeoutMs?: number;
}

export interface ProviderDefinition {
  id: ProviderId;
  label: string;
  /** Env var holding the API key. Provider is skipped when unset. */
  keyEnv: string;
  /** Env var that can override the default model id. */
  modelEnv: string;
  defaultModel: string;
  /** Free-tier note, surfaced by /api/ai/status for operators. */
  freeTierNote: string;
  generate: (opts: GenerateOptions, apiKey: string, model: string) => Promise<string>;
}

const DEFAULT_TIMEOUT_MS = 30_000;

/** Errors that mean "this provider is exhausted — try the next one". */
export class ProviderUnavailableError extends Error {
  constructor(
    public readonly providerId: ProviderId,
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'ProviderUnavailableError';
  }
}

function isQuotaStatus(status: number): boolean {
  // 429 rate limit / quota, 402 out of credits, 5xx provider outage
  return status === 429 || status === 402 || status >= 500;
}

// ── OpenAI-compatible adapter (Groq, Cerebras, Mistral, OpenRouter) ──────────

function openAiCompatible(
  id: ProviderId,
  baseUrl: string,
  extraHeaders: Record<string, string> = {},
) {
  return async (opts: GenerateOptions, apiKey: string, model: string): Promise<string> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...extraHeaders,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: opts.prompt }],
          temperature: opts.temperature ?? 0.8,
          top_p: opts.topP ?? 0.92,
          max_tokens: opts.maxTokens ?? 1024,
          ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new ProviderUnavailableError(
          id,
          `HTTP ${res.status}: ${body.slice(0, 200)}`,
          isQuotaStatus(res.status),
        );
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new ProviderUnavailableError(id, 'Empty completion', true);
      }
      return text;
    } catch (err) {
      if (err instanceof ProviderUnavailableError) throw err;
      // Network failure or timeout — worth trying the next provider.
      const reason = err instanceof Error ? err.message : String(err);
      throw new ProviderUnavailableError(id, reason, true);
    } finally {
      clearTimeout(timer);
    }
  };
}

// ── Gemini adapter (native SDK, already a dependency) ────────────────────────

async function geminiGenerate(
  opts: GenerateOptions,
  apiKey: string,
  model: string,
): Promise<string> {
  try {
    const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = await import(
      '@google/generative-ai'
    );
    const client = new GoogleGenerativeAI(apiKey);
    const genModel = client.getGenerativeModel({
      model,
      // Relaxed safety for creative fantasy writing (metaphor, not real harm).
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
    });

    const result = await genModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.8,
        topP: opts.topP ?? 0.92,
        maxOutputTokens: opts.maxTokens ?? 1024,
        ...(opts.json ? { responseMimeType: 'application/json' } : {}),
      },
    });

    const text = result.response.text().trim();
    if (!text) throw new ProviderUnavailableError('gemini', 'Empty completion', true);
    return text;
  } catch (err) {
    if (err instanceof ProviderUnavailableError) throw err;
    const reason = err instanceof Error ? err.message : String(err);
    // Invalid/expired keys are NOT retryable elsewhere on this provider, but we
    // still move on to the next provider in the chain.
    const retryable = !/api key not valid|api_key_invalid|permission denied/i.test(reason);
    throw new ProviderUnavailableError('gemini', reason, retryable);
  }
}

// ── Registry ─────────────────────────────────────────────────────────────────

export const PROVIDERS: readonly ProviderDefinition[] = [
  {
    id: 'gemini',
    label: 'Google AI Studio (Gemini)',
    keyEnv: 'GEMINI_API_KEY',
    modelEnv: 'GEMINI_MODEL',
    defaultModel: 'gemini-2.0-flash',
    freeTierNote: 'Free tier on Flash / Flash-Lite. Keys begin with "AIza".',
    generate: geminiGenerate,
  },
  {
    id: 'groq',
    label: 'Groq',
    keyEnv: 'GROQ_API_KEY',
    modelEnv: 'GROQ_MODEL',
    defaultModel: 'llama-3.3-70b-versatile',
    freeTierNote: 'Free tier, no credit card. Very fast inference.',
    generate: openAiCompatible('groq', 'https://api.groq.com/openai/v1/chat/completions'),
  },
  {
    id: 'cerebras',
    label: 'Cerebras',
    keyEnv: 'CEREBRAS_API_KEY',
    modelEnv: 'CEREBRAS_MODEL',
    defaultModel: 'llama-3.3-70b',
    freeTierNote: 'Free daily token allowance. Good burst capacity.',
    generate: openAiCompatible('cerebras', 'https://api.cerebras.ai/v1/chat/completions'),
  },
  {
    id: 'mistral',
    label: 'Mistral',
    keyEnv: 'MISTRAL_API_KEY',
    modelEnv: 'MISTRAL_MODEL',
    defaultModel: 'mistral-small-latest',
    freeTierNote: 'Generous free "Experiment" tier — requires opting into training.',
    generate: openAiCompatible('mistral', 'https://api.mistral.ai/v1/chat/completions'),
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    keyEnv: 'OPENROUTER_API_KEY',
    modelEnv: 'OPENROUTER_MODEL',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    freeTierNote: 'Aggregates many free models. Low daily cap until $10 credited.',
    generate: openAiCompatible('openrouter', 'https://openrouter.ai/api/v1/chat/completions', {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://devloreapp.vercel.app',
      'X-Title': 'DevLore',
    }),
  },
];

export function getProvider(id: ProviderId): ProviderDefinition | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

/**
 * Failover order. Override with AI_PROVIDER_ORDER, e.g.
 *   AI_PROVIDER_ORDER=groq,gemini,cerebras
 */
export function getProviderOrder(): ProviderDefinition[] {
  const raw = process.env.AI_PROVIDER_ORDER;
  if (!raw) return [...PROVIDERS];

  const wanted = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const ordered = wanted
    .map((id) => PROVIDERS.find((p) => p.id === id))
    .filter((p): p is ProviderDefinition => p !== undefined);

  // Anything not named still runs, just last — a typo can't disable failover.
  const rest = PROVIDERS.filter((p) => !ordered.includes(p));
  return [...ordered, ...rest];
}

export function isConfigured(provider: ProviderDefinition): boolean {
  const key = process.env[provider.keyEnv];
  return typeof key === 'string' && key.trim().length > 0;
}

export function modelFor(provider: ProviderDefinition): string {
  const override = process.env[provider.modelEnv];
  return override && override.trim().length > 0 ? override.trim() : provider.defaultModel;
}
