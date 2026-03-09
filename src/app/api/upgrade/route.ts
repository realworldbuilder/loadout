import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId, tier } = await request.json();

    if (!userId || !tier) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, tier' 
      }, { status: 400 });
    }

    if (tier !== 'pro' && tier !== 'free') {
      return NextResponse.json({ 
        error: 'Invalid tier. Must be "free" or "pro"' 
      }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    
    const { data, error } = await supabase
      .from('creators')
      .update({ 
        subscription_tier: tier,
        tier: tier // Keep both fields in sync for now
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Upgrade error:', error);
      return NextResponse.json({ 
        error: 'Failed to update subscription tier' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tier: data.subscription_tier,
      message: `Successfully ${tier === 'pro' ? 'upgraded to' : 'downgraded to'} ${tier} tier`
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json({ 
      error: 'Failed to process upgrade request' 
    }, { status: 500 });
  }
}