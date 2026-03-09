'use client';

import { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

interface CoachingFormProps {
  creatorId: string;
  productId: string;
  title: string;
  description?: string;
  isDark: boolean;
  primaryColor: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  goals: string;
  experience: string;
  budget: string;
  message: string;
}

const EXPERIENCE_OPTIONS = [
  'Beginner (0-6 months)',
  'Intermediate (6 months - 2 years)',
  'Advanced (2+ years)',
  'Returning after a break',
];

const BUDGET_OPTIONS = [
  'Under $100/mo',
  '$100-200/mo',
  '$200-300/mo',
  '$300+/mo',
  'Not sure yet',
];

export default function CoachingForm({ creatorId, productId, title, description, isDark, primaryColor }: CoachingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    goals: '',
    experience: '',
    budget: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/coaching-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          product_id: productId,
          ...formData,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputClasses = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-white/30 focus:ring-white/10'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-200';

  const labelClasses = isDark ? 'text-white/60' : 'text-gray-500';
  const cardBg = isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200';

  if (submitted) {
    return (
      <div className={`rounded-2xl border ${cardBg} p-8 text-center`}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: primaryColor + '20' }}>
          <CheckCircle className="h-8 w-8" style={{ color: primaryColor }} />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          application submitted! 🎉
        </h3>
        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          you'll hear back soon. keep training in the meantime.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${cardBg} overflow-hidden`}>
      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        {description && (
          <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Name + Email row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-medium ${labelClasses} mb-1.5 uppercase tracking-wider`}>
              name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="your name"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors ${inputClasses}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-medium ${labelClasses} mb-1.5 uppercase tracking-wider`}>
              email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="your@email.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors ${inputClasses}`}
            />
          </div>
        </div>

        {/* Phone + Instagram row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-medium ${labelClasses} mb-1.5 uppercase tracking-wider`}>
              phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="(optional)"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors ${inputClasses}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-medium ${labelClasses} mb-1.5 uppercase tracking-wider`}>
              instagram
            </label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => update('instagram', e.target.value)}
              placeholder="@yourhandle"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors ${inputClasses}`}
            />
          </div>
        </div>

        {/* Experience level */}
        <div>
          <label className={`block text-xs font-medium ${labelClasses} mb-1.5 uppercase tracking-wider`}>
            experience level
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => update('experience', opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  formData.experience === opt
                    ? 'text-white border-transparent'
                    : isDark
                      ? 'text-white/50 border-white/10 hover:border-white/20'
                      : 'text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
                style={formData.experience === opt ? { backgroundColor: primaryColor } : {}}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className={`block text-xs font-medium ${labelClasses} mb-1.5 uppercase tracking-wider`}>
            budget
          </label>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => update('budget', opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  formData.budget === opt
                    ? 'text-white border-transparent'
                    : isDark
                      ? 'text-white/50 border-white/10 hover:border-white/20'
                      : 'text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
                style={formData.budget === opt ? { backgroundColor: primaryColor } : {}}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className={`block text-xs font-medium ${labelClasses} mb-1.5 uppercase tracking-wider`}>
            what are your goals?
          </label>
          <textarea
            value={formData.goals}
            onChange={(e) => update('goals', e.target.value)}
            placeholder="lose weight, build muscle, train for a competition, improve overall health..."
            rows={3}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors resize-none ${inputClasses}`}
          />
        </div>

        {/* Additional message */}
        <div>
          <label className={`block text-xs font-medium ${labelClasses} mb-1.5 uppercase tracking-wider`}>
            anything else?
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="injuries, dietary restrictions, schedule, whatever you want me to know..."
            rows={2}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors resize-none ${inputClasses}`}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !formData.name || !formData.email}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: primaryColor, color: '#fff' }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              apply for coaching
            </>
          )}
        </button>
      </form>
    </div>
  );
}
