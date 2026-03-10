import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CoachingApplicationForm from '@/components/CoachingApplicationForm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

    return creator;
  } catch (error) {
    console.error('Error fetching creator data:', error);
    throw error;
  }
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  try {
    const creator = await getCreatorData(params.handle);
    
    const title = `Apply to work with ${creator.display_name}`;
    const description = `Submit your coaching application to work with ${creator.display_name}`;
    
    return {
      title: `${title} | loadout`,
      description,
      openGraph: {
        title,
        description,
        siteName: 'loadout',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch (error) {
    return {
      title: `Apply for coaching | loadout`,
      description: `Submit your coaching application`,
    };
  }
}

export default async function CoachingApplicationPage({ params }: { params: { handle: string } }) {
  try {
    const creator = await getCreatorData(params.handle);
    
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <CoachingApplicationForm creator={creator} />
      </div>
    );
  } catch (error) {
    // Creator not found - show 404
    notFound();
  }
}