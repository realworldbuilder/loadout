'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { onAuthStateChange, getUser, getSession, getCreatorProfile } from '@/lib/auth';
import type { Creator } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Creator | null | undefined; // undefined = not loaded yet, null = no profile exists
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Creator | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await getCreatorProfile(user.id);
      setProfile(data);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const [currentSession, currentUser] = await Promise.all([
          getSession(),
          getUser()
        ]);

        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          const { data } = await getCreatorProfile(currentUser.id);
          setProfile(data);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // User signed in, fetch their profile
        const { data } = await getCreatorProfile(session.user.id);
        setProfile(data);
      } else {
        // User signed out
        setProfile(undefined);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh profile when user changes
  useEffect(() => {
    refreshProfile();
  }, [user]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        profile, 
        loading, 
        refreshProfile 
      }}
    >
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