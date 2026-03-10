import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For server-side operations (API routes use service role key directly)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For client-side operations with cookie-based auth persistence
// Uses @supabase/ssr which properly handles cookies in App Router
export const createSupabaseClient = () => 
  createBrowserClient(supabaseUrl, supabaseAnonKey);

// Database types (extend as needed)
export interface Creator {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  theme: Record<string, any>;
  social_links: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    snapchat?: string;
    facebook?: string;
    spotify?: string;
    twitch?: string;
  };
  stripe_account_id?: string;
  stripe_onboarding_complete: boolean;
  tier: 'free' | 'pro' | 'studio';
  subscription_tier?: 'free' | 'pro';
  subscription_ends_at?: string;
  is_active: boolean;
  application_settings?: {
    welcome_message?: string;
    show_pricing?: boolean;
    pricing_text?: string;
    response_time?: string;
  };
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
