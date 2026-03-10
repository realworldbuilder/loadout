import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
      .from('application_forms')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching application form:', error);
      return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
    }

    return NextResponse.json({ data: data || null });
  } catch (error) {
    console.error('Error in application-forms GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creator_id, name, intro_text, confirmation_text, fields } = body;

    if (!creator_id || !fields) {
      return NextResponse.json({ error: 'creator_id and fields are required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // First, deactivate any existing forms for this creator
    await supabase
      .from('application_forms')
      .update({ is_active: false })
      .eq('creator_id', creator_id);

    // Create the new form
    const { data, error } = await supabase
      .from('application_forms')
      .insert({
        creator_id,
        name: name || 'Coaching Application',
        intro_text: intro_text || null,
        confirmation_text: confirmation_text || 'application submitted. sit tight.',
        fields,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application form:', error);
      return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error in application-forms POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, creator_id, name, intro_text, confirmation_text, fields } = body;

    if (!id || !creator_id || !fields) {
      return NextResponse.json({ error: 'id, creator_id and fields are required' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('application_forms')
      .update({
        name: name || 'Coaching Application',
        intro_text: intro_text || null,
        confirmation_text: confirmation_text || 'application submitted. sit tight.',
        fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('creator_id', creator_id) // Ensure creator can only update their own forms
      .select()
      .single();

    if (error) {
      console.error('Error updating application form:', error);
      return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error in application-forms PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}