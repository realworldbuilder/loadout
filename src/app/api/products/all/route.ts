import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Fetch all products across all creators (for discover feed)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching all products:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map price_cents to price (dollars) and product_type
    const mapped = (data || []).map((p: any) => ({
      ...p,
      price: p.price_cents ? (p.price_cents / 100).toFixed(2) : '0.00',
      product_type: p.product_type || p.type || 'link',
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error('Error in GET /api/products/all:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
