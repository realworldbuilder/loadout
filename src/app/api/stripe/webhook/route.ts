import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const supabase = getSupabase();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Create order record
        await supabase.from('orders').insert({
          product_id: session.metadata?.productId,
          creator_id: session.metadata?.creatorId,
          buyer_email: session.customer_details?.email || '',
          buyer_name: session.customer_details?.name || '',
          amount_cents: session.amount_total || 0,
          platform_fee_cents: parseInt(session.metadata?.platformFee || '0'),
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'completed',
        });

        break;
      }

      case 'account.updated': {
        // Stripe Connect account was updated — check if onboarding complete
        const account = event.data.object;
        if (account.charges_enabled && account.payouts_enabled) {
          await supabase
            .from('creators')
            .update({ stripe_onboarding_complete: true })
            .eq('stripe_account_id', account.id);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
