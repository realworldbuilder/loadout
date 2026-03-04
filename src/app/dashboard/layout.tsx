'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createSupabaseClient, type Creator } from '@/lib/supabase';
import Sidebar from '@/components/dashboard/Sidebar';
import Link from 'next/link';
import { ExternalLink, User } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      loadCreator();
    }
  }, [user, authLoading]);

  async function loadCreator() {
    if (!user) return;

    try {
      const { data: creatorData } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setCreator(creatorData);
    } catch (error) {
      console.error('Error loading creator:', error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60 lowercase">loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-white mb-4 lowercase">welcome to loadout</h1>
          <p className="text-white/60 mb-6 lowercase">set up your creator profile to get started</p>
          <Link href="/onboarding" className="inline-flex items-center px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors lowercase">
            complete setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="bg-[#111] border-b border-white/5 px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left side - greeting (hidden on mobile to save space) */}
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-white lowercase">
                hey, {creator.display_name}
              </h2>
            </div>

            {/* Right side - creator actions */}
            <div className="flex items-center space-x-4 ml-auto">
              {/* View my page link */}
              <Link
                href={`/${creator.handle}`}
                target="_blank"
                className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="lowercase">view my page</span>
              </Link>

              {/* Creator avatar */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt={creator.display_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <User className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
                <span className="text-sm font-medium text-white hidden sm:block lowercase">
                  @{creator.handle}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}