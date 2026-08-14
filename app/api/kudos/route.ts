import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * POST /api/kudos — cheer another hero's public codex.
 * One kudos per giver/receiver pair (enforced by a unique constraint).
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to cheer this hero' }, { status: 401 });
  }

  let username: unknown;
  try {
    const body = await req.json();
    username = body?.username;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (typeof username !== 'string' || username.length === 0 || username.length > 64) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true, isPublic: true },
  });
  if (!target || !target.isPublic) {
    return NextResponse.json({ error: 'Hero not found' }, { status: 404 });
  }
  if (target.id === session.user.id) {
    return NextResponse.json({ error: 'You cannot cheer your own legend' }, { status: 400 });
  }

  try {
    await prisma.kudos.create({
      data: { fromUserId: session.user.id, toUserId: target.id },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const count = await prisma.kudos.count({ where: { toUserId: target.id } });
      return NextResponse.json({ error: 'Already cheered', count }, { status: 409 });
    }
    console.error('[api/kudos] Failed:', err);
    return NextResponse.json({ error: 'Failed to send kudos' }, { status: 500 });
  }

  const count = await prisma.kudos.count({ where: { toUserId: target.id } });
  return NextResponse.json({ ok: true, count });
}
