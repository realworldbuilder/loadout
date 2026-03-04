'use client';

import Link from 'next/link';
import { 
  ArrowRight,
  Check,
  X,
} from 'lucide-react';

const toolComparison = [
  {
    emoji: '🔗',
    tool: 'Link-in-Bio Storefront',
    replaces: 'Linktree + Squarespace',
    replaceCost: '$29',
    loadoutVersion: 'loadout.fit/@you — mobile-first, dark theme, built for gym traffic',
  },
  {
    emoji: '📅',
    tool: 'Coaching Calendar',
    replaces: 'Calendly + Acuity',
    replaceCost: '$15',
    loadoutVersion: 'built for training sessions, not dentist appointments. recurring clients, program phases',
  },
  {
    emoji: '🏋️',
    tool: 'Program Builder',
    replaces: 'Kajabi',
    replaceCost: '$119',
    loadoutVersion: 'AI generates workout programs from a description. periodized blocks, not generic "courses"',
  },
  {
    emoji: '📊',
    tool: 'Audience Intelligence',
    replaces: 'Google Analytics',
    replaceCost: '$10',
    loadoutVersion: 'not just page views — trending topics, optimal posting times, what content drives sales',
  },
  {
    emoji: '💬',
    tool: 'DM Funnels',
    replaces: 'ManyChat',
    replaceCost: '$15',
    loadoutVersion: '"comment SHRED for the link" automation with fitness-specific templates',
  },
  {
    emoji: '📧',
    tool: 'Client Pipeline',
    replaces: 'ConvertKit + Mailchimp',
    replaceCost: '$29',
    loadoutVersion: 'not a newsletter — a sales funnel. free PDF → email sequence → coaching upsell',
  },
  {
    emoji: '🎨',
    tool: 'AI Content Lab',
    replaces: 'Canva Pro + Later',
    replaceCost: '$30',
    loadoutVersion: 'AI generates posts, carousels, and captions using real-time trend data. not static templates.',
  },
  {
    emoji: '🤝',
    tool: 'Engagement Pods',
    replaces: 'Facebook Groups',
    replaceCost: '$97',
    loadoutVersion: 'matchmade by niche + follower count. accountability tracking. not random DM groups.',
  },
  {
    emoji: '🤖',
    tool: 'AI Growth Coach',
    replaces: '1:1 Strategy Coaching',
    replaceCost: '$99',
    loadoutVersion: 'AI analyzes your content performance and tells you exactly what to do next. 24/7.',
  },
];

const totalReplaceCost = toolComparison.reduce((a, t) => a + parseInt(t.replaceCost.replace('$', '')), 0);

const onlyOnLoadout = [
  { emoji: '🤖', title: 'AI Product Writer', desc: 'describe your program in 2 sentences → full listing in 10 seconds' },
  { emoji: '💰', title: 'Trend-Powered Pricing', desc: '"creators in your niche charge $24-34 for shred programs. you\'re undercharging."' },
  { emoji: '🎯', title: 'Smart Promote Alerts', desc: '"cutting season trending 92% — push your shred program NOW"' },
  { emoji: '📐', title: 'Workout Plan Builder', desc: 'drag-and-drop program design. export as PDF or deliver in-app via M2M' },
  { emoji: '📈', title: 'Competitor Intel', desc: 'see what similar creators sell, at what price, and what\'s working' },
  { emoji: '🧠', title: 'M2M Voice Delivery', desc: 'clients get your programs delivered to their wrist. train by voice, not screenshots' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0a]/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏋️</span>
              <span className="text-lg font-bold tracking-tight">loadout</span>
              <span className="text-[10px] font-mono text-emerald-500 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">.fit</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
                log in
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-white text-black px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            powered by gymsignal intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            rack your content.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              sell your plans.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            the all-in-one creator OS for fitness. 
            storefront, AI tools, coaching calendar, content lab, analytics — 
            all in one place. built for people who live in the gym.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
            <Link href="/signup" className="group flex items-center gap-2 bg-white text-black font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all text-base">
              build your loadout
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="/loadout/demo" className="flex items-center gap-2 text-gray-400 font-medium px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:text-white transition-all text-base">
              see example loadouts
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              free tier available
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              5% platform fee
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              ai-powered everything
            </span>
          </div>
        </div>
      </section>

      {/* Mockup preview */}
      <section className="pb-20 px-6">
        <div className="max-w-md mx-auto">
          <div className="bg-[#111] rounded-2xl border border-white/10 p-6 shadow-2xl shadow-emerald-500/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl">
                💪
              </div>
              <div>
                <h3 className="font-bold text-lg">@fitcreator</h3>
                <p className="text-sm text-gray-400">online coach · 47k followers</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { name: '12-Week Shred Program', meta: 'PDF · 847 sold', price: '$29' },
                { name: 'Meal Prep Masterclass', meta: 'PDF · 412 sold', price: '$19' },
                { name: '1:1 Coaching (Monthly)', meta: 'coaching · 23 active', price: '$149' },
              ].map((p) => (
                <div key={p.name} className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.meta}</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">{p.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-6">
              {['I', 'T', 'Y', 'X'].map((s) => (
                <div key={s} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-500 text-xs font-mono">
                  {s}
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-gray-600 mt-4 font-mono">loadout.fit/@fitcreator</p>
          </div>
        </div>
      </section>

      {/* ========== REPLACES SECTION ========== */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              stop paying for 9 different tools
            </h2>
            <p className="text-gray-400 text-lg">loadout replaces your entire stack — and it actually knows fitness.</p>
          </div>

          {/* Tool comparison list */}
          <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            {toolComparison.map((tool, i) => (
              <div
                key={tool.tool}
                className={`p-5 ${i !== toolComparison.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/[0.02] transition-colors`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0 mt-0.5">{tool.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white">{tool.tool}</h3>
                      <span className="text-red-400/60 text-sm font-mono line-through shrink-0 ml-2">{tool.replaceCost}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      replaces <span className="text-gray-500">{tool.replaces}</span>
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed">{tool.loadoutVersion}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="p-5 bg-[#0a0a0a] border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-400" />
                  <span className="text-gray-500">what you&apos;d spend otherwise</span>
                </div>
                <span className="text-red-400 font-bold text-lg font-mono">${totalReplaceCost}/mo</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏋️</span>
                  <span className="font-bold text-white text-lg">loadout pro</span>
                </div>
                <span className="text-emerald-400 font-bold text-2xl">$19/mo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ONLY ON LOADOUT ========== */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">loadout exclusive</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              built different
            </h2>
            <p className="text-gray-400 text-lg">generic creator tools don&apos;t understand the gym. we do.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onlyOnLoadout.map((f) => (
              <div key={f.title} className="bg-[#111] rounded-xl border border-white/5 p-6 hover:border-emerald-500/20 transition-colors">
                <span className="text-2xl mb-3 block">{f.emoji}</span>
                <h3 className="font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">simple pricing</h2>
            <p className="text-gray-400">start free. scale when you're ready.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-[#111] rounded-xl border border-white/5 p-7">
              <div className="mb-6">
                <h3 className="text-base font-semibold mb-1 text-gray-400">starter</h3>
                <div className="text-4xl font-bold">$0</div>
                <p className="text-sm text-gray-600 mt-1">forever free</p>
              </div>
              
              <ul className="space-y-2.5 mb-8 text-sm">
                {[
                  'custom @handle page',
                  'up to 3 products',
                  'basic analytics',
                  'stripe payments',
                  '5% platform fee',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-400">
                    <Check className="h-3.5 w-3.5 text-emerald-500/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link href="/signup" className="block text-center text-sm font-medium py-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors">
                start free
              </Link>
            </div>
            
            {/* Pro */}
            <div className="bg-[#111] rounded-xl border border-emerald-500/30 p-7 relative">
              <div className="absolute -top-3 left-6">
                <span className="bg-emerald-500 text-black text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  pro
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-base font-semibold mb-1 text-white">creator pro</h3>
                <div className="text-4xl font-bold">
                  $19
                  <span className="text-base font-normal text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">the full loadout</p>
              </div>
              
              <ul className="space-y-2.5 mb-8 text-sm">
                {[
                  'everything in starter',
                  'unlimited products',
                  'AI product writer',
                  'AI content lab',
                  'coaching calendar',
                  'DM funnels',
                  'client pipeline (email)',
                  'engagement pods',
                  'advanced analytics',
                  'custom themes',
                  'remove branding',
                  'smart promote alerts',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link href="/signup?plan=pro" className="block text-center text-sm font-semibold py-2.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors">
                start pro trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem callout */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-4">part of the ecosystem</p>
          <div className="flex items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
              <span className="text-lg">📡</span>
              <span className="text-sm font-medium">GymSignal</span>
              <span className="text-[10px] text-gray-600">algo intel</span>
            </div>
            <div className="text-gray-700">·</div>
            <div className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
              <span className="text-lg">🧠</span>
              <span className="text-sm font-medium">Mind2Muscle</span>
              <span className="text-[10px] text-gray-600">voice training</span>
            </div>
            <div className="text-gray-700">·</div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-lg">🏋️</span>
              <span className="text-sm font-medium">Loadout</span>
              <span className="text-[10px] text-emerald-500">creator OS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            ready to build your loadout?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            free to start. no credit card. your storefront live in 5 minutes.
          </p>
          <Link href="/signup" className="group inline-flex items-center gap-2 bg-white text-black font-semibold px-10 py-4 rounded-xl hover:bg-gray-100 transition-all text-lg">
            get started free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span>🏋️</span>
            <span className="text-sm font-semibold">loadout.fit</span>
          </div>
          <p className="text-xs text-gray-600">&copy; 2026 loadout. part of the gymsignal ecosystem.</p>
        </div>
      </footer>
    </div>
  );
}
