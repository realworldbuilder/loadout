'use client';

import Link from 'next/link';
import { Instagram, Youtube, Twitter, ExternalLink, ShoppingBag } from 'lucide-react';
import TrackClick from '@/components/TrackClick';

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
    tiktok?: string;
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
};

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
  const isFromDB = dbData !== null && dbData !== undefined;
  const isDemo = !isFromDB && DEMO_CREATORS[handle];
  const creator = isFromDB ? dbData?.creator : DEMO_CREATORS[handle];
  const products = isFromDB ? dbData?.products || [] : creator?.products || [];

  // Demo directory page - keep dark for now since it's the directory
  if (handle === 'demo') {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 text-gray-500 hover:text-white transition-colors text-sm">
              ← back to loadout
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">example loadouts</h1>
            <p className="text-gray-400 text-lg">see what different fitness creators can build</p>
          </div>
          <div className="space-y-3">
            {DEMO_LIST.map((c: any) => (
              <Link key={c.handle} href={`/${c.handle}`} className="block bg-[#111] rounded-xl border border-white/5 p-5 hover:border-emerald-500/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl shrink-0`}>{c.avatar_emoji}</div>
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
                    </div>
                  </div>
                  <span className="text-gray-600 group-hover:text-emerald-400 transition-colors text-lg">→</span>
                </div>
              </Link>
            ))}
          </div>
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🏋️</p>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">@{handle}</h1>
          <p className="text-gray-500 mb-6">this creator hasn&apos;t set up their loadout yet</p>
          <Link href="/" className="text-gray-900 text-sm hover:underline">create your own loadout →</Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') return price;
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  const getProductEmoji = (productType: string, demoEmoji?: string) => {
    if (demoEmoji) return demoEmoji;
    switch (productType) {
      case 'digital_product': case 'PDF': return '📚';
      case 'coaching': case 'Coaching': return '🎯';
      case 'affiliate_link': case 'Link': return '🔗';
      case 'subscription': case 'Subscription': return '📅';
      default: return '📦';
    }
  };

  const getCtaText = (product: any) => {
    if (product.cta_text) return product.cta_text;
    if (product.type === 'Link' || product.product_type === 'affiliate_link') return 'visit';
    if (product.type === 'Booking') return 'book';
    if (product.price === 'Free' || product.price === 0) return 'get free';
    if (product.external_url) return 'get it';
    if (!product.external_url && product.product_type === 'digital_product') return 'get it';
    return 'get it';
  };

  const gradientColor = isDemo ? creator.color : 'from-gray-700 to-gray-800';

  // Build social links for DB creators
  const socialLinks: { platform: string; url: string; icon: any }[] = [];
  if (creator.social_links) {
    if (isFromDB) {
      if (creator.social_links.instagram) socialLinks.push({ platform: 'instagram', url: creator.social_links.instagram, icon: Instagram });
      if (creator.social_links.youtube) socialLinks.push({ platform: 'youtube', url: creator.social_links.youtube, icon: Youtube });
      if (creator.social_links.twitter) socialLinks.push({ platform: 'twitter', url: creator.social_links.twitter, icon: Twitter });
    } else {
      if (creator.social_links.instagram) socialLinks.push({ platform: 'instagram', url: '#', icon: Instagram });
      if (creator.social_links.youtube) socialLinks.push({ platform: 'youtube', url: '#', icon: Youtube });
      if (creator.social_links.twitter) socialLinks.push({ platform: 'twitter', url: '#', icon: Twitter });
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[480px] mx-auto px-4 py-8">
        {/* Only show back link on demo profiles */}
        {isDemo && (
          <Link href="/demo" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-6">
            ← all examples
          </Link>
        )}

        {/* Profile header - clean and centered */}
        <div className="text-center mb-8">
          {/* Avatar */}
          {isFromDB && creator.avatar_url ? (
            <img 
              src={creator.avatar_url} 
              alt={creator.display_name} 
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-lg" 
            />
          ) : (
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg`}>
              {isDemo ? creator.avatar_emoji : '💪'}
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-1">{creator.display_name}</h1>
          <p className="text-gray-500 mb-3">@{creator.handle}</p>
          
          {creator.bio && (
            <p className="text-gray-600 leading-relaxed max-w-sm mx-auto mb-4">{creator.bio}</p>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-3 mb-4">
              {socialLinks.map(({ platform, url, icon: Icon }) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Icon className="h-4 w-4 text-gray-600" />
                </a>
              ))}
            </div>
          )}

          {/* Quick stats for demos */}
          {isDemo && (
            <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{creator.followers}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{products.length}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">products</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {products.reduce((a: number, p: any) => a + (p.sold || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">sold</p>
              </div>
            </div>
          )}
        </div>

        {/* Products section */}
        {products.length > 0 && (
          <div className="space-y-4 mb-8">
            {products.map((p: any, i: number) => {
              const isLink = p.product_type === 'link' || p.product_type === 'affiliate_link' || p.type === 'Link';
              
              // Link card style - compact single row
              if (isLink) {
                const linkCard = (
                  <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors cursor-pointer group border border-gray-100 hover:border-gray-200">
                    <div className="flex items-center gap-3">
                      {/* Small circular thumbnail/icon */}
                      {p.thumbnail_url ? (
                        <img 
                          src={p.thumbnail_url} 
                          alt={p.title}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">
                          {getProductEmoji(p.product_type || p.type, p.emoji)}
                        </div>
                      )}
                      
                      {/* Title */}
                      <span className="font-medium text-gray-900 flex-1 min-w-0 truncate">{p.title}</span>
                      
                      {/* Arrow icon */}
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                );

                if (isFromDB && creator?.id && p.id) {
                  const url = p.external_url || p.file_url;
                  if (url) {
                    return (
                      <TrackClick key={i} creatorId={creator.id} productId={p.id}>
                        <Link href={url} target="_blank" rel="noopener noreferrer">{linkCard}</Link>
                      </TrackClick>
                    );
                  }
                  return <TrackClick key={i} creatorId={creator.id} productId={p.id}>{linkCard}</TrackClick>;
                }

                if (p.link || p.external_url) {
                  return <Link key={i} href={p.link || p.external_url} target="_blank" rel="noopener noreferrer">{linkCard}</Link>;
                }

                return <div key={i}>{linkCard}</div>;
              }

              // Full product card style
              const productCard = (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex gap-4">
                    {/* Thumbnail/emoji */}
                    {p.thumbnail_url ? (
                      <img 
                        src={p.thumbnail_url} 
                        alt={p.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                        {getProductEmoji(p.product_type || p.type, p.emoji)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 leading-tight">{p.title}</h3>
                        <span className="text-gray-900 font-bold text-lg flex-shrink-0">{formatPrice(p.price)}</span>
                      </div>
                      
                      {(p.description || p.desc) && (
                        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{p.description || p.desc}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          {p.product_type || p.type}
                          {isDemo && p.sold > 0 ? ` · ${p.sold.toLocaleString()} sold` : ''}
                        </span>
                        <button className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                          {getCtaText(p)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );

              if (isFromDB && creator?.id && p.id) {
                const url = p.external_url || p.file_url;
                if (url) {
                  return (
                    <TrackClick key={i} creatorId={creator.id} productId={p.id}>
                      <Link href={url} target="_blank" rel="noopener noreferrer">{productCard}</Link>
                    </TrackClick>
                  );
                }
                return <TrackClick key={i} creatorId={creator.id} productId={p.id}>{productCard}</TrackClick>;
              }

              if (p.link || p.external_url) {
                return <Link key={i} href={p.link || p.external_url} target="_blank" rel="noopener noreferrer">{productCard}</Link>;
              }

              return <div key={i}>{productCard}</div>;
            })}
          </div>
        )}

        {/* No products for DB creators */}
        {isFromDB && products.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-semibold mb-1">no products yet</p>
            <p className="text-sm text-gray-500">check back soon</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-gray-50 rounded-xl p-6 mb-6">
          <p className="text-gray-600 mb-4">want a page like this?</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            create your loadout →
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ⚡ powered by loadout.fit
          </Link>
        </div>
      </div>
    </div>
  );
}
