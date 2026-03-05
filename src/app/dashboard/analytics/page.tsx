'use client';

import { Eye, Users, MousePointer, TrendingUp, DollarSign, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AnalyticsPage() {
  const { profile } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">analytics</h1>
          <p className="text-gray-400">track your performance and growth</p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Feature Preview */}
        <div className="lg:col-span-2 bg-[#111] rounded-lg border border-white/5 p-8 text-center">
          <TrendingUp className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">analytics — launching soon</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            get detailed insights into your page performance, visitor behavior, and revenue metrics. understand what's driving your growth.
          </p>
          
          {/* Public Page URL */}
          {profile?.handle && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 max-w-md mx-auto mb-6">
              <p className="text-emerald-400 text-sm mb-2">your public page:</p>
              <a 
                href={`/${profile.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:text-emerald-200 transition-colors"
              >
                loadout.fit/{profile.handle}
              </a>
            </div>
          )}
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-400 text-sm max-w-md mx-auto">
            coming in the next update
          </div>
        </div>

        {/* Feature Cards */}
        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <Eye className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">page views & visitors</h3>
          <p className="text-gray-400 text-sm">
            track unique visitors, page views, and engagement metrics to understand your audience reach.
          </p>
        </div>

        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <MousePointer className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">conversion tracking</h3>
          <p className="text-gray-400 text-sm">
            see which products get the most clicks and track your sales conversion rates.
          </p>
        </div>

        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <Users className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">audience insights</h3>
          <p className="text-gray-400 text-sm">
            understand where your visitors come from - instagram, tiktok, direct links, and more.
          </p>
        </div>

        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <DollarSign className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">revenue analytics</h3>
          <p className="text-gray-400 text-sm">
            detailed revenue tracking, top-performing products, and growth trends over time.
          </p>
        </div>
      </div>
    </div>
  );
}