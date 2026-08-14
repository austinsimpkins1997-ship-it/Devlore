import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateText } from '@/lib/ai/client';
import { getProviderOrder, isConfigured, modelFor } from '@/lib/ai/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/status        — which providers are configured, in failover order
 * GET /api/ai/status?probe=1 — additionally send one tiny live request
 *
 * Requires a signed-in user. Never returns key material — only whether a key
 * is present, so this is safe to open in a browser.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const providers = getProviderOrder().map((p, index) => ({
    order: index + 1,
    id: p.id,
    label: p.label,
    configured: isConfigured(p),
    model: modelFor(p),
    keyEnv: p.keyEnv,
    freeTier: p.freeTierNote,
  }));

  const configuredCount = providers.filter((p) => p.configured).length;

  const body: Record<string, unknown> = {
    configuredCount,
    // With zero providers the site still works — prose comes from the
    // deterministic fallback writer instead of a model.
    usingFallbackWriter: configuredCount === 0,
    providers,
  };

  if (new URL(req.url).searchParams.get('probe') === '1') {
    if (configuredCount === 0) {
      body.probe = { ok: false, error: 'No providers configured' };
    } else {
      const started = Date.now();
      try {
        const result = await generateText({
          prompt: 'Reply with exactly the word: ready',
          maxTokens: 8,
          temperature: 0,
          timeoutMs: 15_000,
        });
        body.probe = {
          ok: true,
          servedBy: result.providerId,
          model: result.model,
          ms: Date.now() - started,
          failedOver: result.attempts,
          sample: result.text.slice(0, 80),
        };
      } catch (error) {
        body.probe = {
          ok: false,
          ms: Date.now() - started,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  return NextResponse.json(body);
}
