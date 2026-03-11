'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Eye,
  ExternalLink,
  Copy,
  Check,
  Tag,
  Heart,
  Layers,
  MousePointerClick,
  LinkIcon,
  Paintbrush,
  ArrowRight,
  Plus
} from 'lucide-react';

interface Stats {
  pageViews: number;
  codeClicks: number;
  pickClicks: number;
  totalCodes: number;
  totalPicks: number;
  totalLinks: number;
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading, initializing } = useAuth();
  const [stats, setStats] = useState<Stats>({
    pageViews: 0,
    codeClicks: 0,
    pickClicks: 0,
    totalCodes: 0,
    totalPicks: 0,
    totalLinks: 0,
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (profile === undefined) return;
    if (profile === null) { router.push('/onboarding'); return; }
    loadStats();
  }, [user, profile, authLoading, initializing, router]);

  async function loadStats() {
    if (!profile) return;
    try {
      setLoading(true);
      const [productsRes, codesRes, picksRes] = await Promise.all([
        fetch(`/api/products?creator_id=${profile.id}`),
        fetch(`/api/codes?creator_id=${profile.id}`),
        fetch(`/api/picks?creator_id=${profile.id}`),
      ]);

      let totalLinks = 0;
      if (productsRes.ok) {
        const r = await productsRes.json();
        totalLinks = (r.data || []).filter((p: any) => p.product_type === 'link' && p.is_active).length;
      }

      let totalCodes = 0;
      let codeClicks = 0;
      if (codesRes.ok) {
        const r = await codesRes.json();
        const codes = r.data || [];
        totalCodes = codes.length;
        codeClicks = codes.reduce((sum: number, c: any) => sum + (c.click_count || 0), 0);
      }

      let totalPicks = 0;
      let pickClicks = 0;
      if (picksRes.ok) {
        const r = await picksRes.json();
        const picks = r.data || [];
        totalPicks = picks.length;
        pickClicks = picks.reduce((sum: number, p: any) => sum + (p.click_count || 0), 0);
      }

      setStats({ pageViews: 0, codeClicks, pickClicks, totalCodes, totalPicks, totalLinks });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyLink() {
    if (!profile) return;
    navigator.clipboard.writeText(`https://loadout.fit/${profile.handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (initializing || authLoading || loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-white/60 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60 lowercase">loading...</p>
        </div>
      </div>
    );
  }

  const pageUrl = `loadout.fit/${profile.handle}`;

  return (
    <div className="px-6 py-8 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1 lowercase">
          hey, {profile.display_name?.split(' ')[0]?.toLowerCase() || profile.handle}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2 bg-[#171717] border border-white/10 rounded-lg px-3 py-2 flex-1 max-w-sm">
            <LinkIcon className="h-4 w-4 text-white/40 flex-shrink-0" />
            <span className="text-white/70 text-sm truncate">{pageUrl}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/20 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'copied' : 'copy'}
          </button>
          <Link
            href={`/${profile.handle}`}
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            view
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-[#171717] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-white/50 lowercase">codes</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalCodes}</p>
          <p className="text-xs text-white/40 mt-1">{stats.codeClicks} clicks</p>
        </div>
        <div className="bg-[#171717] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-pink-400" />
            <span className="text-xs text-white/50 lowercase">picks</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalPicks}</p>
          <p className="text-xs text-white/40 mt-1">{stats.pickClicks} clicks</p>
        </div>
        <div className="bg-[#171717] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-white/50 lowercase">links</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalLinks}</p>
        </div>
        <div className="bg-[#171717] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-white/50 lowercase">views</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.pageViews}</p>
          <p className="text-xs text-white/40 mt-1">coming soon</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-white/50 lowercase mb-3">quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/dashboard/page-builder"
            className="group bg-[#171717] border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Paintbrush className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm lowercase">edit page</h3>
                  <p className="text-xs text-white/40 lowercase">customize your storefront</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-emerald-400 transition-colors" />
            </div>
          </Link>

          <Link
            href="/dashboard/codes"
            className="group bg-[#171717] border border-white/10 rounded-xl p-4 hover:border-yellow-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Tag className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm lowercase">manage codes</h3>
                  <p className="text-xs text-white/40 lowercase">{stats.totalCodes > 0 ? `${stats.totalCodes} active codes` : 'add discount codes'}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-yellow-400 transition-colors" />
            </div>
          </Link>

          <Link
            href="/dashboard/picks"
            className="group bg-[#171717] border border-white/10 rounded-xl p-4 hover:border-pink-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Heart className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm lowercase">manage picks</h3>
                  <p className="text-xs text-white/40 lowercase">{stats.totalPicks > 0 ? `${stats.totalPicks} product recs` : 'recommend products'}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-pink-400 transition-colors" />
            </div>
          </Link>

          <Link
            href="/dashboard/picks/bookmarklet"
            className="group bg-[#171717] border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MousePointerClick className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm lowercase">browser tool</h3>
                  <p className="text-xs text-white/40 lowercase">add picks from any site</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-purple-400 transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Getting started checklist */}
      <div className="bg-[#171717] border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white/50 lowercase mb-4">getting started</h2>
        <div className="space-y-3">
          <ChecklistItem done={true} label="create your account" />
          <ChecklistItem done={stats.totalLinks > 0 || stats.totalCodes > 0 || stats.totalPicks > 0} label="add content to your page" href="/dashboard/page-builder" />
          <ChecklistItem done={stats.totalCodes > 0} label="add your first discount code" href="/dashboard/codes" />
          <ChecklistItem done={stats.totalPicks > 0} label="add your first product pick" href="/dashboard/picks" />
          <ChecklistItem done={false} label="share your page link" onClick={handleCopyLink} />
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ done, label, href, onClick }: { done: boolean; label: string; href?: string; onClick?: () => void }) {
  const content = (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${done ? 'opacity-60' : 'hover:bg-white/5 cursor-pointer'}`} onClick={onClick}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? 'border-emerald-500 bg-emerald-500' : 'border-white/20'}`}>
        {done && <Check className="h-3 w-3 text-white" />}
      </div>
      <span className={`text-sm lowercase ${done ? 'text-white/50 line-through' : 'text-white/80'}`}>{label}</span>
    </div>
  );

  if (href && !done) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
