import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

const CARD_NAMES: Record<string, string> = {
  code: 'Spellwright',
  design: 'Visual Alchemist',
  learning: 'Arcane Student',
  body: 'Iron Temperer',
  creative: 'Bard of the Realm',
  other: 'Keeper of Mysteries'
};

const VALID_CATEGORIES = new Set(['code', 'design', 'learning', 'body', 'creative', 'other']);
const MAX_TEXT_LENGTH = 2000;

// Singleton — avoids re-instantiation on every request
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Soft rate limit: max 10 forge calls per hour per user (checked via recent chapters)
    const recentForge = await prisma.chapter.count({
      where: { userId: session.user.id!, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recentForge >= 10) {
      return NextResponse.json({ error: 'Rate limit: max 10 forge entries per hour' }, { status: 429 });
    }

    const wordCount = sanitizedText.trim().split(/\s+/).length;
    const xpEarned = Math.min(500, wordCount * 3 + 50);

    let cardName: string | undefined;
    if (xpEarned >= 150) {
      cardName = CARD_NAMES[category] || CARD_NAMES['other'];
    }

    if (!genAI) {
      const fallbackNarrative = `In the chronicles of your legend, this day shall be remembered. You undertook ${category} work of significance, and through it, your mastery grew by ${xpEarned} XP. The saga continues.`;
      return NextResponse.json({ narrative: fallbackNarrative, xpEarned, cardName });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are the narrator of DEVLORE, a dark fantasy chronicle of developer legends. A hero has shared what they accomplished. Transform it into one paragraph (4-6 sentences) of immersive fantasy saga prose.

The hero selected category: ${category}
What they accomplished: ${sanitizedText}

Write in the voice of an epic fantasy narrator. Use second person ('you'). Reference the category metaphorically (code = spellwork/incantations, design = visual alchemy, learning = arcane study, body = physical tempering, creative = bardic creation, other = a mysterious deed). Make it dramatic and specific to what they actually described. End with a statement about how it advances their legend.

Return ONLY the narrative paragraph, no other text.`;

    const result = await model.generateContent(prompt);
    const narrative = result.response.text().trim();

    return NextResponse.json({ narrative, xpEarned, cardName });

  } catch (error) {
    console.error('Forge API Error:', error);
    return NextResponse.json({ error: 'Failed to forge narrative' }, { status: 500 });
  }
}
