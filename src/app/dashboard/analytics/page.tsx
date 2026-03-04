export const dynamic = "force-dynamic";
'use client';

import { useState, useMemo } from 'react';
import { Eye, Users, MousePointer, TrendingUp, DollarSign, Globe } from 'lucide-react';
import BarChart from '@/components/dashboard/BarChart';

// Demo data - in real app, this would come from Supabase
const generateDemoData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * 500) + 100,
      uniqueVisitors: Math.floor(Math.random() * 300) + 50,
      linkClicks: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 1000) + 100,
    });
  }
  
  return data;
};

const trafficSources = [
  { name: 'direct', visits: 2840, color: '#10a37f' },
  { name: 'instagram', visits: 1920, color: '#e1306c' },
  { name: 'tiktok', visits: 1450, color: '#ff0050' },
  { name: 'twitter', visits: 920, color: '#1da1f2' },
  { name: 'other', visits: 780, color: '#6b7280' },
];

const topProducts = [
  { name: '12-week transformation', views: 1240, sales: 23, revenue: 2300, conversion: 1.85 },
  { name: 'nutrition masterclass', views: 890, sales: 34, revenue: 1700, conversion: 3.82 },
  { name: 'home workout guide', views: 2100, sales: 18, revenue: 900, conversion: 0.86 },
  { name: 'mindset coaching', views: 650, sales: 12, revenue: 1800, conversion: 1.85 },
  { name: 'meal prep templates', views: 1800, sales: 45, revenue: 675, conversion: 2.50 },
];

const countries = [
  { name: 'united states', flag: '🇺🇸', visitors: 3200 },
  { name: 'canada', flag: '🇨🇦', visitors: 890 },
  { name: 'united kingdom', flag: '🇬🇧', visitors: 650 },
  { name: 'australia', flag: '🇦🇺', visitors: 420 },
  { name: 'germany', flag: '🇩🇪', visitors: 380 },
];

type TimePeriod = '7d' | '30d' | '90d' | 'all';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d');
  
  const demoData = useMemo(() => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365;
    return generateDemoData(days);
  }, [selectedPeriod]);
  
  const metrics = useMemo(() => {
    const totalPageViews = demoData.reduce((sum, day) => sum + day.pageViews, 0);
    const totalUniqueVisitors = demoData.reduce((sum, day) => sum + day.uniqueVisitors, 0);
    const totalLinkClicks = demoData.reduce((sum, day) => sum + day.linkClicks, 0);
    const totalRevenue = demoData.reduce((sum, day) => sum + day.revenue, 0);
    const conversionRate = totalPageViews > 0 ? (totalLinkClicks / totalPageViews) * 100 : 0;
    
    return {
      pageViews: totalPageViews,
      uniqueVisitors: totalUniqueVisitors,
      linkClicks: totalLinkClicks,
      conversionRate: conversionRate,
      revenue: totalRevenue,
    };
  }, [demoData]);
  
  const revenueChartData = useMemo(() => {
    const displayDays = selectedPeriod === '7d' ? 7 : 30;
    return demoData.slice(-displayDays).map((day, index) => ({
      label: selectedPeriod === '7d' 
        ? new Date(day.date).toLocaleDateString('en', { weekday: 'short' })
        : `${new Date(day.date).getDate()}`,
      value: day.revenue,
      color: '#10a37f'
    }));
  }, [demoData, selectedPeriod]);

  const periods = [
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: 'all time', value: 'all' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">analytics</h1>
            <p className="text-gray-400">track your performance and growth</p>
          </div>
          
          {/* Time period selector */}
          <div className="flex bg-[#111] rounded-lg border border-white/5 overflow-hidden">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as TimePeriod)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-[#10a37f] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">page views</p>
                <p className="text-2xl font-bold text-white">{metrics.pageViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-[#10a37f]" />
            </div>
          </div>
          
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">unique visitors</p>
                <p className="text-2xl font-bold text-white">{metrics.uniqueVisitors.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-[#10a37f]" />
            </div>
          </div>
          
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">link clicks</p>
                <p className="text-2xl font-bold text-white">{metrics.linkClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="h-8 w-8 text-[#10a37f]" />
            </div>
          </div>
          
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">conversion rate</p>
                <p className="text-2xl font-bold text-white">{metrics.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#10a37f]" />
            </div>
          </div>
          
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">revenue</p>
                <p className="text-2xl font-bold text-white">${metrics.revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-[#10a37f]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              revenue over last {selectedPeriod === '7d' ? '7 days' : '30 days'}
            </h3>
            <BarChart data={revenueChartData} height={250} />
          </div>
          
          {/* Traffic Sources */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">traffic sources</h3>
            <div className="space-y-4">
              {trafficSources.map((source) => {
                const maxVisits = Math.max(...trafficSources.map(s => s.visits));
                const percentage = (source.visits / maxVisits) * 100;
                
                return (
                  <div key={source.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-gray-300 text-sm w-16">{source.name}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: source.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-white font-medium text-sm ml-4">
                      {source.visits.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Products */}
          <div className="lg:col-span-2 bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">top products by revenue</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm font-medium pb-3">product</th>
                    <th className="text-right text-gray-400 text-sm font-medium pb-3">views</th>
                    <th className="text-right text-gray-400 text-sm font-medium pb-3">sales</th>
                    <th className="text-right text-gray-400 text-sm font-medium pb-3">revenue</th>
                    <th className="text-right text-gray-400 text-sm font-medium pb-3">cvr</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-gray-800/50">
                      <td className="py-3">
                        <span className="text-white text-sm">{product.name}</span>
                      </td>
                      <td className="text-right py-3">
                        <span className="text-gray-300 text-sm">{product.views.toLocaleString()}</span>
                      </td>
                      <td className="text-right py-3">
                        <span className="text-gray-300 text-sm">{product.sales}</span>
                      </td>
                      <td className="text-right py-3">
                        <span className="text-white text-sm font-medium">${product.revenue.toLocaleString()}</span>
                      </td>
                      <td className="text-right py-3">
                        <span className="text-[#10a37f] text-sm font-medium">{product.conversion}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Geographic Breakdown */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">top countries</h3>
            <div className="space-y-4">
              {countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="text-gray-300 text-sm">{country.name}</span>
                  </div>
                  <span className="text-white font-medium text-sm">
                    {country.visitors.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Powered by badge */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 px-4 py-2 bg-[#111] rounded-lg border border-white/5">
            <Globe className="h-4 w-4 text-[#10a37f]" />
            <span className="text-gray-400 text-sm">powered by gymsignal intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
}