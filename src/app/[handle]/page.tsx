import { createClient } from '@supabase/supabase-js';
import CreatorProfile from '@/components/CreatorProfile';
import TrackPageView from '@/components/TrackPageView';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

    return { creator, products: products || [] };
  } catch (error) {
    console.error('Error fetching creator data:', error);
    return null; // Fall back to demo data
  }
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
