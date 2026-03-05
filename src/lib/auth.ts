import { supabase, createSupabaseClient } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: any;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

// Sign up with email and password
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Sign in with Google OAuth
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google sign in error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Get current user
export const getUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

// Get current session
export const getSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

// Auth state change listener
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Helper to check if handle is available
export const checkHandleAvailability = async (handle: string): Promise<{ available: boolean; error?: string }> => {
  try {
    // Validate handle format first
    const handleRegex = /^[a-z0-9_]{3,30}$/;
    if (!handleRegex.test(handle)) {
      return { 
        available: false, 
        error: 'handle must be 3-30 characters, lowercase letters, numbers, and underscores only' 
      };
    }

    const client = createSupabaseClient();
    const { data, error } = await client
      .from('creators')
      .select('handle')
      .eq('handle', handle)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows found, handle is available
      return { available: true };
    }

    if (error) {
      console.error('Handle check error:', error);
      return { available: false, error: 'failed to check handle availability' };
    }

    // Handle exists
    return { available: false, error: 'handle already taken' };
  } catch (error) {
    console.error('Handle check error:', error);
    return { available: false, error: 'failed to check handle availability' };
  }
};

// Create creator profile
export const createCreatorProfile = async (profileData: {
  user_id: string;
  handle: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  social_links?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  };
}) => {
  try {
    const client = createSupabaseClient();
    const { data, error } = await client
      .from('creators')
      .insert([{
        ...profileData,
        is_active: true,
        tier: 'free',
        stripe_onboarding_complete: false,
        theme: {
          primary: '#10a37f',
          background: '#0d0d0d'
        }
      }])
      .select()
      .single();

    if (error) {
      console.error('Create profile error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Create profile error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Update creator profile
export const updateCreatorProfile = async (userId: string, updates: Partial<{
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  social_links: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  };
}>) => {
  try {
    const client = createSupabaseClient();
    const { data, error } = await client
      .from('creators')
      .update(updates)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Update profile error:', error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      // RLS may have blocked the return — try fetching to confirm
      const { data: check } = await client
        .from('creators')
        .select()
        .eq('user_id', userId)
        .single();
      if (check) {
        return { data: check, error: null };
      }
      return { data: null, error: 'Profile not found or update blocked by permissions' };
    }

    return { data: data[0], error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Get creator profile by user ID
export const getCreatorProfile = async (userId: string) => {
  try {
    // Use the auth-aware client so RLS can see auth.uid()
    const client = createSupabaseClient();
    const { data, error } = await client
      .from('creators')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No profile found
      return { data: null, error: null };
    }

    if (error) {
      console.error('Get profile error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get profile error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};