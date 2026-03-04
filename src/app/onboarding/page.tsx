'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  checkHandleAvailability, 
  createCreatorProfile
} from '@/lib/auth';

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
}

interface FormData {
  handle: string;
  displayName: string;
  bio: string;
  socialLinks: SocialLinks;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    handle: '',
    displayName: '',
    bio: '',
    socialLinks: {}
  });
  
  // Handle validation
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);
  
  const router = useRouter();
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();

  // Redirect if not authenticated or already onboarded
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (profile && profile.handle) {
      router.push('/dashboard');
      return;
    }
  }, [user, profile, router, authLoading]);

  // Handle validation with debounce
  useEffect(() => {
    const { handle } = formData;
    if (!handle || handle.length < 3) {
      setHandleAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingHandle(true);
      const { available, error } = await checkHandleAvailability(handle);
      setHandleAvailable(available);
      if (error) {
        setError(error);
      } else {
        setError('');
      }
      setCheckingHandle(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.handle]);

  // Update form data
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  // Update social link
  const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  // Step navigation
  const goToStep = (step: number) => {
    setCurrentStep(step);
    setError('');
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  // Step 1: Handle + display name validation
  const validateStep1 = () => {
    if (!formData.handle || !handleAvailable) {
      setError('please enter a valid, available handle');
      return false;
    }
    if (!formData.displayName.trim()) {
      setError('display name is required');
      return false;
    }
    return true;
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Build full URLs from handles
      const socialUrlMap: Record<string, string> = {
        instagram: 'https://instagram.com/',
        tiktok: 'https://tiktok.com/@',
        youtube: 'https://youtube.com/@',
        twitter: 'https://x.com/',
      };
      const cleanedLinks: SocialLinks = {};
      Object.entries(formData.socialLinks).forEach(([platform, handle]) => {
        if (handle && handle.trim()) {
          const h = handle.trim().replace(/^@/, '');
          cleanedLinks[platform as keyof SocialLinks] = socialUrlMap[platform] + h;
        }
      });

      // Create complete profile
      const { data, error } = await createCreatorProfile({
        user_id: user.id,
        handle: formData.handle.toLowerCase(),
        display_name: formData.displayName.trim(),
        bio: formData.bio.trim() || undefined,
        social_links: cleanedLinks,
      });

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      await refreshProfile();
      router.push('/dashboard');
    } catch (error) {
      setError('failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-white/60">loading...</div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-white">setup your profile</h1>
            <span className="text-white/60 text-sm">step {currentStep} of 3</span>
          </div>
          
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                  step <= currentStep ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="bg-[#111] border border-white/5 rounded-lg p-8 shadow-2xl">
          
          {/* Step 1: Handle + Display Name */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">choose your handle & name</h2>
                <p className="text-white/60 text-sm">this will be your unique url: loadout.fit/@yourhandle</p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  handle
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40">@</div>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => updateFormData('handle', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-8 pr-3 py-3 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-emerald-500 text-white placeholder-white/40"
                    placeholder="yourhandle"
                    maxLength={30}
                  />
                </div>
                
                {formData.handle && (
                  <div className="mt-2 text-xs">
                    {checkingHandle ? (
                      <span className="text-white/60">checking availability...</span>
                    ) : handleAvailable === true ? (
                      <span className="text-emerald-400">✓ handle available</span>
                    ) : handleAvailable === false ? (
                      <span className="text-red-400">✗ handle taken</span>
                    ) : null}
                  </div>
                )}
                
                <p className="mt-2 text-xs text-white/50">
                  3-30 characters, lowercase letters, numbers, and underscores only
                </p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  display name *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => updateFormData('displayName', e.target.value)}
                  className="w-full px-3 py-3 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-emerald-500 text-white placeholder-white/40"
                  placeholder="your name or brand"
                  maxLength={50}
                />
              </div>

              <button
                onClick={() => validateStep1() && nextStep()}
                disabled={!formData.handle || !handleAvailable || !formData.displayName.trim() || checkingHandle}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors duration-200"
              >
                {checkingHandle ? 'checking...' : 'continue'}
              </button>
            </div>
          )}

          {/* Step 2: Bio + Social Links */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">tell us about yourself</h2>
                <p className="text-white/60 text-sm">add your bio and social links (all optional)</p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-3 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-emerald-500 text-white placeholder-white/40 resize-none"
                  placeholder="tell your audience what you're about..."
                  maxLength={160}
                />
                <p className="mt-1 text-xs text-white/50">{formData.bio.length}/160 characters</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-white/80 text-sm font-medium">social links</h3>
                {[
                  { key: 'instagram', label: 'instagram', placeholder: 'yourusername', prefix: '@' },
                  { key: 'tiktok', label: 'tiktok', placeholder: 'yourusername', prefix: '@' },
                  { key: 'youtube', label: 'youtube', placeholder: 'yourusername', prefix: '@' },
                  { key: 'twitter', label: 'twitter/x', placeholder: 'yourusername', prefix: '@' },
                ].map((social) => (
                  <div key={social.key}>
                    <label className="block text-white/70 text-sm mb-1">
                      {social.label}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40">{social.prefix}</div>
                      <input
                        type="text"
                        value={formData.socialLinks[social.key as keyof SocialLinks] || ''}
                        onChange={(e) => updateSocialLink(social.key as keyof SocialLinks, e.target.value.replace(/^@/, ''))}
                        className="w-full pl-8 pr-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-emerald-500 text-white placeholder-white/40"
                        placeholder={social.placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => goToStep(1)}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded transition-colors duration-200"
                >
                  back
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded transition-colors duration-200"
                >
                  continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="mb-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">your loadout is ready!</h2>
                <p className="text-white/60 text-sm">your creator profile has been set up successfully</p>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-2">your page will be live at:</p>
                <p className="text-emerald-400 font-mono text-lg">
                  loadout.fit/@{formData.handle}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => goToStep(2)}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-medium rounded transition-colors duration-200"
                >
                  back
                </button>
                <button
                  onClick={completeOnboarding}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors duration-200"
                >
                  {loading ? 'creating profile...' : 'go to dashboard'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}