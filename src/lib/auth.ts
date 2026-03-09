import { createSupabaseClient } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

// Always use the cookie-based client for auth operations
// Using the raw createClient() stores sessions in memory/localStorage
// but the middleware reads from cookies — causing logout on every refresh
const getAuthClient = () => createSupabaseClient();

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
    const { data, error } = await getAuthClient().auth.signUp({
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
    const { data, error } = await getAuthClient().auth.signInWithPassword({
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
    const { data, error } = await getAuthClient().auth.signInWithOAuth({
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
    const { error } = await getAuthClient().auth.signOut();
    
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
    const { data: { user }, error } = await getAuthClient().auth.getUser();
    
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
    const { data: { session }, error } = await getAuthClient().auth.getSession();
    
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
  return getAuthClient().auth.onAuthStateChange(callback);
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

    const response = await fetch(`/api/profile?handle=${handle}`);
    
    if (!response.ok) {
      console.error('Handle check error');
      return { available: false, error: 'failed to check handle availability' };
    }

    const result = await response.json();
    return { 
      available: result.available, 
      error: result.error 
    };
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
    snapchat?: string;
    facebook?: string;
    spotify?: string;
    twitch?: string;
  };
}) => {
  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create profile error:', errorData.error);
      return { data: null, error: errorData.error || 'Failed to create profile' };
    }

    const result = await response.json();
    return { data: result.data, error: null };
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
    snapchat?: string;
    facebook?: string;
    spotify?: string;
    twitch?: string;
  };
}>) => {
  try {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, ...updates }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update profile error:', errorData.error);
      return { data: null, error: errorData.error || 'Failed to update profile' };
    }

    const result = await response.json();
    return { data: result.data, error: null };
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
    const response = await fetch(`/api/profile?user_id=${userId}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Get profile error:', errorData.error);
      return { data: null, error: errorData.error || 'Failed to get profile' };
    }

    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Get profile error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};