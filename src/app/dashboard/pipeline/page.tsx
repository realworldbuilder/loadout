'use client';

import { TrendingUp, Users, Mail, BarChart3 } from 'lucide-react';

export default function PipelinePage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">sales pipeline</h1>
        <p className="text-gray-400">track leads and customer relationships</p>
      </div>

      {/* Coming Soon Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Feature Preview */}
        <div className="lg:col-span-2 bg-[#111] rounded-lg border border-white/5 p-8 text-center">
          <TrendingUp className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">sales pipeline — launching soon</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            track your leads from first touch to paying customer. manage email outreach, follow-ups, and conversion analytics all in one place.
          </p>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-400 text-sm max-w-md mx-auto">
            coming in the next update
          </div>
        </div>

        {/* Feature Cards */}
        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <Users className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">lead tracking</h3>
          <p className="text-gray-400 text-sm">
            automatically capture leads from your page visitors and track their journey through your sales funnel.
          </p>
        </div>

        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <Mail className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">email sequences</h3>
          <p className="text-gray-400 text-sm">
            set up automated email campaigns and nurture sequences to convert prospects into customers.
          </p>
        </div>

        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <BarChart3 className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">conversion analytics</h3>
          <p className="text-gray-400 text-sm">
            see which touchpoints drive the most conversions and optimize your sales process.
          </p>
        </div>

        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <TrendingUp className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">revenue forecasting</h3>
          <p className="text-gray-400 text-sm">
            predict monthly revenue based on your current pipeline and conversion rates.
          </p>
        </div>
      </div>
    </div>
  );
}