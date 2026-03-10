import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST: Create or retrieve Stripe Connect account and return onboarding link
export async function POST(request: NextRequest) {
  try {
    const { userId, returnPath } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Get creator profile
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, stripe_account_id, stripe_onboarding_complete, display_name, handle')
      .eq('user_id', userId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    let stripeAccountId = creator.stripe_account_id;

    // Create new Stripe Connect Express account if none exists
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          loadout_creator_id: creator.id,
          loadout_handle: creator.handle,
        },
      });

      stripeAccountId = account.id;

      // Save to database
      await supabase
        .from('creators')
        .update({ stripe_account_id: account.id })
        .eq('id', creator.id);
    }

    // Check if onboarding is already complete
    if (creator.stripe_onboarding_complete) {
      // Return dashboard link instead
      const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
      return NextResponse.json({ 
        url: loginLink.url, 
        status: 'complete' 
      });
    }

    // Create account onboarding link
    const origin = request.nextUrl.origin;
    const finalReturnPath = returnPath || '/dashboard/settings';
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${origin}/dashboard/settings?stripe=refresh`,
      return_url: `${origin}/api/stripe/connect/callback?account_id=${stripeAccountId}&return_path=${encodeURIComponent(finalReturnPath)}`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ 
      url: accountLink.url, 
      status: 'pending' 
    });

  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe account' },
      { status: 500 }
    );
  }
}

// GET: Check Stripe Connect status for a creator
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: creator, error } = await supabase
      .from('creators')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('user_id', userId)
      .single();

    if (error || !creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    if (!creator.stripe_account_id) {
      return NextResponse.json({ status: 'not_connected' });
    }

    if (creator.stripe_onboarding_complete) {
      return NextResponse.json({ status: 'complete' });
    }

    // Check with Stripe if onboarding was completed but we missed the update
    try {
      const account = await stripe.accounts.retrieve(creator.stripe_account_id);
      if (account.charges_enabled && account.payouts_enabled) {
        // Update our DB
        await supabase
          .from('creators')
          .update({ stripe_onboarding_complete: true })
          .eq('stripe_account_id', creator.stripe_account_id);
        
        return NextResponse.json({ status: 'complete' });
      }
    } catch (e) {
      // Stripe account might not exist anymore
    }

    return NextResponse.json({ status: 'pending' });

  } catch (error: any) {
    console.error('Stripe status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}
