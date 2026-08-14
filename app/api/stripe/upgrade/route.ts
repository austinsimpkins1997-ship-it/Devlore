import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PLANS, createOrRetrieveCustomer, getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

/**
 * POST /api/stripe/upgrade  { plan: "PRO" | "LEGEND" }
 * -> { url } : a Stripe-hosted Checkout URL to redirect the browser to.
 *
 * Why hosted rather than the embedded session in /api/stripe/checkout:
 * embedded checkout requires @stripe/react-stripe-js to mount the iframe, and
 * that package is not a dependency of this project. The embedded endpoint is
 * left untouched for whenever that UI is built; this route is what the live
 * upgrade buttons use so the flow actually works today.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to upgrade' }, { status: 401 });
  }

  let plan: unknown;
  try {
    const body = await req.json();
    plan = body?.plan;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (plan !== 'PRO' && plan !== 'LEGEND') {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
  }

  const priceId = PLANS[plan].priceId;
  if (!priceId || priceId.startsWith('price_') === false || priceId.includes('placeholder')) {
    console.error(`[stripe/upgrade] Missing price id for ${plan}`);
    return NextResponse.json(
      { error: 'Billing is not configured for this plan yet. Please contact support.' },
      { status: 503 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, tier: true, stripeCustomerId: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }
  if (user.tier === plan) {
    return NextResponse.json({ error: `You are already on ${plan}.` }, { status: 409 });
  }

  const email = user.email ?? session.user.email;
  if (!email) {
    return NextResponse.json(
      { error: 'Your GitHub account has no public email. Add one to subscribe.' },
      { status: 400 },
    );
  }

  try {
    const customerId = await createOrRetrieveCustomer({ userId: session.user.id, email });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://devloreapp.vercel.app';

    // Only offer the trial to users who have never subscribed before.
    const hadSubscription = Boolean(user.stripeCustomerId) && user.tier !== 'FREE';

    const checkout = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: session.user.id, plan },
      subscription_data: hadSubscription ? undefined : { trial_period_days: 14 },
      allow_promotion_codes: true,
      success_url: `${appUrl}/dashboard/settings?checkout=success`,
      cancel_url: `${appUrl}/dashboard/settings?checkout=cancelled`,
    });

    if (!checkout.url) {
      throw new Error('Stripe returned no checkout URL');
    }
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error('[stripe/upgrade] Failed:', error);
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 500 },
    );
  }
}
