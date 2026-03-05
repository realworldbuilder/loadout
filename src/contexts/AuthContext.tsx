'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { onAuthStateChange, getCreatorProfile } from '@/lib/auth';
import { createSupabaseClient } from '@/lib/supabase';
import type { Creator } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Creator | null | undefined;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Creator | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const refreshProfile = useCallback(async () => {
    const supabase = createSupabaseClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;
    
    try {
      // Use API route to bypass any RLS issues
      const res = await fetch(`/api/profile?user_id=${currentUser.id}`);
      if (res.ok) {
        const { data } = await res.json();
        setProfile(data);
      } else {
        // Fallback to direct query
        const { data } = await getCreatorProfile(currentUser.id);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, []);

  useEffect(() => {
    const supabase = createSupabaseClient();

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        const { data } = await getCreatorProfile(initialSession.user.id);
        setProfile(data);
      } else {
        setProfile(null);
      }

      setLoading(false);
      initializedRef.current = true;
    });

    // Listen for changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // Skip the initial event — we handle it above
      if (!initializedRef.current) return;
      
      // Token refresh — just update session, don't reset user/profile
      if (event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        return;
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const { data } = await getCreatorProfile(newSession.user.id);
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
