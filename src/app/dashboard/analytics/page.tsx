'use client';

import { useEffect, useState } from 'react';
import { Eye, MousePointer, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  pageViews: {
    total: number;
    today: number;
    last7days: number;
    last30days: number;
  };
  clicks: {
    total: number;
    today: number;
    last7days: number;
    last30days: number;
  };
  topProducts: Array<{
    id: string;
    title: string;
    product_type: string;
    clicks: number;
  }>;
  referrers: Array<{
    referrer: string;
    count: number;
  }>;
  viewsByDay: Array<{
    date: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/analytics?creator_id=${profile.id}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-white/5 rounded w-48 mb-2"></div>
          <div className="h-5 bg-white/5 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
                <div className="h-6 bg-white/5 rounded w-20 mb-4"></div>
                <div className="h-8 bg-white/5 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p className="text-red-400">failed to load analytics</p>
          <p className="text-red-400/60 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const maxViews = Math.max(...(analytics?.viewsByDay.map(d => d.count) || [1]));
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">analytics</h1>
          <p className="text-gray-400">track your performance and growth</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#2f2f2f] rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-5 w-5 text-gray-500 dark:text-white/60" />
            <span className="text-sm text-gray-400">total views</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.pageViews.total || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#2f2f2f] rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-5 w-5 text-gray-500 dark:text-white/60" />
            <span className="text-sm text-gray-400">views today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.pageViews.today || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#2f2f2f] rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MousePointer className="h-5 w-5 text-gray-500 dark:text-white/60" />
            <span className="text-sm text-gray-400">total clicks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.clicks.total || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#2f2f2f] rounded-lg border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MousePointer className="h-5 w-5 text-gray-500 dark:text-white/60" />
            <span className="text-sm text-gray-400">clicks today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.clicks.today || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Views Chart */}
        <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">views last 30 days</h3>
          <div className="space-y-1">
            {analytics?.viewsByDay.slice(-7).map((day, index) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-12 text-right font-mono">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
                <div className="flex-1 bg-white/5 rounded h-6 relative overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded transition-all duration-300"
                    style={{ width: `${maxViews > 0 ? (day.count / maxViews) * 100 : 0}%` }}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-gray-900 dark:text-white">
                    {day.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">top referrers</h3>
          <div className="space-y-3">
            {analytics?.referrers.length ? (
              analytics.referrers.map((ref, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{ref.referrer}</span>
                  <span className="text-emerald-400 font-mono text-sm">{ref.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">no referrer data yet</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">top clicked products</h3>
          <div className="space-y-3">
            {analytics?.topProducts.length ? (
              analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">{product.title}</p>
                    <p className="text-gray-500 text-xs">{product.product_type}</p>
                  </div>
                  <span className="text-emerald-400 font-mono text-sm">{product.clicks} clicks</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">no product clicks yet</p>
            )}
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">share your link</h3>
          {profile?.handle && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-4">
              <p className="text-emerald-400 text-sm mb-2">your public page:</p>
              <div className="flex items-center gap-2">
                <code className="text-emerald-300 text-sm flex-1 bg-black/20 px-2 py-1 rounded">
                  loadout.fit/{profile.handle}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://loadout.fit/${profile.handle}`);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2 text-sm text-gray-400">
            <p>• share this link everywhere</p>
            <p>• track every view and click</p>
            <p>• optimize based on data</p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
          <Zap className="h-4 w-4" />
          <span>tracking is live — data updates in real-time</span>
        </div>
      </div>
    </div>
  );
}