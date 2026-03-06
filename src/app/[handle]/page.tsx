import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import CreatorProfile from '@/components/CreatorProfile';
import TrackPageView from '@/components/TrackPageView';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Revalidate every 10 seconds so new products show up quickly
export const revalidate = 10;

// Demo creators for fallback
const DEMO_CREATORS: Record<string, any> = {
  demo: {
    handle: 'demo',
    display_name: 'Choose a Loadout',
    bio: 'See what different fitness creators can build with Loadout',
    avatar_url: null,
  },
  alexrivera: {
    handle: 'alexrivera',
    display_name: 'Alex Rivera',
    bio: 'online coach · NASM-CPT · helping you get strong without the bs',
    avatar_url: null,
  },
  mayafit: {
    handle: 'mayafit', 
    display_name: 'Maya Thompson',
    bio: 'glute queen 🍑 · certified PT · my programs have built 10,000+ booties',
    avatar_url: null,
  },
  ironmike: {
    handle: 'ironmike',
    display_name: 'Mike Castellano', 
    bio: 'powerlifter · 600/405/650 · raw w/ wraps · making you strong as hell since 2019',
    avatar_url: null,
  },
  zenlifts: {
    handle: 'zenlifts',
    display_name: 'Priya Sharma',
    bio: 'yoga × strength · RYT-500 · proving you can be flexible AND strong · mind-muscle connection is real',
    avatar_url: null,
  },
  coachdre: {
    handle: 'coachdre',
    display_name: 'Dre Williams',
    bio: 'CSCS · former D1 athlete · athletic performance coach · speed kills 💨',
    avatar_url: null,
  },
  macrosbymel: {
    handle: 'macrosbymel',
    display_name: 'Mel Garcia',
    bio: 'registered dietitian · macro coach · ate 2800cal today and still have abs · food freedom advocate',
    avatar_url: null,
  },
};

export function generateStaticParams() {
  return [
    { handle: 'demo' },
    { handle: 'alexrivera' },
    { handle: 'mayafit' },
    { handle: 'ironmike' },
    { handle: 'zenlifts' },
    { handle: 'coachdre' },
    { handle: 'macrosbymel' },
  ];
}

async function getCreatorData(handle: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Fetch creator by handle
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('handle', handle)
      .single();

    if (creatorError || !creator) {
      return null; // Fall back to demo data
    }

    // Fetch creator's products
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
      product_type: p.type === 'digital' ? 'digital_product' : p.type,
      layout: p.layout || 'classic', // Ensure layout is passed through
    }));
    return { creator, products: mapped };
  } catch (error) {
    console.error('Error fetching creator data:', error);
    return null; // Fall back to demo data
  }
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const dbData = await getCreatorData(params.handle);
  
  // Use DB data if available, otherwise fallback to demo data
  const creator = dbData?.creator || DEMO_CREATORS[params.handle];
  
  if (!creator) {
    return {
      title: `@${params.handle} | Loadout`,
      description: `${params.handle} on Loadout`,
    };
  }

  const title = `${creator.display_name} | Loadout`;
  const description = creator.bio || `${creator.display_name} on Loadout`;
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
          alt: `${creator.display_name} on Loadout`,
        },
      ],
      type: 'profile',
      siteName: 'Loadout',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CreatorProfilePage({ params }: { params: { handle: string } }) {
  const dbData = await getCreatorData(params.handle);
  
  return (
    <>
      <CreatorProfile handle={params.handle} dbData={dbData} />
      {dbData?.creator?.id && (
        <TrackPageView creatorId={dbData.creator.id} />
      )}
    </>
  );
}