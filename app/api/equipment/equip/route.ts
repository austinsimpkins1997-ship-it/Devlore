import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * POST /api/equipment/equip — equip or unequip an owned item.
 * Equipping swaps out whatever occupies that slot, atomically.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let equipmentId: unknown;
  let equip: unknown;
  try {
    const body = await req.json();
    equipmentId = body?.equipmentId;
    equip = body?.equip;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (typeof equipmentId !== 'string' || typeof equip !== 'boolean') {
    return NextResponse.json({ error: 'Missing equipmentId or equip flag' }, { status: 400 });
  }

  // Ownership check before any mutation.
  const item = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    select: { id: true, userId: true, slot: true },
  });
  if (!item || item.userId !== userId) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    if (equip) {
      await tx.equipment.updateMany({
        where: { userId, slot: item.slot, equipped: true },
        data: { equipped: false },
      });
    }
    await tx.equipment.update({ where: { id: item.id }, data: { equipped: equip } });
  });

  return NextResponse.json({ ok: true, equipmentId: item.id, equipped: equip });
}
