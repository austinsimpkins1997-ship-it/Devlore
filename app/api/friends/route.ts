import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { listFriends, listIncomingRequests } from '@/lib/social';

export const runtime = 'nodejs';

/** GET /api/friends — accepted friends + incoming requests. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [friends, incoming] = await Promise.all([
      listFriends(session.user.id),
      listIncomingRequests(session.user.id),
    ]);
    return NextResponse.json({ friends, incoming });
  } catch (error) {
    console.error('[api/friends] Failed:', error);
    return NextResponse.json({ error: 'Failed to load fellowship' }, { status: 500 });
  }
}

/** POST /api/friends — send a friend request by username. */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to send a friend request' }, { status: 401 });
  }
  const viewerId = session.user.id;

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
  if (target.id === viewerId) {
    return NextResponse.json({ error: 'You cannot befriend yourself' }, { status: 400 });
  }

  // If they already requested us, accept instead of creating a mirror row.
  const reverse = await prisma.friendship.findUnique({
    where: { requesterId_addresseeId: { requesterId: target.id, addresseeId: viewerId } },
    select: { id: true, status: true },
  });
  if (reverse) {
    if (reverse.status === 'ACCEPTED') {
      return NextResponse.json({ ok: true, status: 'friends' });
    }
    await prisma.friendship.update({
      where: { id: reverse.id },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
    });
    return NextResponse.json({ ok: true, status: 'friends' });
  }

  try {
    await prisma.friendship.create({
      data: { requesterId: viewerId, addresseeId: target.id, status: 'PENDING' },
    });
    return NextResponse.json({ ok: true, status: 'request_sent' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ ok: true, status: 'request_sent' });
    }
    console.error('[api/friends] Create failed:', err);
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
}

/** PATCH /api/friends — accept or decline a pending request. */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let friendshipId: unknown;
  let action: unknown;
  try {
    const body = await req.json();
    friendshipId = body?.friendshipId;
    action = body?.action;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (typeof friendshipId !== 'string' || (action !== 'accept' && action !== 'decline')) {
    return NextResponse.json({ error: 'Missing friendshipId or action' }, { status: 400 });
  }

  // Only the addressee may respond — authorization check before mutation.
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
    select: { addresseeId: true, status: true },
  });
  if (!friendship || friendship.addresseeId !== session.user.id) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }
  if (friendship.status !== 'PENDING') {
    return NextResponse.json({ error: 'Request already answered' }, { status: 409 });
  }

  await prisma.friendship.update({
    where: { id: friendshipId },
    data: {
      status: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
      respondedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, status: action === 'accept' ? 'friends' : 'declined' });
}
