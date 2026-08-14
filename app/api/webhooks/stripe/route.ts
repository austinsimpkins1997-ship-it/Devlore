import { NextRequest, NextResponse } from 'next/server';
import { stripe, getTierFromPriceId } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

export const runtime = 'nodejs';

/**
 * Stripe webhook handler — the authoritative source of truth for subscription state.
 *
 * CRITICAL: This handler:
 * 1. Verifies the Stripe-Signature header before processing ANYTHING
 * 2. Always returns 200 (Stripe retries on non-2xx for 72 hours)
 * 3. Processes events idempotently (safe to receive same event twice)
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe-Signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[stripe/webhook] Signature verification failed: ${message}`);
    return NextResponse.json({ error: `Signature error: ${message}` }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    // Log but return 200 — Stripe should not retry on application errors
    console.error(`[stripe/webhook] Error handling event ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

      if (!userId || !customerId) {
        console.warn('[stripe/webhook] checkout.session.completed: missing userId or customerId');
        return;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId: customerId,
          ...(subscriptionId ? { stripeSubId: subscriptionId } : {}),
        },
      });
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
      const priceId = sub.items.data[0]?.price.id;

      if (!priceId) {
        console.warn('[stripe/webhook] subscription event: no price ID found');
        return;
      }

      const tier = getTierFromPriceId(priceId);
      const periodEnd = new Date(sub.current_period_end * 1000);
      const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

      const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
      if (!user) {
        console.warn(`[stripe/webhook] No user found for Stripe customer ${customerId}`);
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          tier,
          stripeSubId: sub.id,
          stripePriceId: priceId,
          subCurrentPeriodEnd: periodEnd,
          trialEndsAt: trialEnd,
        },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

      const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
      if (!user) return;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          tier: 'FREE',
          stripeSubId: null,
          stripePriceId: null,
          subCurrentPeriodEnd: null,
          trialEndsAt: null,
        },
      });

      // TODO: Send "subscription ended" email via Resend
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
      if (!customerId) return;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
        select: { email: true, displayName: true },
      });

      if (user?.email && process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? 'DevLore <chronicles@devlore.app>',
            to: user.email,
            subject: 'Your DevLore payment failed — action required',
            html: `<p>Hi ${user.displayName},</p><p>We couldn't process your DevLore subscription payment. Please update your payment method at <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings">your settings</a> to keep your saga alive.</p>`,
          });
        } catch (emailErr) {
          console.error('[stripe/webhook] Failed to send payment failure email:', emailErr);
        }
      }
      // Grace period: don't immediately downgrade — Stripe's Smart Retries will retry for 7 days
      break;
    }

    case 'customer.subscription.trial_will_end': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
        select: { email: true, displayName: true, heroClass: true },
      });

      if (user?.email && process.env.RESEND_API_KEY) {
        const daysLeft = sub.trial_end
          ? Math.ceil((sub.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
          : 3;

        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? 'DevLore <chronicles@devlore.app>',
            to: user.email,
            subject: `Your legend trial ends in ${daysLeft} days`,
            html: `<p>The ${user.heroClass ?? 'hero'} ${user.displayName},</p><p>Your DevLore trial ends in ${daysLeft} days. Your saga and all collected lore cards will remain — but new chapters will stop being written unless you subscribe.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing">Continue your legend →</a></p>`,
          });
        } catch (emailErr) {
          console.error('[stripe/webhook] Failed to send trial ending email:', emailErr);
        }
      }
      break;
    }

    default:
      // Unhandled event type — log for debugging
      console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
  }
}
