'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient, type Creator } from '@/lib/supabase';
import CreatorNav from '@/components/CreatorNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
      }

      // Get creator profile
      const { data: creatorData } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setCreator(creatorData);
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex">
      {/* Sidebar Navigation */}
      <CreatorNav creatorHandle={creator?.handle} />
      
      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}