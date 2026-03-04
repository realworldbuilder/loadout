'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  checkHandleAvailability, 
  createCreatorProfile, 
  updateCreatorProfile 
} from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Handle
  const [handle, setHandle] = useState('');
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);
  
  // Step 2: Profile details
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Step 3: Social links
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  // Redirect if not authenticated or already onboarded
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (profile && profile.handle) {
      router.push('/dashboard');
      return;
    }
  }, [user, profile, router]);

  // Handle validation with debounce
  useEffect(() => {
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
  }, [handle]);

  // Avatar file handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('please select a valid image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('image must be smaller than 5MB');
      return;
    }

    setAvatarFile(file);
    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload avatar to Supabase storage
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    setUploadingAvatar(true);
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        setError('failed to upload avatar');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setError('failed to upload avatar');
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Step navigation
  const goToStep = (step: number) => {
    setCurrentStep(step);
    setError('');
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  // Step 1: Handle validation and save
  const saveHandle = async () => {
    if (!handle || !handleAvailable) {
      setError('please enter a valid, available handle');
      return;
    }

    if (!user) return;

    setLoading(true);
    
    try {
      const { data, error } = await createCreatorProfile({
        user_id: user.id,
        handle: handle.toLowerCase(),
        display_name: displayName || handle,
      });

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      await refreshProfile();
      nextStep();
    } catch (error) {
      setError('failed to save handle');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Save profile details
  const saveProfile = async () => {
    if (!displayName.trim()) {
      setError('display name is required');
      return;
    }

    if (!user) return;

    setLoading(true);
    
    try {
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
        if (!avatarUrl && avatarFile) {
          setLoading(false);
          return; // Error already set in uploadAvatar
        }
      }

      const updates: any = {
        display_name: displayName.trim(),
      };

      if (bio.trim()) {
        updates.bio = bio.trim();
      }

      if (avatarUrl) {
        updates.avatar_url = avatarUrl;
      }

      const { error } = await updateCreatorProfile(user.id, updates);

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      await refreshProfile();
      nextStep();
    } catch (error) {
      setError('failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save social links
  const saveSocialLinks = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const cleanedLinks: SocialLinks = {};
      
      // Clean and validate social links
      Object.entries(socialLinks).forEach(([platform, url]) => {
        if (url && url.trim()) {
          cleanedLinks[platform as keyof SocialLinks] = url.trim();
        }
      });

      const { error } = await updateCreatorProfile(user.id, {
        social_links: cleanedLinks
      });

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      await refreshProfile();
      nextStep();
    } catch (error) {
      setError('failed to save social links');
    } finally {
      setLoading(false);
    }
  };

  // Update social link
  const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  // Complete onboarding
  const completeOnboarding = () => {
    router.push('/dashboard');
  };

  if (!user) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-white">setup your profile</h1>
            <span className="text-white/60 text-sm">step {currentStep} of 4</span>
          </div>
          
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
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
          
          {/* Step 1: Handle */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">pick your handle</h2>
                <p className="text-white/60 text-sm">this will be your unique url: gymsignal.co/@yourhandle</p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  handle
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40">@</div>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-8 pr-3 py-3 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-emerald-500 text-white placeholder-white/40"
                    placeholder="yourhandle"
                    maxLength={30}
                  />
                </div>
                
                {handle && (
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

              <button
                onClick={saveHandle}
                disabled={!handle || !handleAvailable || loading || checkingHandle}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors duration-200"
              >
                {loading ? 'saving...' : 'continue'}
              </button>
            </div>
          )}

          {/* Step 2: Profile details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">tell us about yourself</h2>
                <p className="text-white/60 text-sm">add your photo, name, and bio</p>
              </div>

              {/* Avatar upload */}
              <div className="text-center">
                <div className="inline-block">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/10"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                  
                  <label className="mt-3 block text-sm text-emerald-400 hover:text-emerald-300 cursor-pointer">
                    {avatarFile ? 'change photo' : 'add photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  display name *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-3 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-emerald-500 text-white placeholder-white/40"
                  placeholder="your name or brand"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-3 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-emerald-500 text-white placeholder-white/40 resize-none"
                  placeholder="tell your audience what you're about..."
                  maxLength={160}
                />
                <p className="mt-1 text-xs text-white/50">{bio.length}/160 characters</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => goToStep(1)}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded transition-colors duration-200"
                >
                  back
                </button>
                <button
                  onClick={saveProfile}
                  disabled={!displayName.trim() || loading || uploadingAvatar}
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors duration-200"
                >
                  {loading || uploadingAvatar ? 'saving...' : 'continue'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Social links */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">connect your socials</h2>
                <p className="text-white/60 text-sm">help your audience find you everywhere</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'instagram', label: 'instagram', placeholder: 'https://instagram.com/yourusername' },
                  { key: 'tiktok', label: 'tiktok', placeholder: 'https://tiktok.com/@yourusername' },
                  { key: 'youtube', label: 'youtube', placeholder: 'https://youtube.com/@yourusername' },
                  { key: 'twitter', label: 'twitter/x', placeholder: 'https://twitter.com/yourusername' },
                ].map((social) => (
                  <div key={social.key}>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      {social.label}
                    </label>
                    <input
                      type="url"
                      value={socialLinks[social.key as keyof SocialLinks] || ''}
                      onChange={(e) => updateSocialLink(social.key as keyof SocialLinks, e.target.value)}
                      className="w-full px-3 py-3 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-emerald-500 text-white placeholder-white/40"
                      placeholder={social.placeholder}
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => goToStep(2)}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded transition-colors duration-200"
                >
                  back
                </button>
                <button
                  onClick={saveSocialLinks}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium rounded transition-colors duration-200"
                >
                  {loading ? 'saving...' : 'continue'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
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
                <p className="text-white/80 mb-2">your page is now live at:</p>
                <p className="text-emerald-400 font-mono text-lg">
                  gymsignal.co/@{profile?.handle}
                </p>
              </div>

              <button
                onClick={completeOnboarding}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded transition-colors duration-200"
              >
                go to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}