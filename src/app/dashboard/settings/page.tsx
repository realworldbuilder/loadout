export const dynamic = "force-dynamic";
'use client';

import { useState } from 'react';
import { Camera, Check, ExternalLink, CreditCard, AlertTriangle, Save } from 'lucide-react';

interface CreatorSettings {
  displayName: string;
  bio: string;
  avatar: string;
  handle: string;
  socialLinks: {
    instagram: string;
    tiktok: string;
    youtube: string;
    twitter: string;
    website: string;
  };
  theme: {
    accentColor: string;
    backgroundStyle: 'dark' | 'darker' | 'gradient';
  };
  stripeConnected: boolean;
}

const accentColors = [
  { name: 'emerald', value: '#10a37f' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'purple', value: '#8b5cf6' },
  { name: 'pink', value: '#ec4899' },
  { name: 'orange', value: '#f97316' },
  { name: 'red', value: '#ef4444' },
];

const demoPayouts = [
  { id: '1', date: '2026-02-28', amount: 1247.50, status: 'paid' },
  { id: '2', date: '2026-01-31', amount: 892.25, status: 'paid' },
  { id: '3', date: '2025-12-31', amount: 1456.75, status: 'paid' },
  { id: '4', date: '2025-11-30', amount: 634.00, status: 'paid' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<CreatorSettings>({
    displayName: 'Alex Fitness',
    bio: 'certified personal trainer helping you build strength and confidence. 💪 transformation coach since 2019',
    avatar: '',
    handle: 'alexfitness',
    socialLinks: {
      instagram: '@alexfitness',
      tiktok: '@alexfitness',
      youtube: '@alexfitnesschannel',
      twitter: '@alexfitness',
      website: 'alexfitness.com',
    },
    theme: {
      accentColor: '#10a37f',
      backgroundStyle: 'dark',
    },
    stripeConnected: true,
  });

  const [saveStatus, setSaveStatus] = useState<{ [key: string]: boolean }>({});

  const handleSave = (section: string) => {
    setSaveStatus({ ...saveStatus, [section]: true });
    setTimeout(() => {
      setSaveStatus({ ...saveStatus, [section]: false });
    }, 2000);
  };

  const renderPreview = () => {
    const bgStyles = {
      dark: 'bg-[#0d0d0d]',
      darker: 'bg-black',
      gradient: 'bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a]',
    };

    return (
      <div className={`${bgStyles[settings.theme.backgroundStyle]} p-6 rounded-lg border border-white/10`}>
        <div className="flex items-center space-x-4 mb-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: settings.theme.accentColor }}
          >
            {settings.displayName.charAt(0)}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{settings.displayName}</h3>
            <p className="text-gray-400 text-sm">@{settings.handle}</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm mb-4">{settings.bio}</p>
        <button 
          className="px-4 py-2 rounded-lg text-white font-medium text-sm"
          style={{ backgroundColor: settings.theme.accentColor }}
        >
          follow
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
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
                  className="flex items-center space-x-2 px-4 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0d8b6b] transition-colors"
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
                    value={settings.displayName}
                    onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">bio</label>
                  <textarea
                    value={settings.bio}
                    onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f] resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">handle</label>
                    <input
                      type="text"
                      value={settings.handle}
                      readOnly
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-500 text-sm cursor-not-allowed"
                    />
                    <p className="text-gray-500 text-xs mt-1">handle cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">avatar</label>
                    <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-[#1a1a1a] border border-white/5 rounded-lg text-gray-300 hover:text-white hover:bg-[#262626] transition-colors">
                      <Camera className="h-4 w-4" />
                      <span>upload photo</span>
                    </button>
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
                  className="flex items-center space-x-2 px-4 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0d8b6b] transition-colors"
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
                    value={settings.socialLinks.instagram}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, instagram: e.target.value }
                    })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">tiktok</label>
                  <input
                    type="text"
                    value={settings.socialLinks.tiktok}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, tiktok: e.target.value }
                    })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">youtube</label>
                  <input
                    type="text"
                    value={settings.socialLinks.youtube}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, youtube: e.target.value }
                    })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    placeholder="@channel"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">twitter</label>
                  <input
                    type="text"
                    value={settings.socialLinks.twitter}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, twitter: e.target.value }
                    })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    placeholder="@username"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm mb-2">website</label>
                  <input
                    type="text"
                    value={settings.socialLinks.website}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, website: e.target.value }
                    })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    placeholder="yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Theme Customization */}
            <div className="bg-[#111] rounded-lg border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">theme customization</h3>
                <button
                  onClick={() => handleSave('theme')}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0d8b6b] transition-colors"
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
                <div>
                  <label className="block text-gray-400 text-sm mb-3">accent color</label>
                  <div className="grid grid-cols-6 gap-3">
                    {accentColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSettings({
                          ...settings,
                          theme: { ...settings.theme, accentColor: color.value }
                        })}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          settings.theme.accentColor === color.value 
                            ? 'border-white scale-110' 
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-3">background style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'dark', label: 'dark', bg: 'bg-[#0d0d0d]' },
                      { key: 'darker', label: 'darker', bg: 'bg-black' },
                      { key: 'gradient', label: 'gradient', bg: 'bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a]' },
                    ].map((style) => (
                      <button
                        key={style.key}
                        onClick={() => setSettings({
                          ...settings,
                          theme: { ...settings.theme, backgroundStyle: style.key as any }
                        })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          settings.theme.backgroundStyle === style.key 
                            ? 'border-[#10a37f]' 
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className={`${style.bg} w-full h-8 rounded mb-2`}></div>
                        <span className="text-gray-300 text-sm">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Settings */}
            <div className="bg-[#111] rounded-lg border border-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">payout settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-[#10a37f]" />
                    <div>
                      <p className="text-white font-medium">stripe connect</p>
                      <p className="text-gray-400 text-sm">
                        {settings.stripeConnected ? 'connected and ready to receive payments' : 'not connected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {settings.stripeConnected ? (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>connected</span>
                      </div>
                    ) : (
                      <button className="px-4 py-2 bg-[#635bff] text-white rounded-lg hover:bg-[#5a52e8] transition-colors">
                        connect stripe
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-4">payout history</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left text-gray-400 text-sm font-medium pb-3">date</th>
                          <th className="text-right text-gray-400 text-sm font-medium pb-3">amount</th>
                          <th className="text-right text-gray-400 text-sm font-medium pb-3">status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoPayouts.map((payout) => (
                          <tr key={payout.id} className="border-b border-gray-800/50">
                            <td className="py-3">
                              <span className="text-gray-300 text-sm">
                                {new Date(payout.date).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="text-right py-3">
                              <span className="text-white text-sm font-medium">
                                ${payout.amount.toFixed(2)}
                              </span>
                            </td>
                            <td className="text-right py-3">
                              <span className="text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded">
                                {payout.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#111] rounded-lg border border-red-500/20 p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-6 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>danger zone</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div>
                    <p className="text-white font-medium">deactivate page</p>
                    <p className="text-gray-400 text-sm">temporarily disable your public profile</p>
                  </div>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    deactivate
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div>
                    <p className="text-white font-medium">delete account</p>
                    <p className="text-gray-400 text-sm">permanently delete your account and all data</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    delete account
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
                  href={`/@${settings.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-[#10a37f] hover:text-[#0d8b6b] transition-colors text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>view full page</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}