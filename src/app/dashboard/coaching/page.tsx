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
  age?: number;
  location?: string;
  how_found?: string;
  goals?: string;
  experience?: string;
  training_days_per_week?: number;
  preferred_days?: string[];
  gym_type?: string;
  equipment?: string;
  tracked_macros?: string;
  food_allergies?: string;
  has_food_scale?: boolean;
  current_weight?: string;
  current_height?: string;
  commitment_ready?: boolean;
  why_this_coach?: string;
  photo_urls?: string[];
  budget?: string;
  message?: string;
  status: string;
  created_at: string;
  form_data?: Record<string, any>;
  form_id?: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  reviewing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  accepted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

// Component to render dynamic form data
function DynamicApplicationData({ formData, creatorId }: { formData: Record<string, any>; creatorId: string }) {
  const [formFields, setFormFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const response = await fetch(`/api/application-forms?creator_id=${creatorId}`);
        const result = await response.json();
        if (result.data?.fields) {
          setFormFields(result.data.fields);
        }
      } catch (error) {
        console.error('Error fetching form fields:', error);
      } finally {
        setLoading(false);
      }
    };

    if (creatorId) {
      fetchFormFields();
    }
  }, [creatorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-white/60 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!formFields.length) {
    return <div className="text-white/60 text-sm">no form structure available</div>;
  }

  // Group fields by basic info, goals, etc.
  const basicFields = ['name', 'email', 'age', 'location', 'city', 'phone', 'instagram'];
  const goalFields = ['goal', 'main goal', 'nutrition goal', 'training for'];
  
  const basicInfo = formFields.filter(field => 
    basicFields.some(basic => field.label.toLowerCase().includes(basic))
  );
  
  const goalInfo = formFields.filter(field => 
    goalFields.some(goal => field.label.toLowerCase().includes(goal))
  );
  
  const otherFields = formFields.filter(field => 
    !basicInfo.includes(field) && !goalInfo.includes(field)
  );

  const renderFieldValue = (field: any, value: any) => {
    if (!value) return null;
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return value.toString();
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      {basicInfo.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {basicInfo.map(field => {
              const value = formData[field.id];
              if (!value) return null;
              
              return (
                <div key={field.id}>
                  <div className="text-white/30 text-xs uppercase tracking-wider mb-1">{field.label}</div>
                  <div className="text-white/70 text-sm">{renderFieldValue(field, value)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Goals */}
      {goalInfo.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3">Goals</h3>
          <div className="space-y-3">
            {goalInfo.map(field => {
              const value = formData[field.id];
              if (!value) return null;
              
              return (
                <div key={field.id}>
                  <div className="text-white/30 text-xs uppercase tracking-wider mb-1">{field.label}</div>
                  <div className="text-white/60 text-sm whitespace-pre-line">{renderFieldValue(field, value)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Fields */}
      {otherFields.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3">Additional Information</h3>
          <div className="space-y-4">
            {otherFields.map(field => {
              const value = formData[field.id];
              if (!value) return null;
              
              return (
                <div key={field.id}>
                  <div className="text-white/30 text-xs uppercase tracking-wider mb-1">{field.label}</div>
                  <div className="text-white/70 text-sm whitespace-pre-line">{renderFieldValue(field, value)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Component to render legacy application data (for backwards compatibility)
function LegacyApplicationData({ app }: { app: Application }) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-white font-semibold mb-3">Basic Information</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {app.age && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Age</div>
              <div className="text-white/70 text-sm">{app.age}</div>
            </div>
          )}
          {app.location && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Location</div>
              <div className="text-white/70 text-sm">{app.location}</div>
            </div>
          )}
          {app.phone && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Phone</div>
              <div className="text-white/70 text-sm">{app.phone}</div>
            </div>
          )}
          {app.instagram && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Instagram</div>
              <div className="text-white/70 text-sm">
                <a
                  href={`https://instagram.com/${app.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {app.instagram}
                </a>
              </div>
            </div>
          )}
          {app.how_found && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">How Found</div>
              <div className="text-white/70 text-sm">{app.how_found}</div>
            </div>
          )}
        </div>
      </div>

      {/* Goals & Mindset */}
      {app.goals && (
        <div>
          <h3 className="text-white font-semibold mb-3">Goals & Mindset</h3>
          <div className="text-white/60 text-sm whitespace-pre-line">{app.goals}</div>
        </div>
      )}

      {/* Fitness Background */}
      <div>
        <h3 className="text-white font-semibold mb-3">Fitness Background</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {app.experience && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Experience</div>
              <div className="text-white/70 text-sm">{app.experience}</div>
            </div>
          )}
          {app.training_days_per_week && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Training Days/Week</div>
              <div className="text-white/70 text-sm">{app.training_days_per_week} days</div>
            </div>
          )}
          {app.gym_type && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Gym Type</div>
              <div className="text-white/70 text-sm">{app.gym_type}</div>
            </div>
          )}
        </div>
        {app.preferred_days && app.preferred_days.length > 0 && (
          <div className="mt-4">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Preferred Days</div>
            <div className="text-white/70 text-sm">{app.preferred_days.join(', ')}</div>
          </div>
        )}
        {app.equipment && (
          <div className="mt-4">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Equipment</div>
            <div className="text-white/70 text-sm">{app.equipment}</div>
          </div>
        )}
      </div>

      {/* Nutrition */}
      <div>
        <h3 className="text-white font-semibold mb-3">Nutrition</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {app.tracked_macros && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Macro Tracking</div>
              <div className="text-white/70 text-sm">{app.tracked_macros}</div>
            </div>
          )}
          {app.has_food_scale !== null && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Food Scale</div>
              <div className="text-white/70 text-sm">{app.has_food_scale ? 'Yes' : 'No'}</div>
            </div>
          )}
        </div>
        {app.food_allergies && (
          <div className="mt-4">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Allergies/Restrictions</div>
            <div className="text-white/70 text-sm">{app.food_allergies}</div>
          </div>
        )}
      </div>

      {/* Current Stats & Commitment */}
      <div>
        <h3 className="text-white font-semibold mb-3">Current Stats & Commitment</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {app.current_weight && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Weight</div>
              <div className="text-white/70 text-sm">{app.current_weight}</div>
            </div>
          )}
          {app.current_height && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Height</div>
              <div className="text-white/70 text-sm">{app.current_height}</div>
            </div>
          )}
          {app.commitment_ready !== null && (
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Ready to Commit</div>
              <div className="text-white/70 text-sm">{app.commitment_ready ? 'Yes' : 'Has concerns'}</div>
            </div>
          )}
        </div>
        {app.why_this_coach && (
          <div className="mt-4">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Why This Coach</div>
            <div className="text-white/70 text-sm whitespace-pre-line">{app.why_this_coach}</div>
          </div>
        )}
      </div>

      {/* Additional Notes */}
      {app.message && (
        <div>
          <h3 className="text-white font-semibold mb-3">Additional Notes</h3>
          <div className="text-white/60 text-sm whitespace-pre-line">{app.message}</div>
        </div>
      )}
    </div>
  );
}

export default function CoachingDashboard() {
  const { user, profile, loading: authLoading, initializing } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/coaching-apply', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: applicationId, status: newStatus }),
      });

      if (response.ok) {
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update application status');
    }
  };

  const filteredApplications = statusFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === statusFilter);

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white lowercase">coaching applications</h1>
            <p className="text-white/60 lowercase mt-1">
              {filteredApplications.length} of {applications.length} application{applications.length !== 1 ? 's' : ''} 
              {statusFilter !== 'all' && ` (${statusFilter})`}
            </p>
          </div>
          
          {/* Filter Options */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              All ({applications.length})
            </button>
            {STATUS_OPTIONS.map(({ value, label }) => {
              const count = applications.filter(app => app.status === value).length;
              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === value 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/60 mb-2 lowercase">no applications yet</h3>
          <p className="text-white/40 text-sm lowercase">
            add a coaching application form to your page and applications will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => {
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
                  <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-6">
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'accepted')}
                        disabled={app.status === 'accepted'}
                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {app.status === 'accepted' ? '✓ Accepted' : 'Accept'}
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'reviewing')}
                        disabled={app.status === 'reviewing'}
                        className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {app.status === 'reviewing' ? '👁 Reviewing' : 'Mark Reviewing'}
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                        disabled={app.status === 'rejected'}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {app.status === 'rejected' ? '✗ Rejected' : 'Reject'}
                      </button>
                      <a
                        href={`mailto:${app.email}`}
                        className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 ml-auto"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </a>
                    </div>

                    {/* Dynamic Form Data */}
                    {app.form_data && Object.keys(app.form_data).length > 0 ? (
                      <DynamicApplicationData formData={app.form_data} creatorId={profile?.id || ''} />
                    ) : (
                      <LegacyApplicationData app={app} />
                    )}
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
