'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Check, ExternalLink, CreditCard, AlertTriangle, Save, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateCreatorProfile, signOut } from '@/lib/auth';
import { uploadAvatar } from '@/lib/storage';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const accentColors = [
  { name: 'emerald', value: '#10a37f' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'purple', value: '#8b5cf6' },
  { name: 'pink', value: '#ec4899' },
  { name: 'orange', value: '#f97316' },
  { name: 'red', value: '#ef4444' },
];

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClientComponentClient();
  
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    social_links: {
      instagram: '',
      tiktok: '',
      youtube: '',
      twitter: '',
    },
  });
  
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Load profile data when component mounts or profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        social_links: {
          instagram: profile.social_links?.instagram || '',
          tiktok: profile.social_links?.tiktok || '',
          youtube: profile.social_links?.youtube || '',
          twitter: profile.social_links?.twitter || '',
        },
      });
    }
  }, [profile]);

  const handleSave = async (section: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await updateCreatorProfile(user.id, formData);
      
      if (error) {
        alert(`failed to save: ${error}`);
        return;
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
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    
    setAvatarUploading(true);
    try {
      const { url, error } = await uploadAvatar(file, user.id);
      if (error) { alert('Upload failed: ' + error); return; }
      if (url) {
        await updateCreatorProfile(user.id, { avatar_url: url });
        await refreshProfile();
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const renderPreview = () => {
    return (
      <div className="bg-[#0d0d0d] p-6 rounded-lg border border-white/10">
        <div className="flex items-center space-x-4 mb-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl">
              <User size={24} />
            </div>
          )}
          <div>
            <h3 className="text-white font-bold text-lg">{formData.display_name || 'creator'}</h3>
            <p className="text-gray-400 text-sm">@{profile?.handle || '...'}</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm mb-4">{formData.bio || 'no bio yet'}</p>
        <button className="px-4 py-2 rounded-lg text-black font-medium text-sm bg-emerald-500">
          follow
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">settings</h1>
        <p className="text-gray-400">manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panels */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">profile</h3>
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
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="your display name"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f] resize-none"
                  rows={3}
                  placeholder="tell people about yourself"
                />
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
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-[#1a1a1a] border border-white/5 rounded-lg text-gray-300 hover:text-white hover:bg-[#262626] transition-colors disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                    <span>{avatarUploading ? 'uploading...' : profile?.avatar_url ? 'change avatar' : 'upload avatar'}</span>
                  </button>
                  {profile?.avatar_url && (
                    <div className="mt-2">
                      <img src={profile.avatar_url} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-white/10" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">social links</h3>
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
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
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
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
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
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
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
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          {/* Theme Customization */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">theme customization</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-3">accent color</label>
                <div className="grid grid-cols-6 gap-3">
                  {accentColors.map((color) => (
                    <button
                      key={color.name}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        color.value === '#10a37f' 
                          ? 'border-white scale-110' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={`${color.name} - coming soon`}
                      disabled
                    />
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-2">custom themes coming soon</p>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">account</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                <div>
                  <p className="text-white font-medium">connect stripe</p>
                  <p className="text-gray-400 text-sm">enable payments for your products</p>
                </div>
                <button 
                  disabled 
                  className="px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                >
                  coming soon
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                <div>
                  <p className="text-white font-medium">email</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div>
                  <p className="text-white font-medium">sign out</p>
                  <p className="text-gray-400 text-sm">sign out of your account</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">preview</h3>
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
    </div>
  );
}