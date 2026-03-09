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
    const body = await request.json();
    const { creator_id, product_id, name, email, phone, instagram, goals, experience, budget, message } = body;

    if (!creator_id || !name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('coaching_applications')
      .insert({
        creator_id,
        product_id: product_id || null,
        name,
        email,
        phone: phone || null,
        instagram: instagram || null,
        goals: goals || null,
        experience: experience || null,
        budget: budget || null,
        message: message || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving coaching application:', error);
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error in coaching-apply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creator_id');

    if (!creatorId) {
      return NextResponse.json({ error: 'creator_id required' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('coaching_applications')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in coaching-apply GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
