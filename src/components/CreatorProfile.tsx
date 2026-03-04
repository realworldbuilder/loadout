'use client';

import Link from 'next/link';
import { Instagram, Youtube, Twitter, ExternalLink } from 'lucide-react';

// Demo data for preview
const DEMO_CREATORS: Record<string, any> = {
  demo: {
    handle: 'demo',
    display_name: 'Alex Rivera',
    bio: 'online coach · NASM-CPT · helping you get strong without the bs. 12-week programs that actually work.',
    avatar_emoji: '💪',
    followers: '47k',
    social_links: { instagram: 'alexrivera', youtube: '@alexrivera', twitter: 'alexrivera' },
    products: [
      { title: '12-Week Shred Program', desc: 'Complete fat loss program with progressive overload, cardio protocols, and weekly check-in templates.', price: '$29', type: 'PDF', sold: 847 },
      { title: 'Meal Prep Masterclass', desc: '40+ recipes, grocery lists, and macro breakdowns for bulking and cutting.', price: '$19', type: 'PDF', sold: 412 },
      { title: '1:1 Online Coaching', desc: 'Monthly coaching with custom programming, weekly check-ins, and unlimited messaging.', price: '$149/mo', type: 'Coaching', sold: 23 },
      { title: 'Beginner Strength Foundations', desc: '8-week program for complete beginners. Learn the big 5 lifts with video guides.', price: '$14', type: 'PDF', sold: 1203 },
    ],
  },
  fitcreator: {
    handle: 'fitcreator',
    display_name: 'Jordan Chen',
    bio: 'powerlifter · content creator · making strength training accessible for everyone 🏋️',
    avatar_emoji: '🏋️',
    followers: '112k',
    social_links: { instagram: 'jordanchen', tiktok: '@jordanchen' },
    products: [
      { title: 'Powerlifting Peak Program', desc: '16-week peaking cycle for competition prep. RPE-based with auto-regulation.', price: '$39', type: 'PDF', sold: 634 },
      { title: 'Mobility Bible', desc: 'Daily mobility routines for squat, bench, and deadlift. 15 min/day.', price: '$12', type: 'PDF', sold: 2100 },
      { title: 'Form Check Video Review', desc: 'Send me your lifts, get detailed feedback within 48 hours.', price: '$25', type: 'Service', sold: 89 },
    ],
  },
};


export default function CreatorProfile({ handle }: { handle: string }) {
  const creator = DEMO_CREATORS[handle];

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🏋️</p>
          <h1 className="text-2xl font-bold mb-2">@{handle}</h1>
          <p className="text-gray-500 mb-6">this creator hasn&apos;t set up their loadout yet</p>
          <Link href="/" className="text-emerald-400 text-sm hover:underline">
            create your own →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-3xl mx-auto mb-4">
            {creator.avatar_emoji}
          </div>
          <h1 className="text-2xl font-bold">{creator.display_name}</h1>
          <p className="text-sm text-gray-500 mb-3">@{creator.handle} · {creator.followers} followers</p>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">{creator.bio}</p>

          {/* Socials */}
          <div className="flex justify-center gap-3 mt-4">
            {creator.social_links.instagram && (
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Instagram className="h-4 w-4 text-gray-400" />
              </a>
            )}
            {creator.social_links.youtube && (
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Youtube className="h-4 w-4 text-gray-400" />
              </a>
            )}
            {creator.social_links.twitter && (
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter className="h-4 w-4 text-gray-400" />
              </a>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="space-y-3">
          {creator.products.map((p: any, i: number) => (
            <div
              key={i}
              className="bg-[#111] rounded-xl border border-white/5 p-5 hover:border-emerald-500/20 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold group-hover:text-emerald-400 transition-colors">{p.title}</h3>
                <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">{p.price}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{p.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-600">{p.type} · {p.sold.toLocaleString()} sold</span>
                <button className="text-xs font-medium bg-emerald-500 text-black px-4 py-1.5 rounded-lg hover:bg-emerald-400 transition-colors">
                  Get it
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link href="/" className="text-[11px] font-mono text-gray-600 hover:text-emerald-500 transition-colors">
            ⚡ powered by loadout.fit
          </Link>
        </div>
      </div>
    </div>
  );
}
