import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { areFriends } from '@/lib/social';

export const runtime = 'nodejs';

const MAX_BODY_LENGTH = 1000;
const MAX_MESSAGES_PER_HOUR = 60;

/**
 * GET /api/messages?username=... — conversation with one friend.
 * Marks their messages to you as read.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const viewerId = session.user.id;

  const username = new URL(req.url).searchParams.get('username')?.trim();
  if (!username || username.length > 64) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 });
  }

  const other = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  });
  if (!other) {
    return NextResponse.json({ error: 'Hero not found' }, { status: 404 });
  }
  if (!(await areFriends(viewerId, other.id))) {
    return NextResponse.json({ error: 'You can only message friends' }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: viewerId, recipientId: other.id },
        { senderId: other.id, recipientId: viewerId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 200,
    select: { id: true, senderId: true, body: true, createdAt: true },
  });

  await prisma.message.updateMany({
    where: { senderId: other.id, recipientId: viewerId, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({
    friend: other,
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      fromMe: m.senderId === viewerId,
    })),
  });
}

/** POST /api/messages — send a message to a friend. */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const viewerId = session.user.id;

  let username: unknown;
  let body: unknown;
  try {
    const payload = await req.json();
    username = payload?.username;
    body = payload?.body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof username !== 'string' || username.length === 0 || username.length > 64) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 });
  }
  if (typeof body !== 'string') {
    return NextResponse.json({ error: 'Missing message body' }, { status: 400 });
  }

  // Strip HTML before storing — messages are rendered as plain text.
  const clean = body.replace(/<[^>]*>/g, '').trim();
  if (!clean) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
  }
  if (clean.length > MAX_BODY_LENGTH) {
    return NextResponse.json(
      { error: `Messages must be under ${MAX_BODY_LENGTH} characters` },
      { status: 400 },
    );
  }

  const recipient = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!recipient) {
    return NextResponse.json({ error: 'Hero not found' }, { status: 404 });
  }
  if (recipient.id === viewerId) {
    return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 });
  }
  if (!(await areFriends(viewerId, recipient.id))) {
    return NextResponse.json({ error: 'You can only message friends' }, { status: 403 });
  }

  const recentCount = await prisma.message.count({
    where: { senderId: viewerId, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recentCount >= MAX_MESSAGES_PER_HOUR) {
    return NextResponse.json(
      { error: `Rate limit: max ${MAX_MESSAGES_PER_HOUR} messages per hour` },
      { status: 429 },
    );
  }

  const message = await prisma.message.create({
    data: { senderId: viewerId, recipientId: recipient.id, body: clean },
    select: { id: true, body: true, createdAt: true },
  });

  return NextResponse.json({
    ok: true,
    message: {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      fromMe: true,
    },
  });
}
