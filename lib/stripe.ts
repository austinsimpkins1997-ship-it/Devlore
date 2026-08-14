import Stripe from 'stripe';
import { Tier } from '@/types';
import { prisma } from '@/lib/prisma';

/**
 * Lazy singleton — prevents module-level Stripe initialization during
 * Next.js static analysis (build-time page data collection) when
 * STRIPE_SECRET_KEY is not available in the build environment.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('[DevLore] STRIPE_SECRET_KEY is not set. Add it to your .env.local file.');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2025-02-24.acacia',
      appInfo: {
        name: 'DevLore',
        version: '0.1.0',
      },
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead for lazy initialization */
// Kept for backward compatibility — this will throw if STRIPE_SECRET_KEY is missing at import time
// but we export a getter as the preferred API
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get subscriptions() { return getStripe().subscriptions; },
  get webhooks() { return getStripe().webhooks; },
  get billingPortal() { return getStripe().billingPortal; },
  get prices() { return getStripe().prices; },
} as unknown as Stripe;

export const PLANS = {
  PRO: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? 'price_pro_placeholder',
    name: 'Pro',
    price: 5,
    features: [
      'Automatic weekly AI chronicles',
      'Unlimited chapter history',
      'Weekly quest XP claims',
      'Chronicle emails & manual re-analysis',
    ],
  },
  LEGEND: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_LEGEND_PRICE_ID ?? 'price_legend_placeholder',
    name: 'Legend',
    price: 15,
    features: [
      'Everything in Pro',
      '1.5× XP on every quest claim',
      'Unlimited lore card collection',
      'Legend flair on the leaderboard',
    ],
  },
};

export function getTierFromPriceId(priceId: string): Tier {
  if (priceId === PLANS.PRO.priceId) return 'PRO';
  if (priceId === PLANS.LEGEND.priceId) return 'LEGEND';
  return 'FREE';
}

export async function createOrRetrieveCustomer({
  userId,
  email,
}: {
  userId: string;
  email: string;
}): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await getStripe().customers.create({
    email,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
