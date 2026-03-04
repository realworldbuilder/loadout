'use client';

import Link from 'next/link';
import { 
  ArrowRight,
  Check,
} from 'lucide-react';

const features = [
  {
    emoji: '🔗',
    title: 'link-in-bio',
    desc: 'loadout.fit/@you — one link for everything. optimized for ig and tiktok traffic.',
  },
  {
    emoji: '💰',
    title: 'sell anything',
    desc: 'workout plans, meal preps, coaching templates, training programs. instant delivery.',
  },
  {
    emoji: '⚡',
    title: 'instant payouts',
    desc: 'stripe-powered checkout. money hits your account same day. no invoicing bs.',
  },
  {
    emoji: '📊',
    title: 'know your numbers',
    desc: 'see who clicks, what sells, where traffic comes from. powered by gymsignal intel.',
  },
  {
    emoji: '🎨',
    title: 'your brand, your page',
    desc: 'custom colors, layout, and style. no generic templates. looks like you built it.',
  },
  {
    emoji: '🤖',
    title: 'ai-powered',
    desc: 'gymsignal tells you what to post and when. loadout is where you send them to buy.',
  },
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
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
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
            the all-in-one storefront for fitness creators. 
            link-in-bio, digital products, instant payments. 
            built for people who live in the gym.
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
              free to start
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              5% platform fee
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              instant payouts
            </span>
          </div>
        </div>
      </section>

      {/* Mockup preview */}
      <section className="pb-20 px-6">
        <div className="max-w-md mx-auto">
          <div className="bg-[#111] rounded-2xl border border-white/10 p-6 shadow-2xl shadow-emerald-500/5">
            {/* Fake profile card */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl">
                💪
              </div>
              <div>
                <h3 className="font-bold text-lg">@fitcreator</h3>
                <p className="text-sm text-gray-400">online coach · 47k followers</p>
              </div>
            </div>
            
            {/* Fake product cards */}
            <div className="space-y-3">
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">12-Week Shred Program</p>
                  <p className="text-xs text-gray-500">PDF · 847 sold</p>
                </div>
                <span className="text-emerald-400 font-bold text-sm">$29</span>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">Meal Prep Masterclass</p>
                  <p className="text-xs text-gray-500">PDF · 412 sold</p>
                </div>
                <span className="text-emerald-400 font-bold text-sm">$19</span>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">1:1 Coaching (Monthly)</p>
                  <p className="text-xs text-gray-500">coaching · 23 active</p>
                </div>
                <span className="text-emerald-400 font-bold text-sm">$149</span>
              </div>
            </div>

            {/* Fake social links */}
            <div className="flex justify-center gap-3 mt-6">
              {['instagram', 'tiktok', 'youtube', 'twitter'].map((s) => (
                <div key={s} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-500 text-xs font-mono">
                  {s[0].toUpperCase()}
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-gray-600 mt-4 font-mono">loadout.fit/@fitcreator</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">everything you need to get paid</h2>
            <p className="text-gray-400 text-lg">no code. no hassle. just your content and a checkout button.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-[#111] rounded-xl border border-white/5 p-6 hover:border-emerald-500/20 transition-colors">
                <span className="text-2xl mb-3 block">{f.emoji}</span>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">simple pricing</h2>
            <p className="text-gray-400">start free. upgrade when you need more.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="bg-[#111] rounded-xl border border-white/5 p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1 text-gray-300">starter</h3>
                <div className="text-4xl font-bold">$0</div>
                <p className="text-sm text-gray-500 mt-1">forever free</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm">
                {['custom @handle page', 'up to 3 products', 'basic analytics', '5% + stripe fees'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link href="/signup" className="block text-center text-sm font-medium py-2.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors">
                start free
              </Link>
            </div>
            
            {/* Pro */}
            <div className="bg-[#111] rounded-xl border border-emerald-500/30 p-8 relative">
              <div className="absolute -top-3 left-6">
                <span className="bg-emerald-500 text-black text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  pro
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1 text-white">creator pro</h3>
                <div className="text-4xl font-bold">
                  $9.99
                  <span className="text-base font-normal text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">for serious creators</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm">
                {[
                  'everything in starter',
                  'unlimited products', 
                  'custom themes & colors',
                  'advanced analytics',
                  'remove loadout branding',
                  'priority support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
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
              <span className="text-[10px] text-emerald-500">storefronts</span>
            </div>
          </div>
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
