import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { creator_id, email } = await request.json();
    
    if (!creator_id || !email) {
      return NextResponse.json({ error: 'Missing creator_id or email' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = getSupabase();
    
    // Use upsert to handle duplicates gracefully
    const { data, error } = await supabase
      .from('email_subscribers')
      .upsert({
        creator_id,
        email: email.toLowerCase().trim(),
        source: 'page',
        is_active: true
      }, {
        onConflict: 'creator_id,email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Subscribe error:', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('Subscribe error:', e);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const creator_id = request.nextUrl.searchParams.get('creator_id');
    
    if (!creator_id) {
      return NextResponse.json({ error: 'Missing creator_id' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { count, error } = await supabase
      .from('email_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', creator_id)
      .eq('is_active', true);

    if (error) {
      console.error('Get subscriber count error:', error);
      return NextResponse.json({ error: 'Failed to get subscriber count' }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (e) {
    console.error('Get subscriber count error:', e);
    return NextResponse.json({ error: 'Failed to get subscriber count' }, { status: 500 });
  }
}