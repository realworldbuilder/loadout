'use client';

import Link from 'next/link';
import { 
  ArrowRight,
  Check,
  X,
  Zap,
  BarChart3,
  Package,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react';

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
              <Link href="/demo" className="text-sm text-gray-500 hover:text-white transition-colors px-3 py-1.5 hidden sm:block">
                examples
              </Link>
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

      {/* ========== HERO ========== */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            the storefront for fitness creators
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
            turn followers
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              into customers.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            sell workout plans, coaching, and digital products from a clean link-in-bio page built for the gym.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
            <Link href="/signup" className="group flex items-center gap-2 bg-white text-black font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all text-base">
              create your loadout
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="/demo" className="flex items-center gap-2 text-gray-400 font-medium px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:text-white transition-all text-base">
              see example loadouts
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              free to start
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              live in 5 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              built for the gym
            </span>
          </div>
        </div>
      </section>

      {/* ========== MOCKUP ========== */}
      <section className="pb-24 px-6">
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
              {['IG', 'TK', 'YT', 'X'].map((s) => (
                <div key={s} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-500 text-[10px] font-mono">
                  {s}
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-gray-600 mt-4 font-mono">loadout.fit/@fitcreator</p>
          </div>
        </div>
      </section>

      {/* ========== FEATURES — CREATOR LANGUAGE ========== */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              everything a fitness creator
              <br />
              <span className="text-gray-500">needs to monetize.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sell Programs */}
            <div className="bg-[#111] rounded-2xl border border-white/5 p-8 hover:border-emerald-500/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <Package className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">sell programs</h3>
              <p className="text-gray-400 leading-relaxed">
                upload workout plans, coaching packages, meal plans, or digital products. get paid instantly. no middleman.
              </p>
            </div>

            {/* Creator Link Page */}
            <div className="bg-[#111] rounded-2xl border border-white/5 p-8 hover:border-emerald-500/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <LinkIcon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">creator link page</h3>
              <p className="text-gray-400 leading-relaxed">
                one clean page for everything. instagram bio → storefront. no more linktree + payhip + google sites.
              </p>
            </div>

            {/* Built for Fitness */}
            <div className="bg-[#111] rounded-2xl border border-white/5 p-8 hover:border-emerald-500/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <Zap className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">built for fitness</h3>
              <p className="text-gray-400 leading-relaxed">
                workout programs, splits, PDFs, coaching — not generic digital products. we speak your language.
              </p>
            </div>

            {/* Creator Analytics */}
            <div className="bg-[#111] rounded-2xl border border-white/5 p-8 hover:border-emerald-500/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <BarChart3 className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">creator analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                see what sells. track clicks, conversions, and revenue. know which content drives purchases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF / NICHE POSITIONING ========== */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            made for gymfluencers.
            <br />
            <span className="text-gray-500">not generic creators.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
            stan, gumroad, linktree — they serve everyone. we only serve fitness. that&apos;s the difference.
          </p>
          
          {/* Comparison */}
          <div className="bg-[#111] rounded-2xl border border-white/5 p-8 text-left">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div></div>
              <div className="text-center">
                <span className="text-xs font-mono text-gray-600">them</span>
              </div>
              <div className="text-center">
                <span className="text-xs font-mono text-emerald-500">loadout</span>
              </div>
            </div>
            
            {[
              { feature: 'fitness-specific templates', them: false, us: true },
              { feature: 'workout plan builder', them: false, us: true },
              { feature: 'AI product writer', them: false, us: true },
              { feature: 'trend-powered pricing', them: false, us: true },
              { feature: 'coaching calendar', them: false, us: true },
              { feature: 'free tier', them: false, us: true },
              { feature: 'under $20/mo', them: false, us: true },
            ].map((row) => (
              <div key={row.feature} className="grid grid-cols-3 gap-4 py-3 border-t border-white/5">
                <span className="text-sm text-gray-400">{row.feature}</span>
                <div className="text-center">
                  <X className="h-4 w-4 text-red-400/40 mx-auto" />
                </div>
                <div className="text-center">
                  <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== AI TOOLS — ONLY ON LOADOUT ========== */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">only on loadout</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              AI tools that actually get fitness.
            </h2>
            <p className="text-gray-400 text-lg">powered by loadout.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { emoji: '🤖', title: 'AI Product Writer', desc: 'describe your program in 2 sentences. full listing in 10 seconds.' },
              { emoji: '💰', title: 'Trend-Powered Pricing', desc: '"creators in your niche charge $24-34 for shred programs. you\'re undercharging."' },
              { emoji: '🎯', title: 'Smart Promote Alerts', desc: '"cutting season trending 92% — push your shred program NOW"' },
              { emoji: '📐', title: 'Workout Plan Builder', desc: 'drag-and-drop program design. export as PDF or deliver in-app.' },
              { emoji: '📈', title: 'Competitor Intel', desc: 'see what similar creators sell, at what price, and what\'s converting.' },
              { emoji: '🧠', title: 'Content Lab', desc: 'AI generates posts and captions using real-time trend data. not templates.' },
            ].map((f) => (
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
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">simple pricing.</h2>
            <p className="text-gray-400">start free. upgrade when you&apos;re making money.</p>
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
                  'launch your creator page',
                  'sell up to 3 products',
                  'basic analytics',
                  'stripe payments',
                  '5% platform fee',
                  'start monetizing today',
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
                  'workout plan builder',
                  'advanced analytics',
                  'custom themes',
                  'smart promote alerts',
                  'remove loadout branding',
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

          {/* Stan comparison */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              stan.store charges $29/mo with no free tier and no fitness features. just saying.
            </p>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-emerald-400 text-sm font-medium mb-4">your content builds the audience.</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            loadout turns it
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">into revenue.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            free to start. no credit card. your storefront live in 5 minutes.
          </p>
          <Link href="/signup" className="group inline-flex items-center gap-2 bg-white text-black font-semibold px-10 py-4 rounded-xl hover:bg-gray-100 transition-all text-lg">
            create your loadout
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span>🏋️</span>
            <span className="text-sm font-semibold">loadout.fit</span>
            <span className="text-xs text-gray-600">— the storefront for fitness creators.</span>
          </div>
          <p className="text-xs text-gray-600">&copy; 2026 loadout.</p>
        </div>
      </footer>
    </div>
  );
}
