import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('handle', handle)
      .single();

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Creator by handle API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
