'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ClipboardList, Mail, Instagram, Calendar, ChevronDown, ChevronUp, User } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  email: string;
  phone?: string;
  instagram?: string;
  goals?: string;
  experience?: string;
  budget?: string;
  message?: string;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  reviewed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  accepted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  declined: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function CoachingDashboard() {
  const { user, profile, loading: authLoading, initializing } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (initializing) return;
    if (!user) { router.push('/login'); return; }
    if (!profile && !authLoading) { router.push('/onboarding'); return; }
  }, [user, profile, authLoading, initializing, router]);

  useEffect(() => {
    if (!profile?.id) return;
    
    fetch(`/api/coaching-apply?creator_id=${profile.id}`)
      .then(res => res.json())
      .then(result => {
        setApplications(result.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [profile?.id]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-white/60 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white lowercase">coaching applications</h1>
        <p className="text-white/60 lowercase mt-1">
          {applications.length} application{applications.length !== 1 ? 's' : ''} received
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/60 mb-2 lowercase">no applications yet</h3>
          <p className="text-white/40 text-sm lowercase">
            add a coaching application form to your page and applications will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const isExpanded = expandedId === app.id;
            const date = new Date(app.created_at);
            
            return (
              <div
                key={app.id}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  className="w-full px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <User className="h-5 w-5 text-white/40" />
                      </div>
                      <div>
                        <span className="text-white font-semibold">{app.name}</span>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-white/40 text-sm">{app.email}</span>
                          {app.instagram && (
                            <span className="text-white/30 text-sm">{app.instagram}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/30">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[app.status] || STATUS_COLORS.new}`}>
                        {app.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-white/30" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-white/30" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {app.experience && (
                        <div>
                          <div className="text-white/30 text-xs uppercase tracking-wider mb-1">experience</div>
                          <div className="text-white/70 text-sm">{app.experience}</div>
                        </div>
                      )}
                      {app.budget && (
                        <div>
                          <div className="text-white/30 text-xs uppercase tracking-wider mb-1">budget</div>
                          <div className="text-white/70 text-sm">{app.budget}</div>
                        </div>
                      )}
                      {app.phone && (
                        <div>
                          <div className="text-white/30 text-xs uppercase tracking-wider mb-1">phone</div>
                          <div className="text-white/70 text-sm">{app.phone}</div>
                        </div>
                      )}
                      {app.instagram && (
                        <div>
                          <div className="text-white/30 text-xs uppercase tracking-wider mb-1">instagram</div>
                          <div className="text-white/70 text-sm">{app.instagram}</div>
                        </div>
                      )}
                    </div>
                    {app.goals && (
                      <div>
                        <div className="text-white/30 text-xs uppercase tracking-wider mb-1">goals</div>
                        <div className="text-white/60 text-sm whitespace-pre-line">{app.goals}</div>
                      </div>
                    )}
                    {app.message && (
                      <div>
                        <div className="text-white/30 text-xs uppercase tracking-wider mb-1">additional notes</div>
                        <div className="text-white/60 text-sm whitespace-pre-line">{app.message}</div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <a
                        href={`mailto:${app.email}`}
                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        email
                      </a>
                      {app.instagram && (
                        <a
                          href={`https://instagram.com/${app.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Instagram className="h-3.5 w-3.5" />
                          instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
