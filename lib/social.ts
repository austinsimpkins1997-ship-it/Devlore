// ─────────────────────────────────────────────────────────────────────────────
// DEVLORE — Social graph helpers
//
// Friendships are stored once per pair (requester → addressee). Helpers here
// normalize direction so callers never have to care who sent the request.
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma';

export interface FriendSummary {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  heroClass: string | null;
  level: number;
  unreadCount: number;
}

export interface PendingRequest {
  friendshipId: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  heroClass: string | null;
  level: number;
}

const USER_CARD_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  heroClass: true,
  level: true,
} as const;

/** True when the two users have an ACCEPTED friendship in either direction. */
export async function areFriends(userA: string, userB: string): Promise<boolean> {
  const found = await prisma.friendship.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { requesterId: userA, addresseeId: userB },
        { requesterId: userB, addresseeId: userA },
      ],
    },
    select: { id: true },
  });
  return found !== null;
}

export type RelationshipState =
  | 'self'
  | 'friends'
  | 'request_sent'
  | 'request_received'
  | 'none';

export async function getRelationship(
  viewerId: string,
  targetId: string,
): Promise<RelationshipState> {
  if (viewerId === targetId) return 'self';

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: viewerId, addresseeId: targetId },
        { requesterId: targetId, addresseeId: viewerId },
      ],
      status: { in: ['PENDING', 'ACCEPTED'] },
    },
    select: { requesterId: true, status: true },
  });

  if (!friendship) return 'none';
  if (friendship.status === 'ACCEPTED') return 'friends';
  return friendship.requesterId === viewerId ? 'request_sent' : 'request_received';
}

/** Accepted friends, with per-friend unread message counts. */
export async function listFriends(userId: string): Promise<FriendSummary[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: {
      requester: { select: USER_CARD_SELECT },
      addressee: { select: USER_CARD_SELECT },
    },
  });

  const friends = friendships.map((f) =>
    f.requester.id === userId ? f.addressee : f.requester,
  );
  if (friends.length === 0) return [];

  const unread = await prisma.message.groupBy({
    by: ['senderId'],
    where: {
      recipientId: userId,
      readAt: null,
      senderId: { in: friends.map((f) => f.id) },
    },
    _count: { _all: true },
  });
  const unreadMap = new Map(unread.map((u) => [u.senderId, u._count._all]));

  return friends
    .map((f) => ({ ...f, unreadCount: unreadMap.get(f.id) ?? 0 }))
    .sort((a, b) => b.unreadCount - a.unreadCount || a.displayName.localeCompare(b.displayName));
}

/** Friend requests awaiting this user's response. */
export async function listIncomingRequests(userId: string): Promise<PendingRequest[]> {
  const requests = await prisma.friendship.findMany({
    where: { addresseeId: userId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, requester: { select: USER_CARD_SELECT } },
  });

  return requests.map((r) => ({
    friendshipId: r.id,
    username: r.requester.username,
    displayName: r.requester.displayName,
    avatarUrl: r.requester.avatarUrl,
    heroClass: r.requester.heroClass,
    level: r.requester.level,
  }));
}
