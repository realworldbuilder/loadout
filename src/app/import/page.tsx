'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LinktreeLink {
  id: number;
  title: string;
  url: string;
  position: number;
  thumbnail_url?: string;
}

interface LinktreeProfile {
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string | null;
  links: LinktreeLink[];
  socialLinks: Record<string, string>;
}

export default function ImportPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<LinktreeProfile | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<Set<number>>(new Set());
  const router = useRouter();

  const handleImport = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setProfile(null);

    try {
      const res = await fetch('/api/import-linktree', {
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
      // Select all links by default
      setSelectedLinks(new Set(data.profile.links.map((l: LinktreeLink) => l.id)));
    } catch (err: any) {
      setError(err.message || 'something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleLink = (id: number) => {
    setSelectedLinks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = () => {
    if (!profile) return;

    // Store imported data in sessionStorage for onboarding to pick up
    const importData = {
      displayName: profile.displayName,
      bio: profile.bio,
      profilePicture: profile.profilePicture,
      socialLinks: profile.socialLinks,
      links: profile.links.filter(l => selectedLinks.has(l.id)),
    };

    sessionStorage.setItem('loadout_import', JSON.stringify(importData));
    router.push('/signup?from=import');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            loadout<span className="text-emerald-400">.fit</span>
          </Link>
          <Link
            href="/signup"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
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
              import your linktree
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              paste your linktree url and we'll pull everything over — links, bio, socials. 
              upgrade to a real storefront in seconds.
            </p>
          </div>
        )}

        {/* Input */}
        {!profile && (
          <div className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                  placeholder="linktr.ee/yourname or just your username"
                  className="w-full px-4 py-3.5 bg-[#111] border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-white/30 text-sm"
                  disabled={loading}
                />
              </div>
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
                    importing...
                  </span>
                ) : (
                  'import'
                )}
              </button>
            </div>

            {error && (
              <p className="mt-3 text-red-400 text-sm">{error}</p>
            )}

            {/* Trust signals */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                free forever tier
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                no credit card
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                keeps all your links
              </span>
            </div>

            {/* Why switch section */}
            <div className="mt-16 grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: '💰',
                  title: 'stop paying $29/mo',
                  desc: 'loadout is free. pro is $19/mo. stan charges $29 for less.',
                },
                {
                  icon: '🏋️',
                  title: 'built for fitness',
                  desc: 'not another generic link page. templates, AI tools, and pricing data for fitness creators.',
                },
                {
                  icon: '🧠',
                  title: 'AI-powered tools',
                  desc: 'product descriptions, pricing intelligence, and trend data from GymSignal.',
                },
              ].map((item) => (
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
                    <p className="text-white/60 text-sm mt-2 leading-relaxed">{profile.bio}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-400 text-xs font-medium">found</span>
                </div>
              </div>

              {/* Social links */}
              {Object.keys(profile.socialLinks).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(profile.socialLinks).map(([platform, url]) => (
                    <span
                      key={platform}
                      className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white/80">
                    {profile.links.length} links found
                  </h3>
                  <button
                    onClick={() => {
                      if (selectedLinks.size === profile.links.length) {
                        setSelectedLinks(new Set());
                      } else {
                        setSelectedLinks(new Set(profile.links.map(l => l.id)));
                      }
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    {selectedLinks.size === profile.links.length ? 'deselect all' : 'select all'}
                  </button>
                </div>

                {profile.links.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => toggleLink(link.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedLinks.has(link.id)
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-black/30 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedLinks.has(link.id)
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-white/20'
                      }`}>
                        {selectedLinks.has(link.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{link.title || 'Untitled link'}</p>
                        <p className="text-xs text-white/40 truncate">{link.url}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h3 className="text-sm font-medium text-white/80 mb-4">what you're upgrading to</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-xs text-red-400 font-medium mb-2">linktree</p>
                  <ul className="space-y-1.5 text-xs text-white/50">
                    <li>→ just links, no selling</li>
                    <li>→ $24/mo for pro</li>
                    <li>→ generic templates</li>
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
                disabled={selectedLinks.size === 0}
                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
              >
                continue with {selectedLinks.size} link{selectedLinks.size !== 1 ? 's' : ''} → create my loadout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
