import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe, createOrRetrieveCustomer } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { priceId } = await req.json();
    
    if (!priceId) {
       return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }
    
    const customerId = await createOrRetrieveCustomer({ 
      userId: session.user.id, 
      email: session.user.email 
    });
    
    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      customer: customerId,
      subscription_data: { trial_period_days: 14 },
      metadata: { userId: session.user.id },
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://devlore.app'}/dashboard?checkout=success`,
    });

    return NextResponse.json({ clientSecret: checkoutSession.client_secret });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
