import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations (no RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmZtdXJ0aW5nYmt5bGpwZHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY0NjEzOCwiZXhwIjoyMDg4MjIyMTM4fQ.hb-dIFb0Zia4vPhTSelofdPk6pk1HSPKdwWOHiWErH4'
);

// GET - List picks for a creator
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creator_id');
    const codeId = searchParams.get('code_id');
    const isPublic = searchParams.get('public') === 'true';

    if (!creatorId) {
      return NextResponse.json(
        { error: 'creator_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('creator_picks')
      .select('*')
      .eq('creator_id', creatorId);

    // Filter by code_id if provided
    if (codeId) {
      query = query.eq('code_id', codeId);
    }

    // For public requests, only return active picks
    if (isPublic) {
      query = query.eq('is_active', true);
    }

    // Order by sort_order, then created_at
    query = query.order('sort_order', { ascending: true })
                 .order('created_at', { ascending: true });

    const { data: picks, error } = await query;

    if (error) {
      console.error('Error fetching picks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch picks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: picks || [] });
  } catch (error) {
    console.error('Error in GET /api/picks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new pick
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      creator_id,
      title,
      image_url,
      product_url,
      code_id,
      collection,
      sort_order = 0
    } = body;

    // Validate required fields
    if (!creator_id || !title || !product_url) {
      return NextResponse.json(
        { error: 'creator_id, title, and product_url are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('creator_picks')
      .insert({
        creator_id,
        title,
        image_url,
        product_url,
        code_id,
        collection,
        sort_order,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pick:', error);
      return NextResponse.json(
        { error: 'Failed to create pick' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in POST /api/picks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update an existing pick
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      id,
      title,
      image_url,
      product_url,
      code_id,
      collection,
      sort_order,
      is_active
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Build update object (only include provided fields)
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (title !== undefined) updateData.title = title;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (product_url !== undefined) updateData.product_url = product_url;
    if (code_id !== undefined) updateData.code_id = code_id;
    if (collection !== undefined) updateData.collection = collection;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('creator_picks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pick:', error);
      return NextResponse.json(
        { error: 'Failed to update pick' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PATCH /api/picks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a pick
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('creator_picks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting pick:', error);
      return NextResponse.json(
        { error: 'Failed to delete pick' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/picks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}