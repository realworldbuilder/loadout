'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ImportedLink {
  id: string;
  title: string;
  url: string;
  position: number;
  type: 'link' | 'product';
  price?: string;
  image?: string;
}

interface ImportedProfile {
  platform: string;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string | null;
  links: ImportedLink[];
  products: ImportedLink[];
  socialLinks: Record<string, string>;
}

const platformLabels: Record<string, { name: string; color: string; icon: string }> = {
  linktree: { name: 'Linktree', color: 'text-green-400', icon: '🌳' },
  stan: { name: 'Stan Store', color: 'text-yellow-400', icon: '⚡' },
  payhip: { name: 'Payhip', color: 'text-blue-400', icon: '💳' },
  gumroad: { name: 'Gumroad', color: 'text-pink-400', icon: '🎯' },
  hoobe: { name: 'Hoo.be', color: 'text-purple-400', icon: '🟣' },
  linkme: { name: 'Link.me', color: 'text-cyan-400', icon: '🔗' },
};

export default function ImportPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<ImportedProfile | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setProfile(null);

    try {
      const res = await fetch('/api/import-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'failed to import');
        return;
      }
      setProfile(data.profile);
      const allIds = [
        ...data.profile.links.map((l: ImportedLink) => l.id),
        ...data.profile.products.map((p: ImportedLink) => p.id),
      ];
      setSelectedItems(new Set(allIds));
    } catch (err: any) {
      setError(err.message || 'something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allItems = profile ? [...profile.links, ...profile.products] : [];

  const handleContinue = () => {
    if (!profile) return;
    const importData = {
      platform: profile.platform,
      displayName: profile.displayName,
      bio: profile.bio,
      profilePicture: profile.profilePicture,
      socialLinks: profile.socialLinks,
      links: profile.links.filter(l => selectedItems.has(l.id)),
      products: profile.products.filter(p => selectedItems.has(p.id)),
    };
    sessionStorage.setItem('loadout_import', JSON.stringify(importData));
    router.push('/signup?from=import');
  };

  const platformInfo = profile ? platformLabels[profile.platform] || { name: profile.platform, color: 'text-white/60', icon: '🔗' } : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            loadout<span className="text-emerald-400">.fit</span>
          </Link>
          <Link href="/signup" className="text-sm text-white/60 hover:text-white transition-colors">
            skip → start fresh
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        {!profile && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              import in 30 seconds
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              switch to loadout
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              paste your link from any platform — linktree, stan, hoo.be, link.me, payhip, gumroad. 
              we'll pull everything over in seconds.
            </p>
          </div>
        )}

        {/* Input */}
        {!profile && (
          <div className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                placeholder="linktr.ee/you · hoo.be/you · link.me/you · stan.store/you"
                className="flex-1 px-4 py-3.5 bg-[#111] border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-white/30 text-sm"
                disabled={loading}
              />
              <button
                onClick={handleImport}
                disabled={loading || !url.trim()}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    scanning...
                  </span>
                ) : 'import'}
              </button>
            </div>

            {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

            {/* Supported platforms */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/30">
              <span>works with:</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-white/50">🌳 Linktree</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-white/50">🟣 Hoo.be</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-white/50">🔗 Link.me</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-white/50">⚡ Stan</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-white/50">💳 Payhip</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-white/50">🎯 Gumroad</span>
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/40">
              {['free forever tier', 'no credit card', 'keeps all your links'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>

            {/* Why switch */}
            <div className="mt-16 grid sm:grid-cols-3 gap-6">
              {[
                { icon: '💰', title: 'stop overpaying', desc: 'loadout is free. pro is $19/mo. stan charges $29. linktree pro is $24. do the math.' },
                { icon: '🏋️', title: 'built for fitness', desc: 'not another generic link page. fitness-native templates, AI tools, and pricing intelligence.' },
                { icon: '🔄', title: 'import everything', desc: 'links, products, bio, socials — all pulled over automatically. live in 30 seconds.' },
              ].map(item => (
                <div key={item.title} className="p-5 bg-[#111] border border-white/5 rounded-lg">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-medium text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {profile && (
          <div className="space-y-8">
            {/* Profile preview */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                {profile.profilePicture && (
                  <img
                    src={profile.profilePicture}
                    alt={profile.displayName}
                    className="w-16 h-16 rounded-full object-cover border border-white/10"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold">{profile.displayName}</h2>
                  <p className="text-white/40 text-sm">@{profile.username}</p>
                  {profile.bio && (
                    <p className="text-white/60 text-sm mt-2 leading-relaxed line-clamp-3">{profile.bio}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-sm">{platformInfo?.icon}</span>
                  <span className={`text-xs font-medium ${platformInfo?.color}`}>{platformInfo?.name}</span>
                </div>
              </div>

              {/* Socials */}
              {Object.keys(profile.socialLinks).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(profile.socialLinks).map(([platform]) => (
                    <span key={platform} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">
                      {platform}
                    </span>
                  ))}
                </div>
              )}

              {/* Links section */}
              {profile.links.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white/80">
                      🔗 {profile.links.length} link{profile.links.length !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {profile.links.map(link => (
                      <ItemRow key={link.id} item={link} selected={selectedItems.has(link.id)} onToggle={() => toggleItem(link.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Products section */}
              {profile.products.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white/80">
                      📦 {profile.products.length} product{profile.products.length !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {profile.products.map(product => (
                      <ItemRow key={product.id} item={product} selected={selectedItems.has(product.id)} onToggle={() => toggleItem(product.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Select all / none */}
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => {
                    if (selectedItems.size === allItems.length) {
                      setSelectedItems(new Set());
                    } else {
                      setSelectedItems(new Set(allItems.map(i => i.id)));
                    }
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  {selectedItems.size === allItems.length ? 'deselect all' : 'select all'}
                </button>
              </div>
            </div>

            {/* Comparison */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h3 className="text-sm font-medium text-white/80 mb-4">what you're upgrading to</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-xs text-red-400 font-medium mb-2">{platformInfo?.name || 'current'}</p>
                  <ul className="space-y-1.5 text-xs text-white/50">
                    {profile.platform === 'linktree' && <>
                      <li>→ just links, no selling</li>
                      <li>→ $24/mo for pro</li>
                      <li>→ generic templates</li>
                    </>}
                    {profile.platform === 'stan' && <>
                      <li>→ $29/mo minimum</li>
                      <li>→ no free tier</li>
                      <li>→ not fitness-specific</li>
                    </>}
                    {profile.platform === 'payhip' && <>
                      <li>→ no link-in-bio page</li>
                      <li>→ generic storefront</li>
                      <li>→ 5% fee on free tier</li>
                    </>}
                    {profile.platform === 'gumroad' && <>
                      <li>→ 10% platform fee</li>
                      <li>→ no link-in-bio</li>
                      <li>→ not fitness-focused</li>
                    </>}
                    {profile.platform === 'hoobe' && <>
                      <li>→ invite-only, limited access</li>
                      <li>→ no digital product sales</li>
                      <li>→ no fitness-specific tools</li>
                    </>}
                    {profile.platform === 'linkme' && <>
                      <li>→ social-focused, not sales-focused</li>
                      <li>→ no digital product storefront</li>
                      <li>→ no fitness-native features</li>
                    </>}
                    <li>→ no AI tools</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-xs text-emerald-400 font-medium mb-2">loadout.fit</p>
                  <ul className="space-y-1.5 text-xs text-white/50">
                    <li>→ links + digital products + coaching</li>
                    <li>→ free tier / $19 pro</li>
                    <li>→ fitness-native templates</li>
                    <li>→ AI product writer + pricing data</li>
                    <li>→ 5% fee (lower than most)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <button
                onClick={() => { setProfile(null); setUrl(''); }}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-colors text-sm"
              >
                start over
              </button>
              <button
                onClick={handleContinue}
                disabled={selectedItems.size === 0}
                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
              >
                continue with {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} → create my loadout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, selected, onToggle }: { item: ImportedLink; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        selected ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-black/30 border-white/5 opacity-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? 'border-emerald-500 bg-emerald-500' : 'border-white/20'
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        {item.image && (
          <img src={item.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">{item.title || 'Untitled'}</p>
            {item.type === 'product' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 flex-shrink-0">product</span>
            )}
            {item.price && (
              <span className="text-xs text-white/40 flex-shrink-0">{item.price}</span>
            )}
          </div>
          <p className="text-xs text-white/40 truncate">{item.url}</p>
        </div>
      </div>
    </button>
  );
}
