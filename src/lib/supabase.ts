import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For server-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For client-side operations with auth
export const createSupabaseClient = () => createClientComponentClient();

// Database types (extend as needed)
export interface Creator {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  theme: {
    primary: string;
    background: string;
  };
  social_links: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  };
  stripe_account_id?: string;
  stripe_onboarding_complete: boolean;
  tier: 'free' | 'pro' | 'studio';
  subscription_ends_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  price_cents: number;
  type: 'digital' | 'coaching' | 'link' | 'subscription';
  file_url?: string;
  thumbnail_url?: string;
  download_limit?: number;
  is_active: boolean;
  sort_order: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  creator_id: string;
  buyer_email: string;
  buyer_name?: string;
  amount_cents: number;
  platform_fee_cents: number;
  stripe_payment_intent_id?: string;
  stripe_transfer_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  download_count: number;
  created_at: string;
  updated_at: string;
}