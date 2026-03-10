import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET: Callback after Stripe Connect onboarding
export async function GET(request: NextRequest) {
  const accountId = request.nextUrl.searchParams.get('account_id');
  const returnPath = request.nextUrl.searchParams.get('return_path') || '/dashboard/settings';

  if (!accountId) {
    return NextResponse.redirect(new URL(`${returnPath}?stripe=error`, request.url));
  }

  try {
    // Check if the account has completed onboarding
    const account = await stripe.accounts.retrieve(accountId);
    const supabase = getSupabase();

    if (account.charges_enabled && account.payouts_enabled) {
      // Onboarding complete — update database
      await supabase
        .from('creators')
        .update({ stripe_onboarding_complete: true })
        .eq('stripe_account_id', accountId);

      return NextResponse.redirect(
        new URL(`${returnPath}?stripe=success`, request.url)
      );
    } else {
      // Not fully onboarded yet — they may need to provide more info
      return NextResponse.redirect(
        new URL(`${returnPath}?stripe=pending`, request.url)
      );
    }
  } catch (error) {
    console.error('Stripe callback error:', error);
    return NextResponse.redirect(
      new URL(`${returnPath}?stripe=error`, request.url)
    );
  }
}
