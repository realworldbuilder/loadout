'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight,
  Check,
  BarChart3,
  Package,
  Code2,
  Heart,
  Palette,
} from 'lucide-react';

export default function HomePage() {
  const [handle, setHandle] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const handleClaimHandle = () => {
    if (!handle.trim()) return;
    setIsChecking(true);
    router.push(`/signup?handle=${encodeURIComponent(handle.toLowerCase().replace(/[^a-z0-9]/g, ''))}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0a]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏋️</span>
              <span className="text-lg font-bold tracking-tight lowercase">loadout</span>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">.fit</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/discover" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-2 lowercase font-medium">
                discover
              </Link>
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2 lowercase">
                log in
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors lowercase">
                get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-2 rounded-full mb-8 lowercase">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            free to start
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight lowercase">
            your fitness brand,
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              one link.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed lowercase">
            sell programs, coaching, and digital products from your own storefront. built for fitness creators.
          </p>
          
          {/* Claim Handle CTA */}
          <div className="max-w-md mx-auto mb-16">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 text-sm pointer-events-none select-none">
                  loadout.fit/
                </span>
                <input
                  type="text"
                  placeholder="yourhandle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleClaimHandle()}
                  className="w-full pl-[120px] pr-4 py-4 bg-[#171717] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <button
                onClick={handleClaimHandle}
                disabled={!handle.trim() || isChecking}
                className="group flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white font-medium px-6 py-4 rounded-lg transition-colors whitespace-nowrap lowercase"
              >
                {isChecking ? 'checking...' : 'claim handle'}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <p className="text-xs text-white/40 mt-3 lowercase">free forever · no credit card required</p>
          </div>
          
          {/* Key Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              live in 5 minutes
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              built for fitness
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              mobile optimized
            </span>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-sm mx-auto">
          <div className="bg-[#171717] rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl">
                💪
              </div>
              <div>
                <h3 className="font-bold text-lg lowercase">@fitcreator</h3>
                <p className="text-sm text-white/60 lowercase">transform your physique</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { name: '12-week shred program', price: '$29' },
                { name: 'meal prep masterclass', price: '$19' },
                { name: '1:1 coaching', price: '$149' },
              ].map((p) => (
                <div key={p.name} className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5 flex justify-between items-center">
                  <span className="font-medium text-sm lowercase">{p.name}</span>
                  <span className="text-emerald-400 font-bold text-sm">{p.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-6">
              {['ig', 'tk', 'yt', 'x'].map((s) => (
                <div key={s} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 text-[10px] font-mono lowercase">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 lowercase">
              everything you need to
              <br />
              <span className="text-white/50">monetize your following.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Page Builder */}
            <div className="bg-[#171717] rounded-xl border border-white/10 p-6 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors lowercase">page builder</h3>
              <p className="text-white/60 text-sm leading-relaxed lowercase">
                drag and drop to build your perfect storefront. custom themes, layouts, and branding.
              </p>
            </div>

            {/* Products */}
            <div className="bg-[#171717] rounded-xl border border-white/10 p-6 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors lowercase">sell products</h3>
              <p className="text-white/60 text-sm leading-relaxed lowercase">
                workout plans, coaching packages, meal plans. upload once, sell unlimited.
              </p>
            </div>

            {/* Codes */}
            <div className="bg-[#171717] rounded-xl border border-white/10 p-6 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors lowercase">discount codes</h3>
              <p className="text-white/60 text-sm leading-relaxed lowercase">
                promote brands you love. share discount codes and earn commissions.
              </p>
            </div>

            {/* Picks */}
            <div className="bg-[#171717] rounded-xl border border-white/10 p-6 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors lowercase">gear picks</h3>
              <p className="text-white/60 text-sm leading-relaxed lowercase">
                curate your favorite supplements, gear, and equipment. earn affiliate revenue.
              </p>
            </div>
          </div>

          {/* Analytics */}
          <div className="mt-6">
            <div className="bg-[#171717] rounded-xl border border-white/10 p-8 text-center">
              <div className="w-16 h-16 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 lowercase">creator analytics</h3>
              <p className="text-white/60 max-w-md mx-auto lowercase">
                track clicks, conversions, and revenue. see what content drives sales and optimize your strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center lowercase">
            why switch to loadout?
          </h2>
          <p className="text-white/60 text-lg mb-12 text-center lowercase">
            you&apos;re probably paying too much for too little.
          </p>
          
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left py-4 px-4 text-white/50 font-medium lowercase"></th>
                  <th className="py-4 px-4 text-emerald-400 font-bold lowercase">loadout</th>
                  <th className="py-4 px-4 text-white/40 font-medium lowercase">stan store</th>
                  <th className="py-4 px-4 text-white/40 font-medium lowercase">linktree</th>
                </tr>
              </thead>
              <tbody className="text-center">
                <tr className="border-b border-white/5">
                  <td className="text-left py-3 px-4 text-white/70 lowercase">free tier</td>
                  <td className="py-3 px-4 text-emerald-400">✓</td>
                  <td className="py-3 px-4 text-white/30">✗</td>
                  <td className="py-3 px-4 text-white/50">limited</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-left py-3 px-4 text-white/70 lowercase">pro price</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">$19/mo</td>
                  <td className="py-3 px-4 text-white/50">$29/mo</td>
                  <td className="py-3 px-4 text-white/50">$24/mo</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-left py-3 px-4 text-white/70 lowercase">discount codes</td>
                  <td className="py-3 px-4 text-emerald-400">✓ free</td>
                  <td className="py-3 px-4 text-white/30">✗</td>
                  <td className="py-3 px-4 text-white/30">✗</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-left py-3 px-4 text-white/70 lowercase">product picks</td>
                  <td className="py-3 px-4 text-emerald-400">✓ free</td>
                  <td className="py-3 px-4 text-white/30">✗</td>
                  <td className="py-3 px-4 text-white/30">✗</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-left py-3 px-4 text-white/70 lowercase">link-in-bio</td>
                  <td className="py-3 px-4 text-emerald-400">✓ free</td>
                  <td className="py-3 px-4 text-white/50">✓</td>
                  <td className="py-3 px-4 text-white/50">✓</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-left py-3 px-4 text-white/70 lowercase">sell digital products</td>
                  <td className="py-3 px-4 text-emerald-400">✓</td>
                  <td className="py-3 px-4 text-white/50">✓</td>
                  <td className="py-3 px-4 text-white/30">✗</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-left py-3 px-4 text-white/70 lowercase">custom domains</td>
                  <td className="py-3 px-4 text-emerald-400">✓ pro</td>
                  <td className="py-3 px-4 text-white/50">✓ paid</td>
                  <td className="py-3 px-4 text-white/50">✓ paid</td>
                </tr>
                <tr>
                  <td className="text-left py-3 px-4 text-white/70 lowercase">built for fitness</td>
                  <td className="py-3 px-4 text-emerald-400">✓</td>
                  <td className="py-3 px-4 text-white/30">✗</td>
                  <td className="py-3 px-4 text-white/30">✗</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 lowercase">
            ready to monetize
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              your expertise?
            </span>
          </h2>
          <p className="text-white/60 text-lg mb-10 lowercase">
            start for free. no credit card required. your storefront live in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="group inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-4 rounded-lg transition-colors lowercase">
              start for free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 text-white/60 font-medium px-8 py-4 rounded-lg border border-white/10 hover:border-white/20 hover:text-white transition-all lowercase">
              existing creator? log in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span>🏋️</span>
            <span className="text-sm font-semibold lowercase">loadout.fit</span>
            <span className="text-xs text-white/40 lowercase">— the storefront for fitness creators</span>
          </div>
          <p className="text-xs text-white/40">&copy; 2026 loadout</p>
        </div>
      </footer>
    </div>
  );
}