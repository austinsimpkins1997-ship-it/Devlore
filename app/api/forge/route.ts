import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateText } from '@/lib/ai/client';
import { awardXpWithLoot, type EquipmentDrop } from '@/lib/equipment';

const CARD_NAMES: Record<string, string> = {
  code: 'Spellwright',
  design: 'Visual Alchemist',
  learning: 'Arcane Student',
  body: 'Iron Temperer',
  creative: 'Bard of the Realm',
  other: 'Keeper of Mysteries',
};

const VALID_CATEGORIES = new Set(['code', 'design', 'learning', 'body', 'creative', 'other']);
const MAX_TEXT_LENGTH = 2000;
const MAX_ENTRIES_PER_HOUR = 10;

async function generateNarrative(category: string, sanitizedText: string, xpEarned: number): Promise<string> {
  const fallback = `In the chronicles of your legend, this day shall be remembered. You undertook ${category} work of significance, and through it, your mastery grew by ${xpEarned} XP. The saga continues.`;

  try {
    const prompt = `You are the narrator of DEVLORE, a dark fantasy chronicle of developer legends. A hero has shared what they accomplished. Transform it into one paragraph (4-6 sentences) of immersive fantasy saga prose.

The hero selected category: ${category}
What they accomplished: ${sanitizedText}

Write in the voice of an epic fantasy narrator. Use second person ('you'). Reference the category metaphorically (code = spellwork/incantations, design = visual alchemy, learning = arcane study, body = physical tempering, creative = bardic creation, other = a mysterious deed). Make it dramatic and specific to what they actually described. End with a statement about how it advances their legend.

Return ONLY the narrative paragraph, no other text.`;

    const { text } = await generateText({
      prompt,
      temperature: 0.85,
      maxTokens: 512,
    });
    const narrative = text.trim();
    return narrative.length > 0 ? narrative : fallback;
  } catch (error) {
    console.error('[api/forge] All AI providers failed, using fallback:', error);
    return fallback;
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { category, text } = body;

    // Input validation
    if (!category || !text) {
      return NextResponse.json({ error: 'Missing category or text' }, { status: 400 });
    }
    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    if (typeof text !== 'string' || text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: `Text must be under ${MAX_TEXT_LENGTH} characters` }, { status: 400 });
    }

    // Sanitize — strip HTML tags before sending to AI (prompt injection guard)
    const sanitizedText = text.replace(/<[^>]*>/g, '').trim();
    if (!sanitizedText) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
    }

    // Rate limit: max 10 forge entries per hour per user
    const recentEntries = await prisma.forgeEntry.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recentEntries >= MAX_ENTRIES_PER_HOUR) {
      return NextResponse.json(
        { error: `Rate limit: max ${MAX_ENTRIES_PER_HOUR} forge entries per hour` },
        { status: 429 },
      );
    }

    const wordCount = sanitizedText.split(/\s+/).filter((w) => w.length > 0).length;
    const xpEarned = Math.min(500, wordCount * 3 + 50);
    const cardName = xpEarned >= 150 ? (CARD_NAMES[category] ?? CARD_NAMES.other) : undefined;

    const narrative = await generateNarrative(category, sanitizedText, xpEarned);

    // Persist the entry and award XP + loot atomically
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    let drops: EquipmentDrop[] = [];
    let newXp = user.xp;
    let newLevel = user.level;

    await prisma.$transaction(async (tx) => {
      await tx.forgeEntry.create({
        data: { userId, category, text: sanitizedText, narrative, wordCount, xpEarned },
      });
      const award = await awardXpWithLoot(tx, userId, user.xp, user.level, xpEarned);
      drops = award.drops;
      newXp = award.newXp;
      newLevel = award.newLevel;
      if (cardName) {
        await tx.loreCard.create({
          data: {
            userId,
            cardType: 'ACHIEVEMENT',
            rarity: xpEarned >= 300 ? 'RARE' : 'UNCOMMON',
            name: cardName,
            flavorText: narrative.length > 180 ? `${narrative.slice(0, 177)}...` : narrative,
            milestone: `Forged a ${category} entry of ${wordCount} words`,
            xpValue: xpEarned,
          },
        });
      }
    });

    return NextResponse.json({
      narrative,
      xpEarned,
      cardName,
      newXp,
      newLevel,
      leveledUp: newLevel > user.level,
      drops,
      saved: true,
    });
  } catch (error) {
    console.error('Forge API Error:', error);
    return NextResponse.json({ error: 'Failed to forge narrative' }, { status: 500 });
  }
}
