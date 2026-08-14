import { auth } from '@/auth';
import { inngest } from '@/lib/inngest/client';
import { NextResponse } from 'next/server';

/**
 * POST /api/github/retrigger-analysis
 * Manually re-sends the devlore/user.analyze event for the current user.
 * Used when the initial first-login trigger fails (e.g. Inngest dev server not running).
 */
export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = session.accessToken as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'No GitHub access token in session. Please sign out and sign in again.' },
      { status: 400 },
    );
  }

  await inngest.send({
    name: 'devlore/user.analyze',
    data: {
      userId: session.user.id,
      accessToken,
      triggeredBy: 'manual',
    },
  });

  return NextResponse.json({ ok: true, message: 'Analysis queued' });
}
