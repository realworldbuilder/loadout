import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProductCardComponent } from '@/lib/component-schema';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function addCORSHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('X-Loadout-Version', '1.0');
  response.headers.set('X-RateLimit-Limit', '1000');
  response.headers.set('X-RateLimit-Remaining', '999'); // TODO: Implement real rate limiting
  return response;
}

// Handle CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCORSHeaders(response);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = getSupabase();
    const handle = params.handle;

    // First, get the creator ID
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .eq('handle', handle)
      .eq('is_active', true)
      .single();

    if (creatorError || !creator) {
      const response = NextResponse.json(
        { error: 'Creator not found', status: 404 },
        { status: 404 }
      );
      return addCORSHeaders(response);
    }

    // Build products query
    let query = supabase
      .from('products')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('is_active', true);

    // Filter by type if specified
    if (type) {
      query = query.eq('type', type);
    }

    // Add pagination and ordering
    const { data: products, error: productsError } = await query
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1);

    if (productsError) {
      const response = NextResponse.json(
        { error: 'Failed to fetch products', status: 500 },
        { status: 500 }
      );
      return addCORSHeaders(response);
    }

    // Transform products into ProductCard components
    const productComponents: ProductCardComponent[] = (products || []).map(product => ({
      component: 'ProductCard',
      data: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: (product.price_cents || 0) / 100,
        type: product.type,
        thumbnailUrl: product.thumbnail_url,
        externalUrl: product.external_url,
        ctaText: product.cta_text,
        fileUrl: product.file_url,
        layout: product.layout || 'classic',
        collection: product.collection,
        metadata: product.metadata
      }
    }));

    const responseData = {
      data: productComponents,
      meta: {
        creatorHandle: handle,
        type: type || 'all',
        limit,
        offset,
        count: productComponents.length
      }
    };

    const response = NextResponse.json(responseData);
    return addCORSHeaders(response);

  } catch (error) {
    console.error('API Error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error', status: 500 },
      { status: 500 }
    );
    return addCORSHeaders(response);
  }
}