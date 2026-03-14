import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = getSupabase();

    // Fetch creators with product counts
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select(`
        id,
        handle,
        display_name,
        avatar_url,
        subscription_tier,
        tier,
        created_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (creatorsError) {
      const response = NextResponse.json(
        { error: 'Failed to fetch creators', status: 500 },
        { status: 500 }
      );
      return addCORSHeaders(response);
    }

    // Get product counts for each creator
    const creatorIds = creators?.map(c => c.id) || [];
    const { data: productCounts, error: countsError } = await supabase
      .from('products')
      .select('creator_id')
      .in('creator_id', creatorIds)
      .eq('is_active', true);

    if (countsError) {
      console.error('Error fetching product counts:', countsError);
    }

    // Count products per creator
    const productCountMap = new Map<string, number>();
    productCounts?.forEach(product => {
      const count = productCountMap.get(product.creator_id) || 0;
      productCountMap.set(product.creator_id, count + 1);
    });

    // Transform to API format
    const creatorCards = creators?.map(creator => ({
      handle: creator.handle,
      displayName: creator.display_name,
      avatarUrl: creator.avatar_url,
      productCount: productCountMap.get(creator.id) || 0,
      tier: creator.subscription_tier || creator.tier || 'free',
      createdAt: creator.created_at
    })) || [];

    const responseData = {
      data: creatorCards,
      meta: {
        limit,
        offset,
        count: creatorCards.length
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