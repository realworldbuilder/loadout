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
    const supabase = getServiceSupabase();
    const active = request.nextUrl.searchParams.get('active');
    const search = request.nextUrl.searchParams.get('search');
    const userId = request.nextUrl.searchParams.get('user_id');

    // Fetch creator by user_id
    if (userId) {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        return NextResponse.json({ data: [] });
      }
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ data: data ? [data] : [] });
    }

    // Search creators
    if (search) {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .or(`handle.ilike.%${search}%,display_name.ilike.%${search}%`)
        .limit(20);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ data: data || [] });
    }

    // Fetch active creators (has at least a handle set)
    let query = supabase.from('creators').select('*');

    if (active === 'true') {
      query = query.not('handle', 'is', null).not('handle', 'eq', '');
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Creators API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
