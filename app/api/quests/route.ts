import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getQuestBoard } from '@/lib/quests/engine';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const board = await getQuestBoard(session.user.id);
    return NextResponse.json(board);
  } catch (error) {
    console.error('[api/quests] Failed to build quest board:', error);
    return NextResponse.json({ error: 'Failed to load quests' }, { status: 500 });
  }
}
