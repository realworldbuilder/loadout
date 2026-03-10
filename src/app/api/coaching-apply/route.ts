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
    const { 
      creator_id, 
      product_id, 
      name, 
      email, 
      phone, 
      instagram, 
      age,
      location,
      how_found,
      goals, 
      why_important,
      holding_back,
      experience, 
      training_focus,
      training_days_per_week,
      preferred_days,
      gym_type,
      equipment,
      tracked_macros,
      food_allergies,
      has_food_scale,
      current_weight,
      current_height,
      commitment_ready,
      why_this_coach,
      photo_urls,
      budget, 
      message 
    } = body;

    if (!creator_id || !name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Combine goals-related fields into the existing goals field
    const combinedGoals = [
      goals && `Main Goal: ${goals}`,
      why_important && `Why Important: ${why_important}`, 
      holding_back && `What's Holding Back: ${holding_back}`
    ].filter(Boolean).join('\n\n');

    // Combine training focus array into a string
    const trainingFocusString = Array.isArray(training_focus) ? training_focus.join(', ') : '';

    const { data, error } = await supabase
      .from('coaching_applications')
      .insert({
        creator_id,
        product_id: product_id || null,
        name,
        email,
        phone: phone || null,
        instagram: instagram || null,
        age: age || null,
        location: location || null,
        how_found: how_found || null,
        goals: combinedGoals || null,
        experience: experience || null,
        training_days_per_week: training_days_per_week || null,
        preferred_days: preferred_days || null,
        gym_type: gym_type || null,
        equipment: equipment || null,
        tracked_macros: tracked_macros || null,
        food_allergies: food_allergies || null,
        has_food_scale: has_food_scale,
        current_weight: current_weight || null,
        current_height: current_height || null,
        commitment_ready: commitment_ready,
        why_this_coach: why_this_coach || null,
        photo_urls: photo_urls || null,
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('coaching_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating application status:', error);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error in coaching-apply PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
