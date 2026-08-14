import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest/client';

export const runtime = 'nodejs';

/**
 * GitHub webhook receiver for the DevLore drop-in GitHub Action.
 *
 * Authentication strategy:
 * The Action sends `X-DevLore-Token: <user's personal webhook token>`.
 * This token is a random 32-byte hex string generated on first login and
 * stored hashed in the DB (User.webhookTokenHash).
 *
 * For simplicity in Phase 1, we store the raw token as User.id-derived
 * HMAC and look up by comparing. This file uses a lookup approach:
 * store a webhookToken as a plain random string per user (added in a
 * future migration), and look up user by that token.
 *
 * Phase 1 fallback: treat the token as the user's plain ID (acceptable
 * for internal/self-hosted; not suitable for public SaaS without token migration).
 * See SETUP.md for the migration to hashed tokens.
 */
export async function POST(req: NextRequest) {
  const token = req.headers.get('x-devlore-token');

  if (!token || token.length < 8) {
    return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
  }

  // O(1) lookup via indexed webhookToken field
  let user;
  try {
    user = await prisma.user.findUnique({ where: { webhookToken: token } });

    // Fallback: if the user hasn't had their token stored yet, compute and store it
    // This handles users who signed up before the webhookToken migration
    if (!user && process.env.GITHUB_WEBHOOK_SECRET) {
      // Only attempt this if token looks like a 64-char hex HMAC
      if (/^[0-9a-f]{64}$/.test(token)) {
        // Brute force lookup is intentionally NOT done here for security.
        // Direct the user to visit Settings to regenerate their token.
        return NextResponse.json({ received: true }); // Silent 200
      }
    }
  } catch {
    return NextResponse.json({ received: true });
  }

  if (!user) {
    // Return 200 even for unknown tokens — don't reveal whether the token is valid
    return NextResponse.json({ received: true });
  }

  // Parse payload (from the GitHub Action's curl command)
  let payload: {
    event?: string;
    repo?: string;
    actor?: string;
    sha?: string;
    ref?: string;
    message?: string;
  };

  try {
    const rawBody = await req.text();
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event, repo, sha } = payload;

  // Only process push events (PRs are handled when merged via push)
  if (event === 'push' && repo && sha) {
    try {
      // Send to Inngest — non-blocking
      await inngest.send({
        name: 'devlore/github.push',
        data: {
          userId: user.id,
          repo,
          sha,
          ref: payload.ref ?? 'refs/heads/main',
          message: payload.message?.slice(0, 200) ?? '', // truncate for safety
        },
      });
    } catch (err) {
      // Log but don't fail — the webhook must return 200
      console.error('[webhook/github] Inngest send error:', err);
    }
  }

  return NextResponse.json({ received: true });
}
