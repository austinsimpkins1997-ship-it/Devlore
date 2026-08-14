import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest/client';

export const maxDuration = 60;

/**
 * Weekly chapter generation cron — runs every Monday at 09:00 UTC
 * Configured in vercel.json: { "crons": [{ "path": "/api/cron/weekly", "schedule": "0 9 * * 1" }] }
 *
 * Security: Vercel sets Authorization: Bearer <CRON_SECRET> automatically
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const weekEnd = new Date(now);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  // Format dates as ISO strings for Inngest data
  const weekStartISO = weekStart.toISOString();
  const weekEndISO = weekEnd.toISOString();

  try {
    // Get all PRO + LEGEND users who haven't gotten a chapter this week
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const eligibleUsers = await prisma.user.findMany({
      where: {
        tier: { in: ['PRO', 'LEGEND'] },
        // Only users who have completed their initial analysis
        heroClass: { not: null },
      },
      select: {
        id: true,
        username: true,
        accounts: {
          where: { provider: 'github' },
          select: { access_token: true },
          take: 1,
        },
        chapters: {
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { id: true },
          take: 1,
        },
      },
    });

    let dispatched = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const user of eligibleUsers) {
      // Skip if they already got a chapter this week
      if (user.chapters.length > 0) {
        skipped++;
        continue;
      }

      const accessToken = user.accounts[0]?.access_token;
      if (!accessToken) {
        errors.push(`${user.username}: no GitHub token`);
        skipped++;
        continue;
      }

      try {
        await inngest.send({
          name: 'devlore/chapter.generate',
          data: {
            userId: user.id,
            accessToken,
            weekStart: weekStartISO,
            weekEnd: weekEndISO,
          },
        });
        dispatched++;
      } catch (err) {
        errors.push(`${user.username}: ${String(err)}`);
      }
    }

    console.log(
      `[cron/weekly] Dispatched: ${dispatched}, Skipped: ${skipped}, Errors: ${errors.length}`,
    );

    return NextResponse.json({
      success: true,
      weekStart: weekStartISO,
      weekEnd: weekEndISO,
      dispatched,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[cron/weekly] Fatal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
