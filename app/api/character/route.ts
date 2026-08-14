import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { computeStatSheet, sanitizeAppearance } from '@/lib/character';
import type { Tier } from '@/types';

export const runtime = 'nodejs';

/** GET /api/character — appearance, inventory, equipped gear, and stat sheet. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: {
        charBody: true, charSkin: true, charHair: true, charCloak: true,
        charAura: true, charCreated: true,
        level: true, xp: true, tier: true,
        currentStreak: true, longestStreak: true, totalCommits: true,
        languageCount: true, openSourceContribCount: true,
        heroClass: true, heroTitle: true, displayName: true, username: true,
        equipment: { orderBy: [{ equipped: 'desc' }, { power: 'desc' }] },
        _count: { select: { trophies: true } },
      },
    });

    const equipped = user.equipment.filter((e) => e.equipped);
    const sheet = computeStatSheet({
      level: user.level,
      tier: user.tier as Tier,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalCommits: user.totalCommits,
      languageCount: user.languageCount,
      openSourceContribCount: user.openSourceContribCount,
      trophyCount: user._count.trophies,
      equipped: equipped.map((e) => ({ slot: e.slot, rarity: e.rarity, power: e.power })),
    });

    return NextResponse.json({
      appearance: {
        charBody: user.charBody, charSkin: user.charSkin, charHair: user.charHair,
        charCloak: user.charCloak, charAura: user.charAura,
      },
      charCreated: user.charCreated,
      hero: {
        displayName: user.displayName, username: user.username,
        heroClass: user.heroClass, heroTitle: user.heroTitle,
        level: user.level, xp: user.xp, tier: user.tier,
      },
      equipment: user.equipment.map((e) => ({
        id: e.id, slot: e.slot, rarity: e.rarity, name: e.name,
        flavorText: e.flavorText, power: e.power,
        levelAwarded: e.levelAwarded, equipped: e.equipped,
      })),
      sheet,
    });
  } catch (error) {
    console.error('[api/character] Failed:', error);
    return NextResponse.json({ error: 'Failed to load character' }, { status: 500 });
  }
}

/** PATCH /api/character — save appearance (also completes character creation). */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const appearance = sanitizeAppearance({
    charBody: typeof payload.charBody === 'string' ? payload.charBody : undefined,
    charSkin: typeof payload.charSkin === 'string' ? payload.charSkin : undefined,
    charHair: typeof payload.charHair === 'string' ? payload.charHair : undefined,
    charCloak: typeof payload.charCloak === 'string' ? payload.charCloak : undefined,
    charAura: typeof payload.charAura === 'string' ? payload.charAura : undefined,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { ...appearance, charCreated: true },
  });

  return NextResponse.json({ ok: true, appearance });
}
