'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Check, ExternalLink, CreditCard, AlertTriangle, Save, User, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { uploadAvatar } from '@/lib/storage';
// Removed unused Supabase import - settings page now uses API routes
import { CreatorTheme, DEFAULT_THEME, PRESET_THEMES } from '@/types/theme';
import { getThemeStyles, getThemeFontClass } from '@/lib/utils';
import CustomDomainSettings from '@/components/CustomDomainSettings';
import { useAutosave } from '@/hooks/useAutosave';
import DraftRestoredToast from '@/components/DraftRestoredToast';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    ai_persona: '',
    social_links: {
      instagram: '',
      tiktok: '',
      youtube: '',
      twitter: '',
      pinterest: '',
      snapchat: '',
      facebook: '',
      spotify: '',
      twitch: '',
    },
  });

  const [theme, setTheme] = useState<CreatorTheme>(DEFAULT_THEME);
  
  const [applicationSettings, setApplicationSettings] = useState({
    welcome_message: "Proud of you for taking this step towards transforming your body and mind.",
    show_pricing: false,
    pricing_text: "",
    response_time: "I will get back to you within 24-48hrs"
  });
  
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Stripe Connect state
  const [stripeStatus, setStripeStatus] = useState<'loading' | 'not_connected' | 'pending' | 'complete'>('loading');
  const [stripeLoading, setStripeLoading] = useState(false);

  // Toast state for draft restoration
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [draftToastMessage, setDraftToastMessage] = useState('');

  // Autosave hooks for form persistence
  const profileAutosave = useAutosave({
    key: 'settings-profile-form',
    data: formData
  });

  const themeAutosave = useAutosave({
    key: 'settings-theme-form', 
    data: theme
  });

  const applicationAutosave = useAutosave({
    key: 'settings-application-form',
    data: applicationSettings
  });

  // Restore saved drafts on mount
  useEffect(() => {
    let restored = false;
    
    // Restore profile form data
    const savedProfile = profileAutosave.getRestoredData();
    if (savedProfile && !profile) {
      // Only restore if profile hasn't loaded yet to avoid overwriting real data
      setFormData(savedProfile);
      restored = true;
    }

    // Restore theme data
    const savedTheme = themeAutosave.getRestoredData();
    if (savedTheme) {
      setTheme(savedTheme);
      restored = true;
    }

    // Restore application settings data
    const savedApplication = applicationAutosave.getRestoredData();
    if (savedApplication) {
      setApplicationSettings(savedApplication);
      restored = true;
    }

    // Show toast if any data was restored
    if (restored) {
      setDraftToastMessage('Settings draft restored from previous session');
      setShowDraftToast(true);
    }
  }, []);

  // Check Stripe status on mount
  useEffect(() => {
    if (user?.id) {
      checkStripeStatus();
    }
  }, [user?.id]);

  // Handle stripe callback query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeParam = params.get('stripe');
    if (stripeParam === 'success') {
      setStripeStatus('complete');
      refreshProfile();
      // Clean URL
      window.history.replaceState({}, '', '/dashboard/settings');
    } else if (stripeParam === 'pending') {
      setStripeStatus('pending');
      window.history.replaceState({}, '', '/dashboard/settings');
    } else if (stripeParam === 'refresh' || stripeParam === 'error') {
      checkStripeStatus();
      window.history.replaceState({}, '', '/dashboard/settings');
    }
  }, []);

  async function checkStripeStatus() {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/stripe/connect?userId=${user.id}`);
      const data = await res.json();
      setStripeStatus(data.status || 'not_connected');
    } catch {
      setStripeStatus('not_connected');
    }
  }

  async function handleStripeConnect() {
    if (!user?.id) return;
    setStripeLoading(true);
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start Stripe setup: ' + (data.error || 'Unknown error'));
        setStripeLoading(false);
      }
    } catch (err) {
      alert('Failed to connect Stripe');
      setStripeLoading(false);
    }
  }

  // Load profile data when component mounts or profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        ai_persona: profile.theme?.ai_persona || '',
        social_links: {
          instagram: profile.social_links?.instagram || '',
          tiktok: profile.social_links?.tiktok || '',
          youtube: profile.social_links?.youtube || '',
          twitter: profile.social_links?.twitter || '',
          pinterest: profile.social_links?.pinterest || '',
          snapchat: profile.social_links?.snapchat || '',
          facebook: profile.social_links?.facebook || '',
          spotify: profile.social_links?.spotify || '',
          twitch: profile.social_links?.twitch || '',
        },
      });
      
      // Load theme from profile or use defaults
      if (profile.theme) {
        setTheme({ ...DEFAULT_THEME, ...profile.theme });
      } else {
        setTheme(DEFAULT_THEME);
      }
      
      // Load application settings
      if (profile.application_settings) {
        setApplicationSettings({ ...applicationSettings, ...profile.application_settings });
      }
    }
  }, [profile]);

  const handleSave = async (section: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let payload;
      if (section === 'theme') {
        payload = { user_id: user.id, theme };
      } else if (section === 'application') {
        payload = { user_id: user.id, application_settings: applicationSettings };
      } else {
        payload = { user_id: user.id, ...formData };
      }
      
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        alert(`failed to save: ${result.error}`);
        return;
      }
      
      // Clear saved form data on successful submission
      if (section === 'theme') {
        themeAutosave.clearSavedData();
      } else if (section === 'application') {
        applicationAutosave.clearSavedData();
      } else {
        profileAutosave.clearSavedData();
      }
      
      setSaveStatus({ ...saveStatus, [section]: true });
      await refreshProfile();
      
      setTimeout(() => {
        setSaveStatus({ ...saveStatus, [section]: false });
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      alert('failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setAvatarError('');
    
    if (file.size > 5 * 1024 * 1024) { 
      setAvatarError('Image must be under 5MB'); 
      return; 
    }
    
    setAvatarUploading(true);
    try {
      const { url, error } = await uploadAvatar(file, user.id);
      if (error) { 
        setAvatarError('Upload failed: ' + error); 
        return; 
      }
      if (url) {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, avatar_url: url }),
        });
        
        if (!res.ok) {
          setAvatarError('Failed to update profile');
          return;
        }
        
        await refreshProfile();
      }
    } catch (err) {
      setAvatarError('Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const renderPreview = () => {
    const previewStyle = getThemeStyles(theme);
    const fontClass = getThemeFontClass(theme.font);
    
    return (
      <div 
        style={previewStyle} 
        className={`p-6 rounded-lg border ${fontClass}`}
      >
        <div className="flex items-center space-x-4 mb-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: theme.cardBg }}>
              <User size={24} />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg" style={{ color: theme.textColor }}>{formData.display_name || 'creator'}</h3>
            <p className="text-sm opacity-70">@{profile?.handle || '...'}</p>
          </div>
        </div>
        <p className="text-sm mb-4 opacity-80">{formData.bio || 'no bio yet'}</p>
        <button 
          className="px-4 py-2 rounded-lg font-medium text-sm"
          style={{ 
            backgroundColor: theme.primary, 
            color: theme.background 
          }}
        >
          follow
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">settings</h1>
        <p className="text-gray-400">manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panels */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">profile</h3>
              <button
                onClick={() => handleSave('profile')}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-[#10a37f] text-black rounded-lg hover:bg-[#0d8b6b] transition-colors disabled:opacity-50"
              >
                {saveStatus.profile ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>saved</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>save</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">display name</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="your display name"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f] resize-none"
                  rows={3}
                  placeholder="tell people about yourself"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">ai chat personality</label>
                <textarea
                  value={formData.ai_persona || ''}
                  onChange={(e) => setFormData({ ...formData, ai_persona: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f] resize-none"
                  rows={4}
                  placeholder="describe yourself as a fitness professional. your background, training style, personality, what makes you unique. the AI chat on your page will use this to represent you authentically.&#10;&#10;example: 'i'm a certified PT specializing in powerlifting and body recomp. been coaching for 8 years. i keep it real — no BS, science-backed advice. i'm big on progressive overload and tracking everything.'"
                />
                <p className="text-gray-500 text-xs mt-1">this shapes how the AI chat represents you to visitors on your page</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">handle</label>
                  <input
                    type="text"
                    value={profile?.handle || ''}
                    readOnly
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-500 text-sm cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs mt-1">handle cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">avatar</label>
                  <input 
                    id="avatar-input"
                    ref={avatarInputRef} 
                    type="file" 
                    accept="image/*" 
                    capture="user"
                    onChange={handleAvatarUpload} 
                    className="hidden" 
                  />
                  <label
                    htmlFor="avatar-input"
                    className={`w-full flex items-center justify-center space-x-2 px-3 py-2 bg-[#1a1a1a] border border-white/5 rounded-lg text-gray-300 hover:text-gray-900 dark:text-white hover:bg-[#262626] transition-colors cursor-pointer ${avatarUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Camera className="h-4 w-4" />
                    <span>{avatarUploading ? 'uploading...' : profile?.avatar_url ? 'change avatar' : 'upload avatar'}</span>
                  </label>
                  {avatarError && (
                    <p className="text-red-400 text-xs mt-1">{avatarError}</p>
                  )}
                  {profile?.avatar_url && (
                    <div className="mt-2">
                      <img src={profile.avatar_url} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-white/10" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">social links</h3>
              <button
                onClick={() => handleSave('social')}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-[#10a37f] text-black rounded-lg hover:bg-[#0d8b6b] transition-colors disabled:opacity-50"
              >
                {saveStatus.social ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>saved</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>save</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">instagram</label>
                <input
                  type="text"
                  value={formData.social_links.instagram}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, instagram: e.target.value }
                  })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">tiktok</label>
                <input
                  type="text"
                  value={formData.social_links.tiktok}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, tiktok: e.target.value }
                  })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">youtube</label>
                <input
                  type="text"
                  value={formData.social_links.youtube}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, youtube: e.target.value }
                  })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="@channel"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">twitter</label>
                <input
                  type="text"
                  value={formData.social_links.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, twitter: e.target.value }
                  })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">pinterest</label>
                <input
                  type="text"
                  value={formData.social_links.pinterest}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, pinterest: e.target.value }
                  })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="https://pinterest.com/username"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">snapchat</label>
                <input
                  type="text"
                  value={formData.social_links.snapchat}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, snapchat: e.target.value }
                  })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="https://snapchat.com/add/username"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">facebook</label>
                <input
                  type="text"
                  value={formData.social_links.facebook}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, facebook: e.target.value }
                  })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">spotify</label>
                <input
                  type="text"
                  value={formData.social_links.spotify}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, spotify: e.target.value }
                  })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="https://open.spotify.com/user/..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">twitch</label>
                <input
                  type="text"
                  value={formData.social_links.twitch}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, twitch: e.target.value }
                  })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="https://twitch.tv/username"
                />
              </div>
            </div>
          </div>

          {/* Theme Customization */}
          <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">theme customization</h3>
              <button
                onClick={() => handleSave('theme')}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-[#10a37f] text-black rounded-lg hover:bg-[#0d8b6b] transition-colors disabled:opacity-50"
              >
                {saveStatus.theme ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>saved</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>save</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Color Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">background color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.background}
                      onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                      className="w-12 h-9 rounded border border-white/5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.background}
                      onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                      className="flex-1 bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">accent color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.primary}
                      onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                      className="w-12 h-9 rounded border border-white/5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.primary}
                      onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                      className="flex-1 bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                      placeholder="#1a1a1a"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">card color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.cardBg}
                      onChange={(e) => setTheme({ ...theme, cardBg: e.target.value })}
                      className="w-12 h-9 rounded border border-white/5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.cardBg}
                      onChange={(e) => setTheme({ ...theme, cardBg: e.target.value })}
                      className="flex-1 bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                      placeholder="#f5f5f5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">text color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.textColor}
                      onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                      className="w-12 h-9 rounded border border-white/5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.textColor}
                      onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                      className="flex-1 bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              {/* Font Selection */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">font</label>
                <select
                  value={theme.font}
                  onChange={(e) => setTheme({ ...theme, font: e.target.value as CreatorTheme['font'] })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                >
                  <option value="default">default / sans</option>
                  <option value="serif">serif</option>
                  <option value="mono">mono</option>
                  <option value="rounded">rounded</option>
                </select>
              </div>

              {/* Preset Themes */}
              <div>
                <label className="block text-gray-400 text-sm mb-3">preset themes</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(PRESET_THEMES).map(([name, preset]) => (
                    <button
                      key={name}
                      onClick={() => setTheme(preset)}
                      className="p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-white/20 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200 dark:border-white/10" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded border border-gray-200 dark:border-white/10" 
                          style={{ backgroundColor: preset.background }}
                        />
                        <div 
                          className="w-4 h-4 rounded border border-gray-200 dark:border-white/10" 
                          style={{ backgroundColor: preset.cardBg }}
                        />
                      </div>
                      <p className="text-gray-900 dark:text-white text-xs font-medium">{name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Application Settings Section */}
          <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">coaching applications</h3>
              <button
                onClick={() => handleSave('application')}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-[#10a37f] text-black rounded-lg hover:bg-[#0d8b6b] transition-colors disabled:opacity-50"
              >
                {saveStatus.application ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>saved</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>save</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">welcome message</label>
                <textarea
                  value={applicationSettings.welcome_message}
                  onChange={(e) => setApplicationSettings({ ...applicationSettings, welcome_message: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f] resize-none"
                  rows={3}
                  placeholder="Your welcome message for potential clients..."
                />
                <p className="text-gray-500 text-xs mt-1">This message appears at the top of your application form</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">show pricing information</p>
                  <p className="text-gray-400 text-sm">Display pricing details on your application form</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applicationSettings.show_pricing}
                    onChange={(e) => setApplicationSettings({ ...applicationSettings, show_pricing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#10a37f]"></div>
                </label>
              </div>

              {applicationSettings.show_pricing && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">pricing text</label>
                  <input
                    type="text"
                    value={applicationSettings.pricing_text}
                    onChange={(e) => setApplicationSettings({ ...applicationSettings, pricing_text: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    placeholder="e.g., Starting at $197/month"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-sm mb-2">response time</label>
                <input
                  type="text"
                  value={applicationSettings.response_time}
                  onChange={(e) => setApplicationSettings({ ...applicationSettings, response_time: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="e.g., I'll get back to you within 24-48hrs"
                />
                <p className="text-gray-500 text-xs mt-1">This message shows after form submission and in confirmation emails</p>
              </div>

              {profile?.handle && (
                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/5">
                  <p className="text-gray-400 text-sm mb-2">your application URL:</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#10a37f] text-sm font-mono">loadout.fit/{profile.handle}/apply</span>
                    <button
                      onClick={() => window.open(`/${profile.handle}/apply`, '_blank')}
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Domain Section */}
          <CustomDomainSettings onSave={refreshProfile} />

          {/* Account Section */}
          <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">account</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {stripeStatus === 'complete' ? '✅ stripe connected' : 'connect stripe'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {stripeStatus === 'complete' 
                      ? 'payments are enabled — you\'re ready to sell'
                      : stripeStatus === 'pending'
                      ? 'onboarding started — click to continue'
                      : 'enable payments for your products'}
                  </p>
                </div>
                {stripeStatus === 'complete' ? (
                  <button
                    onClick={handleStripeConnect}
                    disabled={stripeLoading}
                    className="px-4 py-2 bg-[#635bff] text-gray-900 dark:text-white rounded-lg hover:bg-[#5851db] transition-colors disabled:opacity-50"
                  >
                    {stripeLoading ? 'opening...' : 'stripe dashboard'}
                  </button>
                ) : stripeStatus === 'loading' ? (
                  <div className="px-4 py-2 text-gray-400 text-sm">checking...</div>
                ) : (
                  <button
                    onClick={handleStripeConnect}
                    disabled={stripeLoading}
                    className="px-4 py-2 bg-[#635bff] text-gray-900 dark:text-white rounded-lg hover:bg-[#5851db] transition-colors disabled:opacity-50"
                  >
                    {stripeLoading ? 'connecting...' : stripeStatus === 'pending' ? 'continue setup' : 'connect stripe'}
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">email</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">sign out</p>
                  <p className="text-gray-400 text-sm">sign out of your account</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-600 text-gray-900 dark:text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">preview</h3>
            {renderPreview()}
            <div className="mt-4">
              <a
                href={`/${profile?.handle || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-[#10a37f] hover:text-[#0d8b6b] transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span>view my page</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Restored Toast */}
      <DraftRestoredToast
        show={showDraftToast}
        onClose={() => setShowDraftToast(false)}
        message={draftToastMessage}
      />
    </div>
  );
}