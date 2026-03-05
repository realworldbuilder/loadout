'use client';

import { Calendar as CalendarIcon, Clock, Users, Video } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">content calendar</h1>
        <p className="text-gray-400">plan and schedule your content strategy</p>
      </div>

      {/* Coming Soon Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Feature Preview */}
        <div className="lg:col-span-2 bg-[#111] rounded-lg border border-white/5 p-8 text-center">
          <CalendarIcon className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">content calendar — launching soon</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            plan, schedule, and track all your content across social platforms. never miss a post and keep your audience engaged with consistent content.
          </p>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-400 text-sm max-w-md mx-auto">
            coming in the next update
          </div>
        </div>

        {/* Feature Cards */}
        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <CalendarIcon className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">content scheduling</h3>
          <p className="text-gray-400 text-sm">
            plan posts weeks in advance across instagram, tiktok, twitter, and youtube. visualize your content strategy at a glance.
          </p>
        </div>

        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <Clock className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">optimal timing</h3>
          <p className="text-gray-400 text-sm">
            ai suggests the best times to post based on your audience engagement patterns for maximum reach.
          </p>
        </div>

        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <Users className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">content themes</h3>
          <p className="text-gray-400 text-sm">
            organize content by themes like workout tips, nutrition advice, motivation, and product promotions.
          </p>
        </div>

        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <Video className="h-10 w-10 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">multi-format planning</h3>
          <p className="text-gray-400 text-sm">
            plan posts, stories, reels, and long-form content all in one place. adapt content for each platform.
          </p>
        </div>
      </div>
    </div>
  );
}