import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'order id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Look up the order by ID and join with products table
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          id,
          title,
          file_url
        )
      `)
      .eq('id', orderId)
      .eq('status', 'completed')
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'order not found or not completed' },
        { status: 404 }
      );
    }

    const product = order.products;

    if (!product.file_url) {
      return NextResponse.json(
        { error: 'no file attached to this product' },
        { status: 400 }
      );
    }

    // Return the file URL for download
    return NextResponse.json({
      file_url: product.file_url,
      product_title: product.title,
      order_id: order.id,
    });

  } catch (error) {
    console.error('Download error:', error);
    
    return NextResponse.json(
      { error: 'failed to process download' },
      { status: 500 }
    );
  }
}