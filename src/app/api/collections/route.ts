import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmZtdXJ0aW5nYmt5bGpwZHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY0NjEzOCwiZXhwIjoyMDg4MjIyMTM4fQ.hb-dIFb0Zia4vPhTSelofdPk6pk1HSPKdwWOHiWErH4'
);

// GET - List collections for a creator
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get('creator_id');

  if (!creatorId) {
    return NextResponse.json({ error: 'creator_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('creator_collections')
    .select('*')
    .eq('creator_id', creatorId)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST - Create a collection
export async function POST(request: NextRequest) {
  const { creator_id, name, emoji } = await request.json();

  if (!creator_id || !name) {
    return NextResponse.json({ error: 'creator_id and name required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('creator_collections')
    .upsert({ creator_id, name: name.toLowerCase().trim(), emoji }, { onConflict: 'creator_id,name' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE - Delete a collection
export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  // Clear collection reference from picks
  await supabase
    .from('creator_picks')
    .update({ collection: null })
    .eq('collection', id);

  const { error } = await supabase
    .from('creator_collections')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
