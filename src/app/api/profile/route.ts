import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('user_id');
    const handle = request.nextUrl.searchParams.get('handle');

    const supabase = getServiceSupabase();

    // If handle is provided, check handle availability
    if (handle) {
      const { data, error } = await supabase
        .from('creators')
        .select('handle')
        .eq('handle', handle)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows found, handle is available
        return NextResponse.json({ available: true });
      }

      if (error) {
        console.error('Handle check error:', error);
        return NextResponse.json({ available: false, error: 'Failed to check handle availability' }, { status: 500 });
      }

      // Handle exists
      return NextResponse.json({ available: false, error: 'Handle already taken' });
    }

    // Otherwise, fetch profile by user_id
    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id or handle' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No profile found
      return NextResponse.json({ data: null });
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json();

    if (!profileData.user_id || !profileData.handle || !profileData.display_name) {
      return NextResponse.json({ error: 'Missing required fields: user_id, handle, display_name' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('creators')
      .insert([{
        ...profileData,
        is_active: true,
        tier: 'free',
        subscription_tier: 'free',
        stripe_onboarding_complete: false,
        theme: {
          primary: '#10a37f',
          background: '#0d0d0d'
        }
      }])
      .select()
      .single();

    if (error) {
      console.error('Profile create error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Profile create error:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user_id, ...updates } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('creators')
      .update(updates)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
