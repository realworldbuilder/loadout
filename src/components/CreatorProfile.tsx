'use client';

import Link from 'next/link';
import { Instagram, Youtube, Twitter } from 'lucide-react';

// Database types
interface DBCreator {
  id: string;
  handle: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  social_links?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
}

interface DBProduct {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  price: number;
  product_type: string;
  external_url?: string;
  file_url?: string;
  thumbnail_url?: string;
  cta_text?: string;
  is_active: boolean;
  sort_order: number;
}

// Demo loadouts — different creator archetypes
const DEMO_CREATORS: Record<string, any> = {
  demo: {
    handle: 'demo',
    display_name: 'Choose a Loadout',
    bio: null,
    isDirectory: true,
  },
  alexrivera: {
    handle: 'alexrivera',
    display_name: 'Alex Rivera',
    bio: 'online coach · NASM-CPT · helping you get strong without the bs',
    avatar_emoji: '💪',
    followers: '47k',
    tag: 'online coach',
    color: 'from-emerald-400 to-teal-600',
    social_links: { instagram: true, youtube: true, twitter: true },
    products: [
      { title: '12-Week Shred Program', desc: 'Complete fat loss program with progressive overload, cardio protocols, and weekly check-in templates.', price: '$29', type: 'PDF', sold: 847, emoji: '🔥' },
      { title: 'Meal Prep Masterclass', desc: '40+ recipes, grocery lists, and macro breakdowns for bulking and cutting.', price: '$19', type: 'PDF', sold: 412, emoji: '🥗' },
      { title: '1:1 Online Coaching', desc: 'Monthly coaching with custom programming, weekly check-ins, and unlimited messaging.', price: '$149/mo', type: 'Coaching', sold: 23, emoji: '🎯' },
      { title: 'Beginner Strength Foundations', desc: '8-week program for complete beginners. Learn the big 5 lifts with video guides.', price: '$14', type: 'PDF', sold: 1203, emoji: '🏗️' },
    ],
  },
  mayafit: {
    handle: 'mayafit',
    display_name: 'Maya Thompson',
    bio: 'glute queen 🍑 · certified PT · my programs have built 10,000+ booties',
    avatar_emoji: '🍑',
    followers: '234k',
    tag: 'glute specialist',
    color: 'from-pink-400 to-rose-600',
    social_links: { instagram: true, youtube: true },
    products: [
      { title: 'Grow Your Glutes Program', desc: '12-week progressive program targeting all 3 glute muscles. Home + gym versions included.', price: '$34', type: 'PDF', sold: 4200, emoji: '🍑' },
      { title: 'Booty Band Starter Pack', desc: '30-day at-home program using only resistance bands. Perfect for beginners or travel.', price: '$12', type: 'PDF', sold: 8900, emoji: '🏠' },
      { title: 'Monthly Workout Calendar', desc: 'New workouts every month. Full body focus with glute emphasis. Video demos included.', price: '$9.99/mo', type: 'Subscription', sold: 670, emoji: '📅' },
      { title: 'Macro Calculator + Guide', desc: 'Custom macro calculator spreadsheet with full nutrition guide for body recomp.', price: '$7', type: 'Spreadsheet', sold: 3100, emoji: '📊' },
      { title: 'VIP Coaching (3 months)', desc: 'Personalized programming, weekly video check-ins, nutrition coaching, and 24/7 DM access.', price: '$297', type: 'Coaching', sold: 45, emoji: '👑' },
    ],
  },
  ironmike: {
    handle: 'ironmike',
    display_name: 'Mike Castellano',
    bio: 'powerlifter · 600/405/650 · raw w/ wraps · making you strong as hell since 2019',
    avatar_emoji: '🦍',
    followers: '89k',
    tag: 'powerlifting',
    color: 'from-red-500 to-orange-600',
    social_links: { instagram: true, youtube: true, twitter: true },
    products: [
      { title: 'Conjugate Method Simplified', desc: 'The Westside system broken down for regular humans. Max effort, dynamic effort, accessory templates.', price: '$44', type: 'PDF', sold: 1890, emoji: '⚡' },
      { title: '16-Week Meet Prep', desc: 'Peak for competition. RPE-based with attempt selection strategy and water cut protocol.', price: '$39', type: 'PDF', sold: 634, emoji: '🏆' },
      { title: 'Form Check Video Review', desc: 'Send me your squat, bench, or deadlift. 5-10 min detailed video breakdown within 48hrs.', price: '$25', type: 'Service', sold: 312, emoji: '📹' },
      { title: 'Deadlift Domination', desc: '8-week deadlift specialization block. Added 40lbs to my pull. Will add to yours.', price: '$24', type: 'PDF', sold: 2700, emoji: '💀' },
    ],
  },
  zenlifts: {
    handle: 'zenlifts',
    display_name: 'Priya Sharma',
    bio: 'yoga × strength · RYT-500 · proving you can be flexible AND strong · mind-muscle connection is real',
    avatar_emoji: '🧘',
    followers: '156k',
    tag: 'yoga + strength',
    color: 'from-purple-400 to-violet-600',
    social_links: { instagram: true, youtube: true },
    products: [
      { title: 'Yoga for Lifters', desc: '20-minute flows designed specifically for people who lift. Fix your squat depth, bench arch, and deadlift setup.', price: '$19', type: 'PDF + Video', sold: 5600, emoji: '🧘' },
      { title: 'Strength + Flow Hybrid Program', desc: '3 lifting days + 2 yoga days per week. 12 weeks. The best of both worlds.', price: '$29', type: 'PDF', sold: 1800, emoji: '☯️' },
      { title: 'Morning Mobility Routine', desc: '10-minute daily routine. Follow along video. Zero equipment. Do it before your coffee.', price: '$9', type: 'Video Series', sold: 9200, emoji: '🌅' },
      { title: 'Breathwork for Performance', desc: 'Breathing techniques for max effort lifts, recovery, and stress. Nasal breathing protocols included.', price: '$14', type: 'PDF + Audio', sold: 2300, emoji: '🌬️' },
      { title: 'Private Yoga Session (Virtual)', desc: '60-min 1:1 session focused on your specific mobility issues and goals.', price: '$75', type: 'Service', sold: 120, emoji: '💎' },
    ],
  },
  coachdre: {
    handle: 'coachdre',
    display_name: 'Dre Williams',
    bio: 'CSCS · former D1 athlete · athletic performance coach · speed kills 💨',
    avatar_emoji: '⚡',
    followers: '67k',
    tag: 'athletic performance',
    color: 'from-yellow-400 to-amber-600',
    social_links: { instagram: true, twitter: true },
    products: [
      { title: 'Vertical Jump Bible', desc: 'Add 4-8 inches to your vert in 12 weeks. Plyometrics, strength work, and jump mechanics.', price: '$34', type: 'PDF', sold: 3400, emoji: '🚀' },
      { title: 'Speed & Agility Program', desc: '8-week sprint mechanics and COD training. Used by actual college athletes.', price: '$29', type: 'PDF + Video', sold: 1900, emoji: '💨' },
      { title: 'Athlete Meal Plan Template', desc: 'Customizable meal plan for high school and college athletes. Bulking and cutting versions.', price: '$14', type: 'Spreadsheet', sold: 4100, emoji: '🍗' },
      { title: 'Virtual Speed Assessment', desc: 'Film your sprint. I analyze mechanics and give you a personalized drill program.', price: '$45', type: 'Service', sold: 89, emoji: '📹' },
    ],
  },
  macrosbymel: {
    handle: 'macrosbymel',
    display_name: 'Mel Garcia',
    bio: 'registered dietitian · macro coach · ate 2800cal today and still have abs · food freedom advocate',
    avatar_emoji: '🥑',
    followers: '198k',
    tag: 'nutrition coach',
    color: 'from-green-400 to-lime-600',
    social_links: { instagram: true, youtube: true, twitter: true },
    products: [
      { title: 'Macro Mastery Course', desc: 'Learn to count macros without losing your mind. 6-module video course with worksheets.', price: '$49', type: 'Course', sold: 2800, emoji: '🎓' },
      { title: 'High Protein Recipe Book', desc: '100+ recipes all 30g+ protein. Breakfast, lunch, dinner, snacks, desserts. Macro breakdowns for each.', price: '$24', type: 'PDF', sold: 7600, emoji: '📖' },
      { title: 'Reverse Diet Protocol', desc: 'Stop yo-yo dieting. Step-by-step guide to increasing calories without gaining fat.', price: '$19', type: 'PDF', sold: 3200, emoji: '📈' },
      { title: '1:1 Nutrition Coaching', desc: 'Fully customized macro plan, weekly adjustments, and unlimited support. Minimum 3 month commitment.', price: '$199/mo', type: 'Coaching', sold: 34, emoji: '🏅' },
      { title: 'Grocery Store Guide', desc: 'My exact shopping list for a week of macro-friendly meals. Budget and bougie versions.', price: '$5', type: 'PDF', sold: 12400, emoji: '🛒' },
    ],
  },
  aline_tdn: {
    handle: 'aline_tdn',
    display_name: 'Aline Taddonio',
    bio: 'mom · fitness & nutrition coach · creator of BBFIT · helping women stop starting over 💪',
    avatar_emoji: '✨',
    followers: '~10k',
    tag: "women's fitness",
    color: 'from-fuchsia-400 to-pink-600',
    social_links: { instagram: true },
    products: [
      { title: 'BBFIT Digital Program', desc: 'Complete fitness and nutrition program designed for busy moms. Simple, high-protein strategies that actually fit into real life.', price: '$49', type: 'Program', sold: 0, emoji: '🔥' },
      { title: 'High-Protein Meal Guide', desc: 'Easy meal prep strategies, grocery lists, and recipes for women who dont have time to overthink food.', price: '$24', type: 'PDF', sold: 0, emoji: '🥗' },
      { title: 'Free 10-Min 1:1 Consult', desc: 'Book a quick call with me to talk about your goals. No pressure, just real advice from someone who gets it.', price: 'Free', type: 'Booking', sold: 0, emoji: '📞' },
      { title: '1st Phorm Supplements', desc: 'The supplements I actually use and recommend. Elevate your nutrition game 💪', price: 'Affiliate', type: 'Link', sold: 0, emoji: '💊', link: 'https://1stphorm.com/Aline_tdn' },
      { title: 'SqueezMeSkinny Waist Trainer', desc: 'Everyday waist trainer I wear during workouts. Use code "ALINE" for a discount.', price: 'Code: ALINE', type: 'Link', sold: 0, emoji: '💋', link: 'https://squeezmeskinny.com/?aff=1885' },
      { title: 'My Amazon Recommendations', desc: 'Fitness gear, kitchen essentials, and mom life must-haves I swear by.', price: 'Shop', type: 'Link', sold: 0, emoji: '🛒' },
      { title: 'Glute Lab Classes — Ft. Lauderdale', desc: 'Book in-person glute lab classes at our Fort Lauderdale location.', price: 'Book', type: 'Link', sold: 0, emoji: '🍑', link: 'https://apps.apple.com/us/app/glute-lab-fort-lauderdale/id6752358317' },
    ],
  },
};

// Directory of all demo creators
const DEMO_LIST = Object.entries(DEMO_CREATORS)
  .filter(([k, v]) => !v.isDirectory)
  .map(([k, v]) => v);

interface CreatorProfileProps {
  handle: string;
  dbData?: {
    creator: DBCreator;
    products: DBProduct[];
  } | null;
}

export default function CreatorProfile({ handle, dbData }: CreatorProfileProps) {
  // If we have database data, use it; otherwise fall back to demo data
  const isFromDB = dbData !== null && dbData !== undefined;
  const creator = isFromDB ? dbData?.creator : DEMO_CREATORS[handle];
  const products = isFromDB ? dbData?.products || [] : creator?.products || [];

  // Demo directory page
  if (handle === 'demo') {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 text-gray-500 hover:text-white transition-colors text-sm">
              ← back to loadout
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              example loadouts
            </h1>
            <p className="text-gray-400 text-lg">
              see what different fitness creators can build
            </p>
          </div>

          {/* Creator cards */}
          <div className="space-y-3">
            {DEMO_LIST.map((c: any) => (
              <Link
                key={c.handle}
                href={`/${c.handle}`}
                className="block bg-[#111] rounded-xl border border-white/5 p-5 hover:border-emerald-500/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl shrink-0`}>
                    {c.avatar_emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold group-hover:text-emerald-400 transition-colors">{c.display_name}</h3>
                      <span className="text-[10px] font-mono bg-white/5 text-gray-500 px-2 py-0.5 rounded-full">{c.tag}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{c.bio}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] font-mono text-gray-600">{c.followers} followers</span>
                      <span className="text-[11px] font-mono text-gray-600">·</span>
                      <span className="text-[11px] font-mono text-emerald-500/70">{c.products.length} products</span>
                      <span className="text-[11px] font-mono text-gray-600">·</span>
                      <span className="text-[11px] font-mono text-gray-600">{c.products.reduce((a: number, p: any) => a + p.sold, 0).toLocaleString()} sold</span>
                    </div>
                  </div>
                  <span className="text-gray-600 group-hover:text-emerald-400 transition-colors text-lg">→</span>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 text-sm mb-4">these are examples. yours will look even better.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm">
              build your loadout →
            </Link>
          </div>

          <div className="text-center mt-8">
            <span className="text-[11px] font-mono text-gray-700">⚡ powered by loadout.fit</span>
          </div>
        </div>
      </div>
    );
  }

  // Creator not found
  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🏋️</p>
          <h1 className="text-2xl font-bold mb-2">@{handle}</h1>
          <p className="text-gray-500 mb-6">this creator hasn&apos;t set up their loadout yet</p>
          <Link href="/demo" className="text-emerald-400 text-sm hover:underline">
            see example loadouts →
          </Link>
        </div>
      </div>
    );
  }

  // Helper functions for data formatting
  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') return price;
    return `$${price}`;
  };

  const getProductEmoji = (productType: string, demoEmoji?: string) => {
    if (demoEmoji) return demoEmoji;
    
    switch (productType) {
      case 'digital_product':
      case 'PDF':
        return '📚';
      case 'coaching':
      case 'Coaching':
        return '🎯';
      case 'affiliate_link':
      case 'Link':
        return '🔗';
      case 'subscription':
      case 'Subscription':
        return '📅';
      default:
        return '📦';
    }
  };

  const getCtaText = (product: any) => {
    if (product.cta_text) return product.cta_text;
    if (product.external_url) return 'Visit';
    if (product.type === 'Link' || product.product_type === 'affiliate_link') return 'Visit';
    if (product.type === 'Booking') return 'Book';
    if (product.price === 'Free') return 'Get free';
    if (!product.external_url && product.product_type === 'digital_product') return 'coming soon';
    return 'Get it';
  };

  const getAvatarDisplay = (creator: any) => {
    if (isFromDB) {
      if (creator.avatar_url) {
        return <img src={creator.avatar_url} alt={creator.display_name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />;
      }
      return <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-3xl mx-auto mb-4">💪</div>;
    }
    return <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${creator.color} flex items-center justify-center text-3xl mx-auto mb-4`}>{creator.avatar_emoji}</div>;
  };

  // Individual creator profile
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Back to demos */}
        <Link href="/demo" className="inline-flex items-center gap-1 text-gray-600 hover:text-white transition-colors text-xs mb-6">
          ← all examples
        </Link>

        {/* Profile header */}
        <div className="text-center mb-8">
          {getAvatarDisplay(creator)}
          <h1 className="text-2xl font-bold">{creator.display_name}</h1>
          <p className="text-sm text-gray-500 mb-1">@{creator.handle}{!isFromDB && creator.followers ? ` · ${creator.followers} followers` : ''}</p>
          {!isFromDB && creator.tag && (
            <span className="inline-block text-[10px] font-mono bg-white/5 text-gray-500 px-2.5 py-0.5 rounded-full mb-3">{creator.tag}</span>
          )}
          {creator.bio && (
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">{creator.bio}</p>
          )}

          {/* Socials */}
          {creator.social_links && (
            <div className="flex justify-center gap-3 mt-4">
              {creator.social_links.instagram && (
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                  <Instagram className="h-4 w-4 text-gray-400" />
                </div>
              )}
              {creator.social_links.youtube && (
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                  <Youtube className="h-4 w-4 text-gray-400" />
                </div>
              )}
              {creator.social_links.twitter && (
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                  <Twitter className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-lg font-bold">{products.length}</p>
            <p className="text-[10px] text-gray-600 font-mono">products</p>
          </div>
          {!isFromDB && (
            <>
              <div className="text-center">
                <p className="text-lg font-bold">{products.reduce((a: number, p: any) => a + (p.sold || 0), 0).toLocaleString()}</p>
                <p className="text-[10px] text-gray-600 font-mono">total sold</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">
                  ${products.reduce((a: number, p: any) => {
                    const price = parseFloat(p.price?.toString().replace(/[^0-9.]/g, '') || '0') || 0;
                    return a + (price * (p.sold || 0));
                  }, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-gray-600 font-mono">est. revenue</p>
              </div>
            </>
          )}
        </div>

        {/* Products */}
        <div className="space-y-3">
          {products.map((p: any, i: number) => {
            const productComponent = (
              <div className="bg-[#111] rounded-xl border border-white/5 p-5 hover:border-emerald-500/20 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getProductEmoji(p.product_type || p.type, p.emoji)}</span>
                    <h3 className="font-semibold group-hover:text-emerald-400 transition-colors">{p.title}</h3>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">{formatPrice(p.price)}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-3 pl-8">{p.description || p.desc}</p>
                <div className="flex items-center justify-between pl-8">
                  <span className="text-[11px] font-mono text-gray-600">
                    {p.product_type || p.type}{!isFromDB && p.sold > 0 ? ` · ${p.sold.toLocaleString()} sold` : ''}
                  </span>
                  <button className="text-xs font-medium bg-emerald-500 text-black px-4 py-1.5 rounded-lg hover:bg-emerald-400 transition-colors">
                    {getCtaText(p)}
                  </button>
                </div>
              </div>
            );

            if (p.external_url && (p.product_type === 'affiliate_link' || p.type === 'Link')) {
              return (
                <Link key={i} href={p.external_url} target="_blank" rel="noopener noreferrer">
                  {productComponent}
                </Link>
              );
            }

            return (
              <div key={i}>
                {productComponent}
              </div>
            );
          })}
        </div>

        {/* No products message for DB creators */}
        {isFromDB && products.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-gray-500 mb-2">no products yet</p>
            <p className="text-sm text-gray-600">this creator hasn't added any products to their loadout</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10 p-6 bg-[#111] rounded-xl border border-white/5">
          <p className="text-sm text-gray-400 mb-3">want a page like this?</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm">
            build your loadout →
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/" className="text-[11px] font-mono text-gray-600 hover:text-emerald-500 transition-colors">
            ⚡ powered by loadout.fit
          </Link>
        </div>
      </div>
    </div>
  );
}
