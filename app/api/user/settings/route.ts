import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/** GET /api/user/settings — load current user settings */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPublic: true, emailChronicle: true, tier: true, username: true, webhookToken: true },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Compute real webhook token: HMAC-SHA256(userId, GITHUB_WEBHOOK_SECRET)
  const secret = process.env.GITHUB_WEBHOOK_SECRET ?? 'devlore-local-secret';
  const webhookToken = user.webhookToken ?? crypto
    .createHmac('sha256', secret)
    .update(session.user.id)
    .digest('hex');

  // Persist the token if not already stored (first visit after migration)
  if (!user.webhookToken) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { webhookToken },
    });
  }

  return NextResponse.json({ ...user, webhookToken });
}

/** PATCH /api/user/settings — save settings */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { isPublic, emailChronicle } = body as { isPublic?: boolean; emailChronicle?: boolean };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(typeof isPublic === 'boolean' && { isPublic }),
      ...(typeof emailChronicle === 'boolean' && { emailChronicle }),
    },
  });

  return NextResponse.json({ ok: true });
}
