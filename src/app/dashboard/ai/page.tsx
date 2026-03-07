'use client';

import { PenTool, Wand2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AIPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <Sparkles className="h-8 w-8 mr-3 text-emerald-500" />
          ai tools
        </h1>
        <p className="text-gray-400">ai-powered content creation for fitness creators</p>
      </div>

      {/* Main AI Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Writer */}
        <Link href="/dashboard/ai/writer" className="group">
          <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-8 hover:border-emerald-500/20 transition-all duration-200 h-full">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-4">
                <PenTool className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">product writer</h3>
                <p className="text-emerald-400 text-sm">generate compelling product copy</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-emerald-400 transition-colors" />
            </div>
            
            <p className="text-gray-400 mb-6">
              transform your program ideas into professional product listings with compelling titles, descriptions, and pricing suggestions.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                auto-generate product titles and descriptions
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                smart pricing recommendations
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                seo-optimized keywords
              </div>
            </div>
          </div>
        </Link>

        {/* Content Lab */}
        <Link href="/dashboard/ai/content" className="group">
          <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-8 hover:border-emerald-500/20 transition-all duration-200 h-full">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-4">
                <Wand2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">content lab</h3>
                <p className="text-emerald-400 text-sm">create social media content</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-emerald-400 transition-colors" />
            </div>
            
            <p className="text-gray-400 mb-6">
              generate engaging captions, carousel posts, and bio content tailored to your fitness niche and audience.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                instagram & tiktok captions
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                carousel slide builder
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                profile bio generator
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* How It Works */}
      <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-8 mb-12">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">how it works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-400 font-bold">1</span>
            </div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-2">describe your content</h4>
            <p className="text-gray-400 text-sm">tell our ai about your program, style, or content topic</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-400 font-bold">2</span>
            </div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-2">ai generates content</h4>
            <p className="text-gray-400 text-sm">get multiple variations tailored to fitness audiences</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-400 font-bold">3</span>
            </div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-2">copy & customize</h4>
            <p className="text-gray-400 text-sm">edit, personalize, and publish your content</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 rounded-lg border border-emerald-500/10 p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-emerald-400" />
          coming soon
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-emerald-400 font-medium mb-2">video script generator</h4>
            <p className="text-gray-400 text-sm">create scripts for workout videos and educational content</p>
          </div>
          
          <div>
            <h4 className="text-emerald-400 font-medium mb-2">workout builder ai</h4>
            <p className="text-gray-400 text-sm">generate custom workout plans based on client goals</p>
          </div>
          
          <div>
            <h4 className="text-emerald-400 font-medium mb-2">email sequence creator</h4>
            <p className="text-gray-400 text-sm">build automated email campaigns for client nurturing</p>
          </div>
          
          <div>
            <h4 className="text-emerald-400 font-medium mb-2">trend analyzer</h4>
            <p className="text-gray-400 text-sm">discover trending topics in the fitness space</p>
          </div>
        </div>
      </div>
    </div>
  );
}