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
  const signature = req.headers.get('x-devlore-token');

  if (!signature || signature.length < 8) {
    return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
  }

  // Look up user by webhook token (phase 1: stored as plain token in a field
  // we'll add to the schema, falling back to id for backward compat)
  let user;
  try {
    // Try direct ID lookup first (phase 1 fallback)
    user = await prisma.user.findUnique({ where: { id: signature } });

    // If not found by ID, try username-based HMAC approach
    if (!user && process.env.GITHUB_WEBHOOK_SECRET) {
      // When the user uses the GitHub App flow, we also accept
      // HMAC-SHA256 of their userId with the shared webhook secret
      // This is computed on the Settings page and shown as their token
      const allUsers = await prisma.user.findMany({
        select: { id: true, username: true },
        take: 1000, // bounded — in production, index on webhookToken field
      });
      for (const u of allUsers) {
        const expected = crypto
          .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
          .update(u.id)
          .digest('hex');
        if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
          user = await prisma.user.findUnique({ where: { id: u.id } });
          break;
        }
      }
    }
  } catch {
    return NextResponse.json({ received: true }); // Always 200 to avoid timing leaks
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
