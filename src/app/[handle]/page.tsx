import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CreatorProfile from '@/components/CreatorProfile';
import TrackPageView from '@/components/TrackPageView';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Revalidate every 10 seconds so new products show up quickly
export const revalidate = 10;

export async function generateStaticParams() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Generate static params for active creators in the database
    const { data: creators, error } = await supabase
      .from('creators')
      .select('handle')
      .eq('is_active', true)
      .limit(50); // Limit for build performance
    
    if (error || !creators) {
      console.error('Error fetching creators for static generation:', error);
      return [];
    }
    
    return creators.map(creator => ({ handle: creator.handle }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

async function getCreatorData(handle: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Fetch creator by handle
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('handle', handle)
      .eq('is_active', true)
      .single();

    if (creatorError || !creator) {
      throw new Error('Creator not found');
    }

    // Fetch creator's products (including page blocks)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return { creator, products: [] };
    }

    // Map DB columns to component field names
    const mapped = (products || []).map((p: any) => ({
      ...p,
      price: (p.price_cents || 0) / 100,
      product_type: p.type,
      layout: p.layout || p.metadata?.layout || 'classic',
      cta_text: p.cta_text || p.metadata?.cta_text,
      external_url: p.external_url || p.metadata?.external_url || p.file_url,
    }));

    return { creator, products: mapped };
  } catch (error) {
    console.error('Error fetching creator data:', error);
    throw error;
  }
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  try {
    const dbData = await getCreatorData(params.handle);
    const creator = dbData.creator;
    
    const title = `${creator.display_name} | loadout`;
    const description = creator.bio || `${creator.display_name} on loadout`;
    const ogImage = creator.avatar_url || 'https://loadout.fit/og-default.png';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${creator.display_name} on loadout`,
          },
        ],
        type: 'profile',
        siteName: 'loadout',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  } catch (error) {
    // Creator not found, return minimal metadata
    return {
      title: `@${params.handle} | loadout`,
      description: `fitness creator profile on loadout`,
    };
  }
}

export default async function CreatorProfilePage({ params }: { params: { handle: string } }) {
  try {
    const dbData = await getCreatorData(params.handle);
    
    return (
      <>
        <CreatorProfile handle={params.handle} dbData={dbData} />
        <TrackPageView creatorId={dbData.creator.id} />
      </>
    );
  } catch (error) {
    // Creator not found - show 404
    notFound();
  }
}