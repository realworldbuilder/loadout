import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations (no RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmZtdXJ0aW5nYmt5bGpwZHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY0NjEzOCwiZXhwIjoyMDg4MjIyMTM4fQ.hb-dIFb0Zia4vPhTSelofdPk6pk1HSPKdwWOHiWErH4'
);

// GET - List codes for a creator
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creator_id');
    const isPublic = searchParams.get('public') === 'true';

    if (!creatorId) {
      return NextResponse.json(
        { error: 'creator_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('creator_codes')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    // For public requests, only return active codes that haven't expired
    if (isPublic) {
      const now = new Date().toISOString();
      query = query.or(`expires_at.is.null,expires_at.gt.${now}`);
    }

    const { data: codes, error } = await query;

    if (error) {
      console.error('Error fetching codes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch codes' },
        { status: 500 }
      );
    }

    // Fetch picks for all codes in one query
    if (codes && codes.length > 0) {
      const codeIds = codes.map(code => code.id);
      
      const { data: picks, error: picksError } = await supabase
        .from('creator_code_picks')
        .select('*')
        .in('code_id', codeIds)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (picksError) {
        console.error('Error fetching picks:', picksError);
        // Continue without picks rather than failing
      } else if (picks) {
        // Group picks by code_id
        const picksByCodeId = picks.reduce((acc: any, pick: any) => {
          if (!acc[pick.code_id]) acc[pick.code_id] = [];
          acc[pick.code_id].push(pick);
          return acc;
        }, {});

        // Attach picks to each code
        codes.forEach((code: any) => {
          code.picks = picksByCodeId[code.id] || [];
        });
      }
    }

    return NextResponse.json({ data: codes });
  } catch (error) {
    console.error('Error in GET /api/codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      creator_id,
      brand_name,
      brand_logo_url,
      code_text,
      discount_description,
      store_url,
      category = 'other',
      is_featured = false,
      expires_at
    } = body;

    // Validate required fields
    if (!creator_id || !brand_name || !code_text) {
      return NextResponse.json(
        { error: 'creator_id, brand_name, and code_text are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('creator_codes')
      .insert({
        creator_id,
        brand_name,
        brand_logo_url,
        code_text,
        discount_description,
        store_url,
        category,
        is_featured,
        expires_at
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating code:', error);
      return NextResponse.json(
        { error: 'Failed to create code' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in POST /api/codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update an existing code
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      id,
      brand_name,
      brand_logo_url,
      code_text,
      discount_description,
      store_url,
      category,
      is_featured,
      expires_at
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
    
    if (brand_name !== undefined) updateData.brand_name = brand_name;
    if (brand_logo_url !== undefined) updateData.brand_logo_url = brand_logo_url;
    if (code_text !== undefined) updateData.code_text = code_text;
    if (discount_description !== undefined) updateData.discount_description = discount_description;
    if (store_url !== undefined) updateData.store_url = store_url;
    if (category !== undefined) updateData.category = category;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (expires_at !== undefined) updateData.expires_at = expires_at;

    const { data, error } = await supabase
      .from('creator_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating code:', error);
      return NextResponse.json(
        { error: 'Failed to update code' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PATCH /api/codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a code
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
      .from('creator_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting code:', error);
      return NextResponse.json(
        { error: 'Failed to delete code' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}