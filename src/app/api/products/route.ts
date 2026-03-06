import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Map from code field names to DB column names
function mapToDb(body: any) {
  const mapped: any = {};
  
  if (body.creator_id !== undefined) mapped.creator_id = body.creator_id;
  if (body.title !== undefined) mapped.title = body.title;
  if (body.description !== undefined) mapped.description = body.description;
  if (body.thumbnail_url !== undefined) mapped.thumbnail_url = body.thumbnail_url;
  if (body.file_url !== undefined) mapped.file_url = body.file_url;
  if (body.external_url !== undefined) mapped.external_url = body.external_url;
  if (body.cta_text !== undefined) mapped.cta_text = body.cta_text;
  if (body.is_active !== undefined) mapped.is_active = body.is_active;
  if (body.sort_order !== undefined) mapped.sort_order = body.sort_order;
  
  // price -> price_cents
  if (body.price !== undefined) {
    mapped.price_cents = Math.round(Number(body.price) * 100);
  }
  
  // product_type -> type, with value mapping
  if (body.product_type !== undefined) {
    const typeMap: Record<string, string> = {
      'digital_product': 'digital',
      'affiliate_link': 'affiliate_link',
      'coaching': 'coaching',
      'link': 'link',
      'subscription': 'subscription',
    };
    mapped.type = typeMap[body.product_type] || body.product_type;
  }
  
  return mapped;
}

// Map from DB columns to code field names
function mapFromDb(row: any) {
  return {
    ...row,
    price: (row.price_cents || 0) / 100,
    product_type: row.type === 'digital' ? 'digital_product' : row.type,
  };
}

export async function GET(request: NextRequest) {
  try {
    const creatorId = request.nextUrl.searchParams.get('creator_id');
    if (!creatorId) return NextResponse.json({ error: 'Missing creator_id' }, { status: 400 });

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('creator_id', creatorId)
      .order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: (data || []).map(mapFromDb) });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dbData = mapToDb(body);
    if (dbData.is_active === undefined) dbData.is_active = true;
    if (dbData.sort_order === undefined) dbData.sort_order = 0;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Create product error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: mapFromDb(data) });
  } catch (e) {
    console.error('Create product error:', e);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const dbUpdates = mapToDb(updates);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: mapFromDb(data) });
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const supabase = getSupabase();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
