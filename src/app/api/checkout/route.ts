import { NextRequest, NextResponse } from 'next/server';
import { stripe, calculatePlatformFee } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { productId, successUrl, cancelUrl } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product and creator data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        creators (
          stripe_account_id,
          stripe_onboarding_complete,
          display_name,
          handle
        )
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const creator = product.creators;
    
    // Check if creator has completed Stripe onboarding
    if (!creator.stripe_account_id || !creator.stripe_onboarding_complete) {
      return NextResponse.json(
        { error: 'Creator has not completed payment setup' },
        { status: 400 }
      );
    }

    // Calculate platform fee
    const platformFee = calculatePlatformFee(product.price_cents);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.thumbnail_url ? [product.thumbnail_url] : undefined,
            },
            unit_amount: product.price_cents,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${request.nextUrl.origin}/${creator.handle}?success=true`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}/${creator.handle}`,
      metadata: {
        productId: product.id,
        creatorId: product.creator_id,
        platformFee: platformFee.toString(),
      },
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: creator.stripe_account_id,
        },
        metadata: {
          productId: product.id,
          creatorId: product.creator_id,
        },
      },
      customer_creation: 'always',
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    // Track the checkout attempt
    await supabase
      .from('link_clicks')
      .insert({
        product_id: product.id,
        creator_id: product.creator_id,
        referrer: request.headers.get('referer') || '',
      });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Handle Stripe webhooks for order completion
export async function PUT(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature (in production, use webhook secret)
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Get customer details
        const customer = await stripe.customers.retrieve(
          session.customer as string
        );

        // Create order record
        await supabase
          .from('orders')
          .insert({
            product_id: session.metadata?.productId,
            creator_id: session.metadata?.creatorId,
            buyer_email: (customer as any).email,
            buyer_name: (customer as any).name,
            amount_cents: session.amount_total || 0,
            platform_fee_cents: parseInt(session.metadata?.platformFee || '0'),
            stripe_payment_intent_id: session.payment_intent as string,
            status: 'completed',
          });

        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        // Update order status to failed
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        break;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    
    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 400 }
    );
  }
}