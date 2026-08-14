import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { claimQuest } from '@/lib/quests/engine';

export const runtime = 'nodejs';

const CLAIM_ERROR_STATUS: Record<string, number> = {
  unknown_quest: 404,
  incomplete: 400,
  already_claimed: 409,
  tier_required: 403,
};

const CLAIM_ERROR_MESSAGE: Record<string, string> = {
  unknown_quest: 'Unknown quest',
  incomplete: 'Quest is not complete yet',
  already_claimed: 'Quest XP already claimed for this period',
  tier_required: 'Upgrade to Pro to claim weekly quests',
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let slug: unknown;
  try {
    const body = await req.json();
    slug = body?.slug;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (typeof slug !== 'string' || slug.length === 0 || slug.length > 64) {
    return NextResponse.json({ error: 'Missing quest slug' }, { status: 400 });
  }

  try {
    const result = await claimQuest(session.user.id, slug);
    if (!result.ok) {
      return NextResponse.json(
        { error: CLAIM_ERROR_MESSAGE[result.reason], reason: result.reason },
        { status: CLAIM_ERROR_STATUS[result.reason] },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[api/quests/claim] Claim failed:', error);
    return NextResponse.json({ error: 'Failed to claim quest' }, { status: 500 });
  }
}
