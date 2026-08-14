import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CARD_NAMES: Record<string, string> = {
  code: 'Spellwright',
  design: 'Visual Alchemist',
  learning: 'Arcane Student',
  body: 'Iron Temperer',
  creative: 'Bard of the Realm',
  other: 'Keeper of Mysteries'
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { category, text } = body;

    if (!category || !text) {
      return NextResponse.json({ error: 'Missing category or text' }, { status: 400 });
    }

    const wordCount = text.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    let xpEarned = Math.min(500, wordCount * 3 + 50);
    
    let cardName: string | undefined;
    if (xpEarned >= 150) {
      cardName = CARD_NAMES[category] || CARD_NAMES['other'];
    }

    if (!process.env.GEMINI_API_KEY) {
      const fallbackNarrative = `In the chronicles of your legend, this day shall be remembered. You undertook ${category} work of significance, and through it, your mastery grew by ${xpEarned} XP. The saga continues.`;
      return NextResponse.json({ narrative: fallbackNarrative, xpEarned, cardName });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are the narrator of DEVLORE, a dark fantasy chronicle of developer legends. A hero has shared what they accomplished. Transform it into one paragraph (4-6 sentences) of immersive fantasy saga prose.

The hero selected category: ${category}
What they accomplished: ${text}

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
