import { NextRequest, NextResponse } from 'next/server';
import { stripe, calculatePlatformFee } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
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
          handle,
          tier
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

    // Calculate platform fee (0% for pro creators)
    const isPro = creator.tier === 'pro' || creator.tier === 'studio';
    const platformFee = calculatePlatformFee(product.price_cents, isPro);

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
        ...(platformFee > 0 ? { application_fee_amount: platformFee } : {}),
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