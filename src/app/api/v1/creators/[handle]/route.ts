import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreatorProfileComponent, ProductCardComponent, ProductSectionComponent } from '@/lib/component-schema';

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
    const supabase = getSupabase();
    const handle = params.handle;

    // Fetch creator
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
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

    // Fetch creator's products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

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

    // Group products by collection
    const collections = new Map<string, ProductCardComponent[]>();
    const uncategorized: ProductCardComponent[] = [];

    productComponents.forEach(product => {
      const collection = product.data.collection;
      if (collection && collection !== '') {
        if (!collections.has(collection)) {
          collections.set(collection, []);
        }
        collections.get(collection)!.push(product);
      } else {
        uncategorized.push(product);
      }
    });

    // Create sections from collections
    const sections: ProductSectionComponent[] = [];
    
    // Add named collections first
    for (const [title, products] of Array.from(collections.entries())) {
      sections.push({
        component: 'ProductSection',
        data: {
          title: title.toUpperCase(),
          products,
          layout: 'grid'
        }
      });
    }

    // Add uncategorized products as "FEATURED" section if they exist
    if (uncategorized.length > 0) {
      sections.push({
        component: 'ProductSection',
        data: {
          title: 'FEATURED',
          products: uncategorized,
          layout: 'grid'
        }
      });
    }

    // Build CreatorProfile component
    const creatorProfile: CreatorProfileComponent = {
      component: 'CreatorProfile',
      version: '1.0',
      data: {
        handle: creator.handle,
        displayName: creator.display_name,
        bio: creator.bio,
        avatarUrl: creator.avatar_url,
        bannerUrl: creator.banner_url,
        theme: creator.theme || { primary: '#3b82f6', background: '#ffffff' },
        socialLinks: creator.social_links || {},
        products: productComponents,
        sections,
        tier: creator.subscription_tier || creator.tier || 'free',
        applicationSettings: creator.application_settings
      }
    };

    const responseData = {
      ...creatorProfile,
      meta: {
        totalProducts: productComponents.length,
        createdAt: creator.created_at,
        tier: creator.subscription_tier || creator.tier || 'free'
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