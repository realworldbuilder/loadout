'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FormBuilder from '@/components/FormBuilder';

export default function ApplicationsPage() {
  const { user, profile, loading: authLoading, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    if (!user) { router.push('/login'); return; }
    if (!profile && !authLoading) { router.push('/onboarding'); return; }
  }, [user, profile, authLoading, initializing, router]);

  if (authLoading || initializing || !profile?.id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-white/60 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      <FormBuilder creatorId={profile.id} />
    </div>
  );
}