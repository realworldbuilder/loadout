import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations (no RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmZtdXJ0aW5nYmt5bGpwZHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY0NjEzOCwiZXhwIjoyMDg4MjIyMTM4fQ.hb-dIFb0Zia4vPhTSelofdPk6pk1HSPKdwWOHiWErH4'
);

// GET - List picks for a code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get('code_id');

    if (!codeId) {
      return NextResponse.json(
        { error: 'code_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('creator_code_picks')
      .select('*')
      .eq('code_id', codeId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching picks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch picks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/codes/picks:', error);
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
      code_id,
      title,
      image_url,
      product_url,
      sort_order = 0
    } = body;

    // Validate required fields
    if (!code_id || !title || !product_url) {
      return NextResponse.json(
        { error: 'code_id, title, and product_url are required' },
        { status: 400 }
      );
    }

    // Check pick limit (6 per code)
    const { data: existingPicks, error: countError } = await supabase
      .from('creator_code_picks')
      .select('id')
      .eq('code_id', code_id);

    if (countError) {
      console.error('Error checking pick count:', countError);
      return NextResponse.json(
        { error: 'Failed to validate pick count' },
        { status: 500 }
      );
    }

    if (existingPicks && existingPicks.length >= 6) {
      return NextResponse.json(
        { error: 'Maximum 6 picks allowed per code' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('creator_code_picks')
      .insert({
        code_id,
        title,
        image_url,
        product_url,
        sort_order
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
    console.error('Error in POST /api/codes/picks:', error);
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
      sort_order
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Build update object (only include provided fields)
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (product_url !== undefined) updateData.product_url = product_url;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    const { data, error } = await supabase
      .from('creator_code_picks')
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
    console.error('Error in PATCH /api/codes/picks:', error);
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
      .from('creator_code_picks')
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
    console.error('Error in DELETE /api/codes/picks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}