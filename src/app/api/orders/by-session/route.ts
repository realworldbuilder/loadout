import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Get checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session.payment_intent) {
      return NextResponse.json(
        { error: 'payment_intent not found in session' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Look up order by stripe payment intent ID and join with products
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          id,
          title,
          description,
          type,
          file_url,
          thumbnail_url
        )
      `)
      .eq('stripe_payment_intent_id', session.payment_intent)
      .eq('status', 'completed')
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'order not found or not completed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        buyer_email: order.buyer_email,
        buyer_name: order.buyer_name,
        amount_cents: order.amount_cents,
      },
      product: order.products,
    });

  } catch (error) {
    console.error('Order lookup error:', error);
    
    return NextResponse.json(
      { error: 'failed to look up order' },
      { status: 500 }
    );
  }
}