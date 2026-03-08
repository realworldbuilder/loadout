'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Instagram, Youtube, Twitter, ExternalLink, ShoppingBag, Mail, Play } from 'lucide-react';
import TrackClick from '@/components/TrackClick';
import CreatorCodes from '@/components/CreatorCodes';
import CreatorPicks from '@/components/CreatorPicks';
import { CreatorTheme, DEFAULT_THEME } from '@/types/theme';
import { getThemeStyles, getThemeFontClass, getButtonClasses, getCardClasses, getSocialIconClasses } from '@/lib/utils';

interface DBCreator {
  id: string;
  handle: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  theme?: {
    primary?: string;
    background?: string;
  };
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
  layout?: 'classic' | 'featured';
}

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

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
    theme: { primary: '#059669', background: '#ffffff' },
    social_links: { 
      instagram: 'https://instagram.com/alexrivera',
      youtube: 'https://youtube.com/alexrivera',
      twitter: 'https://twitter.com/alexrivera' 
    },
    products: [
      { title: '12-Week Shred Program', desc: 'Complete fat loss program with progressive overload, cardio protocols, and weekly check-in templates.', price: 29, type: 'digital_product', sold: 847, emoji: '🔥' },
      { title: 'Meal Prep Masterclass', desc: '40+ recipes, grocery lists, and macro breakdowns for bulking and cutting.', price: 19, type: 'digital_product', sold: 412, emoji: '🥗' },
      { title: 'My Instagram', desc: 'Follow for daily motivation and tips', price: 0, type: 'link', emoji: '📱', link: 'https://instagram.com' },
      { title: '1:1 Online Coaching', desc: 'Monthly coaching with custom programming, weekly check-ins, and unlimited messaging.', price: 149, type: 'coaching', sold: 23, emoji: '🎯', cta_text: 'Get started' },
      { title: 'Beginner Strength Foundations', desc: '8-week program for complete beginners. Learn the big 5 lifts with video guides.', price: 14, type: 'digital_product', sold: 1203, emoji: '🏗️' },
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
    theme: { primary: '#ec4899', background: '#ffffff' },
    social_links: { instagram: true, youtube: true },
    products: [
      { title: 'Grow Your Glutes Program', desc: '12-week progressive program targeting all 3 glute muscles. Home + gym versions included.', price: 34, type: 'digital_product', sold: 4200, emoji: '🍑' },
      { title: 'Booty Band Starter Pack', desc: '30-day at-home program using only resistance bands. Perfect for beginners or travel.', price: 12, type: 'digital_product', sold: 8900, emoji: '🏠' },
      { title: 'Resources', desc: '', price: 0, type: 'header' },
      { title: 'Monthly Workout Calendar', desc: 'New workouts every month. Full body focus with glute emphasis. Video demos included.', price: 9.99, type: 'subscription', sold: 670, emoji: '📅' },
      { title: 'Macro Calculator + Guide', desc: 'Custom macro calculator spreadsheet with full nutrition guide for body recomp.', price: 7, type: 'digital_product', sold: 3100, emoji: '📊' },
      { title: 'VIP Coaching (3 months)', desc: 'Personalized programming, weekly video check-ins, nutrition coaching, and 24/7 DM access.', price: 297, type: 'coaching', sold: 45, emoji: '👑' },
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
    theme: { primary: '#dc2626', background: '#ffffff' },
    social_links: { 
      instagram: 'https://instagram.com/ironmike',
      youtube: 'https://youtube.com/ironmike',
      twitter: 'https://twitter.com/ironmike',
      tiktok: 'https://tiktok.com/@ironmike'
    },
    products: [
      { title: 'Conjugate Method Simplified', desc: 'The Westside system broken down for regular humans. Max effort, dynamic effort, accessory templates.', price: 44, type: 'digital_product', sold: 1890, emoji: '⚡' },
      { title: '16-Week Meet Prep', desc: 'Peak for competition. RPE-based with attempt selection strategy and water cut protocol.', price: 39, type: 'digital_product', sold: 634, emoji: '🏆' },
      { title: 'Form Check Video Review', desc: 'Send me your squat, bench, or deadlift. 5-10 min detailed video breakdown within 48hrs.', price: 25, type: 'coaching', sold: 312, emoji: '📹' },
      { title: 'Deadlift Domination', desc: '8-week deadlift specialization block. Added 40lbs to my pull. Will add to yours.', price: 24, type: 'digital_product', sold: 2700, emoji: '💀' },
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
    theme: { primary: '#8b5cf6', background: '#ffffff' },
    social_links: { instagram: true, youtube: true },
    products: [
      { title: 'Yoga for Lifters', desc: '20-minute flows designed specifically for people who lift. Fix your squat depth, bench arch, and deadlift setup.', price: 19, type: 'digital_product', sold: 5600, emoji: '🧘' },
      { title: 'Strength + Flow Hybrid Program', desc: '3 lifting days + 2 yoga days per week. 12 weeks. The best of both worlds.', price: 29, type: 'digital_product', sold: 1800, emoji: '☯️' },
      { title: 'Morning Mobility Routine', desc: '10-minute daily routine. Follow along video. Zero equipment. Do it before your coffee.', price: 9, type: 'digital_product', sold: 9200, emoji: '🌅' },
      { title: 'Breathwork for Performance', desc: 'Breathing techniques for max effort lifts, recovery, and stress. Nasal breathing protocols included.', price: 14, type: 'digital_product', sold: 2300, emoji: '🌬️' },
      { title: 'Private Yoga Session (Virtual)', desc: '60-min 1:1 session focused on your specific mobility issues and goals.', price: 75, type: 'coaching', sold: 120, emoji: '💎' },
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
    theme: { primary: '#f59e0b', background: '#ffffff' },
    social_links: { instagram: true, twitter: true },
    products: [
      { title: 'Vertical Jump Bible', desc: 'Add 4-8 inches to your vert in 12 weeks. Plyometrics, strength work, and jump mechanics.', price: 34, type: 'digital_product', sold: 3400, emoji: '🚀' },
      { title: 'Speed & Agility Program', desc: '8-week sprint mechanics and COD training. Used by actual college athletes.', price: 29, type: 'digital_product', sold: 1900, emoji: '💨' },
      { title: 'Athlete Meal Plan Template', desc: 'Customizable meal plan for high school and college athletes. Bulking and cutting versions.', price: 14, type: 'digital_product', sold: 4100, emoji: '🍗' },
      { title: 'Virtual Speed Assessment', desc: 'Film your sprint. I analyze mechanics and give you a personalized drill program.', price: 45, type: 'coaching', sold: 89, emoji: '📹' },
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
    theme: { primary: '#22c55e', background: '#ffffff' },
    social_links: { 
      instagram: 'https://instagram.com/macrosbymel',
      youtube: 'https://youtube.com/macrosbymel',
      twitter: 'https://twitter.com/macrosbymel' 
    },
    products: [
      { title: 'Macro Mastery Course', desc: 'Learn to count macros without losing your mind. 6-module video course with worksheets.', price: 49, type: 'digital_product', sold: 2800, emoji: '🎓' },
      { title: 'High Protein Recipe Book', desc: '100+ recipes all 30g+ protein. Breakfast, lunch, dinner, snacks, desserts. Macro breakdowns for each.', price: 24, type: 'digital_product', sold: 7600, emoji: '📖' },
      { title: 'Reverse Diet Protocol', desc: 'Stop yo-yo dieting. Step-by-step guide to increasing calories without gaining fat.', price: 19, type: 'digital_product', sold: 3200, emoji: '📈' },
      { title: '1:1 Nutrition Coaching', desc: 'Fully customized macro plan, weekly adjustments, and unlimited support. Minimum 3 month commitment.', price: 199, type: 'coaching', sold: 34, emoji: '🏅' },
      { title: 'Grocery Store Guide', desc: 'My exact shopping list for a week of macro-friendly meals. Budget and bougie versions.', price: 5, type: 'digital_product', sold: 12400, emoji: '🛒' },
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

// Utility function to detect if a color is dark
const isDarkColor = (color: string): boolean => {
  return color.startsWith('#0') || color.startsWith('#1') || color.startsWith('#2');
};

// Utility function to determine if accent color is light for text contrast
const isLightColor = (color: string): boolean => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155;
};

export default function CreatorProfile({ handle, dbData }: CreatorProfileProps) {
  const isFromDB = dbData !== null && dbData !== undefined;
  const isDemo = !isFromDB && DEMO_CREATORS[handle];
  const creator = isFromDB ? dbData?.creator : DEMO_CREATORS[handle];
  const products = isFromDB ? dbData?.products || [] : creator?.products || [];
  const [emailStates, setEmailStates] = useState<Record<string, { email: string; isSubmitting: boolean; success: boolean; error: string }>>({});

  // Theme handling - use full theme structure
  const creatorTheme: CreatorTheme = { ...DEFAULT_THEME, ...creator?.theme };
  const isDark = isDarkColor(creatorTheme.background);
  const fontClass = getThemeFontClass(creatorTheme.font);
  
  // Apply styles inline for dynamic theming
  const pageStyle = getThemeStyles(creatorTheme);
  const primaryIsLight = isLightColor(creatorTheme.primary);

  // Color classes based on theme
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const linkCardBg = isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100';
  const linkCardBorder = isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300';
  const productCardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const productCardBorder = isDark ? 'border-gray-700' : 'border-gray-200';
  const socialIconBg = isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200';
  const socialIconColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const primaryColor = creatorTheme.primary;
  const gradientColor = isDemo ? creator.color : 'from-gray-700 to-gray-800';

  // Demo directory page - keep existing dark design
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

  // Theme handling removed - now using new implementation above

  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') return price;
    if (price === 0) return 'Free';
    if (price % 1 === 0) return `$${price}`;
    return `$${price.toFixed(2)}`;
  };

  const getProductEmoji = (productType: string, demoEmoji?: string): string => {
    if (demoEmoji) return demoEmoji;
    switch (productType) {
      case 'digital_product': 
      case 'digital': return '📚';
      case 'coaching': return '🎯';
      case 'affiliate_link':
      case 'link': return '🔗';
      case 'subscription': return '📅';
      case 'email_collector': return '📧';
      case 'embed': return '📺';
      case 'header': return '📋';
      default: return '📦';
    }
  };

  const getCtaText = (product: any): string => {
    if (product.cta_text) return product.cta_text;
    if (product.type === 'link' || product.product_type === 'affiliate_link') return 'visit';
    if (product.type === 'coaching' || product.product_type === 'coaching') return 'book now';
    if (product.price === 'Free' || product.price === 0) return 'get free';
    if (product.product_type === 'subscription') return 'subscribe';
    return 'get it';
  };

  const handleEmailSubmit = async (productId: string, creatorId: string) => {
    const state = emailStates[productId];
    if (!state?.email || state.isSubmitting) return;

    setEmailStates(prev => ({
      ...prev,
      [productId]: { ...prev[productId], isSubmitting: true, error: '' }
    }));

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId, email: state.email })
      });

      const result = await response.json();

      if (response.ok) {
        setEmailStates(prev => ({
          ...prev,
          [productId]: { ...prev[productId], isSubmitting: false, success: true }
        }));
      } else {
        setEmailStates(prev => ({
          ...prev,
          [productId]: { ...prev[productId], isSubmitting: false, error: result.error || 'Failed to subscribe' }
        }));
      }
    } catch (error) {
      setEmailStates(prev => ({
        ...prev,
        [productId]: { ...prev[productId], isSubmitting: false, error: 'Failed to subscribe' }
      }));
    }
  };

  // Checkout handler for paid products
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  
  const handleCheckout = async (productId: string) => {
    setCheckoutLoading(productId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Checkout unavailable');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getEmbedComponent = (url: string, title: string) => {
    if (!url) return null;

    // YouTube embed
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      let videoId;
      if (url.includes('youtube.com/watch')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      }

      if (videoId) {
        return (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        );
      }
    }

    // Spotify embed
    if (url.includes('open.spotify.com/')) {
      const spotifyId = url.split('open.spotify.com/')[1];
      if (spotifyId) {
        const embedUrl = `https://open.spotify.com/embed/${spotifyId}`;
        const isTrack = spotifyId.includes('track');
        const height = isTrack ? '152px' : '352px';
        
        return (
          <div className="w-full rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              width="100%"
              height={height}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
            />
          </div>
        );
      }
    }

    // Generic link card for other URLs
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Play className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">External content</p>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </div>
      </a>
    );
  };

  // Build social links
  const socialLinks: { platform: string; url: string; icon: any }[] = [];
  if (creator.social_links) {
    if (isFromDB) {
      if (creator.social_links.instagram) socialLinks.push({ 
        platform: 'instagram', 
        url: creator.social_links.instagram, 
        icon: Instagram 
      });
      if (creator.social_links.youtube) socialLinks.push({ 
        platform: 'youtube', 
        url: creator.social_links.youtube, 
        icon: Youtube 
      });
      if (creator.social_links.twitter) socialLinks.push({ 
        platform: 'twitter', 
        url: creator.social_links.twitter, 
        icon: Twitter 
      });
      if (creator.social_links.tiktok) socialLinks.push({ 
        platform: 'tiktok', 
        url: creator.social_links.tiktok, 
        icon: TikTokIcon 
      });
    } else {
      // Demo creators
      if (creator.social_links.instagram) socialLinks.push({ 
        platform: 'instagram', 
        url: typeof creator.social_links.instagram === 'string' ? creator.social_links.instagram : '#', 
        icon: Instagram 
      });
      if (creator.social_links.youtube) socialLinks.push({ 
        platform: 'youtube', 
        url: typeof creator.social_links.youtube === 'string' ? creator.social_links.youtube : '#', 
        icon: Youtube 
      });
      if (creator.social_links.twitter) socialLinks.push({ 
        platform: 'twitter', 
        url: typeof creator.social_links.twitter === 'string' ? creator.social_links.twitter : '#', 
        icon: Twitter 
      });
      if (creator.social_links.tiktok) socialLinks.push({ 
        platform: 'tiktok', 
        url: typeof creator.social_links.tiktok === 'string' ? creator.social_links.tiktok : '#', 
        icon: TikTokIcon 
      });
    }
  }

  return (
    <div className={`min-h-screen ${fontClass}`} style={pageStyle}>
      <div className="max-w-[480px] mx-auto px-4 py-8">
        {/* Only show back link on demo profiles */}
        {isDemo && (
          <Link 
            href="/demo" 
            className={`inline-flex items-center gap-1 ${mutedTextColor} hover:${textColor} transition-colors text-sm mb-6`}
          >
            ← all examples
          </Link>
        )}

        {/* FEATURE 3: Profile header with different layouts */}
        {(creatorTheme.headerStyle || 'classic') === 'banner' ? (
          // Banner layout
          <div className="mb-8">
            {/* Banner image area */}
            <div className="relative mb-6">
              <div 
                className={`h-32 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} overflow-hidden`} 
                style={{
                  ...(creatorTheme.headerImage 
                    ? { 
                        backgroundImage: `url(${creatorTheme.headerImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }
                    : { backgroundColor: `${creatorTheme.primary}20` }
                  )
                }}
              />
              {/* Avatar overlapping bottom edge — outside overflow-hidden */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                {isFromDB && creator.avatar_url ? (
                  <img 
                    src={creator.avatar_url} 
                    alt={creator.display_name} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" 
                    style={{ borderColor: creatorTheme.background }}
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-3xl border-4 shadow-lg`} style={{ borderColor: creatorTheme.background }}>
                    {isDemo ? creator.avatar_emoji : '💪'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Name and info below banner */}
            <div className="text-center pt-6">
              <h1 className={`text-2xl font-bold ${textColor} mb-1`}>{creator.display_name}</h1>
              <p className={`${mutedTextColor} mb-3`}>@{creator.handle}</p>
              {creator.bio && (
                <p className={`${mutedTextColor} leading-relaxed max-w-sm mx-auto mb-6 text-center`}>
                  {creator.bio}
                </p>
              )}
              
              {/* Social icons */}
              {socialLinks.length > 0 && (
                <div className="flex justify-center gap-3">
                  {socialLinks.map(({ platform, url, icon: Icon }) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={getSocialIconClasses(creatorTheme.socialStyle, platform, isDark)}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (creatorTheme.headerStyle || 'classic') === 'minimal' ? (
          // Minimal layout - no avatar, just text
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold ${textColor} mb-2`}>{creator.display_name}</h1>
            <p className={`${mutedTextColor} mb-4`}>@{creator.handle}</p>
            {creator.bio && (
              <p className={`${mutedTextColor} leading-relaxed max-w-md mx-auto mb-6 text-center text-lg`}>
                {creator.bio}
              </p>
            )}
            
            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div className="flex justify-center gap-3">
                {socialLinks.map(({ platform, url, icon: Icon }) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={getSocialIconClasses(creatorTheme.socialStyle, platform, isDark)}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Classic layout (default)
          <div className="text-center mb-8">
            {/* Avatar - 96px with shadow */}
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

            {/* Name - large, bold, text-2xl */}
            <h1 className={`text-2xl font-bold ${textColor} mb-1`}>{creator.display_name}</h1>
            
            {/* Handle - @handle in gray */}
            <p className={`${mutedTextColor} mb-3`}>@{creator.handle}</p>
            
            {/* Bio - max 2-3 lines, centered */}
            {creator.bio && (
              <p className={`${mutedTextColor} leading-relaxed max-w-sm mx-auto mb-6 text-center`}>
                {creator.bio}
              </p>
            )}

            {/* Social icons - 40x40 circles */}
            {socialLinks.length > 0 && (
              <div className="flex justify-center gap-3 mb-6">
                {socialLinks.map(({ platform, url, icon: Icon }) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={getSocialIconClasses(creatorTheme.socialStyle, platform, isDark)}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Creator Codes Section - only show for real DB creators if no codes_block exists in products */}
        {isFromDB && creator?.id && !products.some((p: any) => p.product_type === 'codes_block') && (
          <CreatorCodes creator_id={creator.id} />
        )}

        {/* Creator Picks Section - only show for real DB creators if no picks_block exists in products */}
        {isFromDB && creator?.id && !products.some((p: any) => p.product_type === 'picks_block') && (
          <CreatorPicks creator_id={creator.id} />
        )}

        {/* Items section - mixed links and products */}
        {products.length > 0 && (
          <div className="space-y-3 mb-8">
            {products.map((p: any, i: number) => {
              // Codes block type - render CreatorCodes component
              if (p.product_type === 'codes_block') {
                return (
                  <div key={i} className="mb-6">
                    <CreatorCodes creator_id={creator?.id || ''} />
                  </div>
                );
              }

              // Picks block type - render CreatorPicks component
              if (p.product_type === 'picks_block') {
                // description field stores the collection filter (if any)
                const collection = p.description && p.description !== 'all' ? p.description : undefined;
                return (
                  <div key={i} className="mb-6">
                    <CreatorPicks creator_id={creator?.id || ''} filterCollection={collection} />
                  </div>
                );
              }

              // Header type - simple text divider
              if (p.product_type === 'header' || p.type === 'header') {
                return (
                  <div key={i} className="py-4">
                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${mutedTextColor} text-center`}>
                      {p.title}
                    </h3>
                  </div>
                );
              }

              // Email collector component
              if ((p.product_type === 'email_collector' || p.type === 'email_collector') && isFromDB) {
                const state = emailStates[p.id] || { email: '', isSubmitting: false, success: false, error: '' };
                
                if (state.success) {
                  return (
                    <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-green-900 mb-1">Thanks for subscribing!</h3>
                      <p className="text-sm text-green-700">You'll hear from us soon.</p>
                    </div>
                  );
                }

                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-6 w-6 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{p.title}</h3>
                    {p.description && (
                      <p className="text-sm text-gray-600 mb-4">{p.description}</p>
                    )}
                    
                    <div className="max-w-sm mx-auto">
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={state.email}
                          onChange={(e) => setEmailStates(prev => ({
                            ...prev,
                            [p.id]: { ...prev[p.id], email: e.target.value, error: '' }
                          }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && creator?.id) {
                              handleEmailSubmit(p.id, creator.id);
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                          disabled={state.isSubmitting}
                        />
                        <button
                          onClick={() => creator?.id && handleEmailSubmit(p.id, creator.id)}
                          disabled={state.isSubmitting || !state.email}
                          className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          {state.isSubmitting ? '...' : 'Subscribe'}
                        </button>
                      </div>
                      {state.error && (
                        <p className="text-red-600 text-sm mt-2">{state.error}</p>
                      )}
                    </div>
                  </div>
                );
              }

              // Embed component
              if ((p.product_type === 'embed' || p.type === 'embed') && p.external_url) {
                return (
                  <div key={i} className="space-y-3">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    {p.description && (
                      <p className="text-sm text-gray-600">{p.description}</p>
                    )}
                    {getEmbedComponent(p.external_url, p.title)}
                  </div>
                );
              }

              // Check layout preference FIRST - featured overrides type-based rendering
              const layout = p.layout || 'classic';
              
              const isLink = p.product_type === 'link' || p.product_type === 'affiliate_link' || p.type === 'link';
              
              // Link style - Linktree pill buttons (only for classic layout)
              if (isLink && layout !== 'featured') {
                const linkCard = (
                  <div className={`${getCardClasses(creatorTheme.cardStyle, isDark)} rounded-xl p-4 transition-all duration-200 cursor-pointer group hover:scale-[1.02] hover:shadow-lg h-14 flex items-center`}
                       style={{ 
                         backgroundColor: creatorTheme.cardStyle === 'transparent' ? 'transparent' : (creatorTheme.cardStyle === 'glass' ? undefined : creatorTheme.cardBg)
                       }}>
                    <div className="flex items-center gap-3 w-full">
                      {/* Optional small thumbnail */}
                      {p.thumbnail_url && (
                        <img 
                          src={p.thumbnail_url} 
                          alt={p.title}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      
                      {/* Title - centered */}
                      <span className={`font-medium ${textColor} flex-1 text-center`}>
                        {p.title}
                      </span>
                      
                      {/* Arrow - subtle */}
                      <ExternalLink className={`h-4 w-4 ${mutedTextColor} group-hover:${textColor} transition-colors flex-shrink-0`} />
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

              // Featured layout - large card with hero image
              if (layout === 'featured') {
                const featuredCard = (
                  <div className={`${getCardClasses(creatorTheme.cardStyle, isDark)} rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer group hover:shadow-xl hover:ring-2 hover:ring-opacity-20`}
                       style={{ 
                         ['--tw-ring-color' as any]: primaryColor,
                         backgroundColor: creatorTheme.cardStyle === 'transparent' ? 'transparent' : (creatorTheme.cardStyle === 'glass' ? undefined : creatorTheme.cardBg)
                       }}>
                    {/* Hero thumbnail */}
                    {p.thumbnail_url ? (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={p.thumbnail_url} 
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className={`aspect-video w-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                        <div className="text-6xl opacity-50">
                          {getProductEmoji(p.product_type || p.type, p.emoji)}
                        </div>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className={`font-bold ${textColor} leading-tight text-xl`}>{p.title}</h3>
                        <span className={`${textColor} font-bold text-xl flex-shrink-0`}>
                          {formatPrice(p.price)}
                        </span>
                      </div>
                      
                      {/* Description */}
                      {(p.description || p.desc) && (
                        <p className={`text-sm ${mutedTextColor} leading-relaxed mb-4 line-clamp-3`}>
                          {p.description || p.desc}
                        </p>
                      )}
                      
                      {/* CTA button - full width, colored */}
                      <button 
                        className={`w-full ${getButtonClasses(creatorTheme.buttonStyle, primaryColor, isDark)} hover:scale-[1.02]`}
                        style={{ 
                          backgroundColor: creatorTheme.buttonStyle === 'outline' ? 'transparent' : 
                                          creatorTheme.buttonStyle === 'soft' ? `${primaryColor}1A` : primaryColor,
                          color: creatorTheme.buttonStyle === 'outline' ? primaryColor :
                                creatorTheme.buttonStyle === 'soft' ? primaryColor :
                                primaryIsLight ? '#000000' : '#ffffff',
                          borderColor: creatorTheme.buttonStyle === 'outline' ? primaryColor : undefined,
                          boxShadow: creatorTheme.buttonStyle === 'shadow' ? `0 10px 25px -5px ${primaryColor}40, 0 8px 10px -6px ${primaryColor}40` : undefined
                        }}
                      >
                        {getCtaText(p)}
                      </button>
                    </div>
                  </div>
                );

                if (isFromDB && creator?.id && p.id) {
                  const url = p.external_url || p.file_url;
                  if (url) {
                    return (
                      <TrackClick key={i} creatorId={creator.id} productId={p.id}>
                        <Link href={url} target="_blank" rel="noopener noreferrer">{featuredCard}</Link>
                      </TrackClick>
                    );
                  }
                  // Paid product with no external URL — trigger checkout
                  if (p.price > 0) {
                    return (
                      <TrackClick key={i} creatorId={creator.id} productId={p.id}>
                        <div onClick={() => handleCheckout(p.id)} className="cursor-pointer">
                          {checkoutLoading === p.id ? (
                            <div className="relative">
                              {featuredCard}
                              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                                <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                              </div>
                            </div>
                          ) : featuredCard}
                        </div>
                      </TrackClick>
                    );
                  }
                  return <TrackClick key={i} creatorId={creator.id} productId={p.id}>{featuredCard}</TrackClick>;
                }

                if (p.link || p.external_url) {
                  return <Link key={i} href={p.link || p.external_url} target="_blank" rel="noopener noreferrer">{featuredCard}</Link>;
                }

                return <div key={i}>{featuredCard}</div>;
              }

              // Classic layout - compact row style (current default)
              const productCard = (
                <div className={`${getCardClasses(creatorTheme.cardStyle, isDark)} rounded-xl p-4 transition-all duration-200 cursor-pointer group hover:shadow-xl`}
                     style={{ 
                       backgroundColor: creatorTheme.cardStyle === 'transparent' ? 'transparent' : (creatorTheme.cardStyle === 'glass' ? undefined : creatorTheme.cardBg)
                     }}>
                  <div className="flex gap-4 mb-4">
                    {/* Thumbnail - 64x64 square */}
                    {p.thumbnail_url ? (
                      <img 
                        src={p.thumbnail_url} 
                        alt={p.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center text-2xl flex-shrink-0`}>
                        {getProductEmoji(p.product_type || p.type, p.emoji)}
                      </div>
                    )}
                    
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`font-bold ${textColor} leading-tight`}>{p.title}</h3>
                        <span className={`${textColor} font-bold text-lg flex-shrink-0`}>
                          {formatPrice(p.price)}
                        </span>
                      </div>
                      
                      {/* Description - 1-2 lines */}
                      {(p.description || p.desc) && (
                        <p className={`text-sm ${mutedTextColor} leading-relaxed line-clamp-2`}>
                          {p.description || p.desc}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* CTA button - full width, colored */}
                  <button 
                    className={`w-full ${getButtonClasses(creatorTheme.buttonStyle, primaryColor, isDark)} hover:scale-[1.02]`}
                    style={{ 
                      backgroundColor: creatorTheme.buttonStyle === 'outline' ? 'transparent' : 
                                      creatorTheme.buttonStyle === 'soft' ? `${primaryColor}1A` : primaryColor,
                      color: creatorTheme.buttonStyle === 'outline' ? primaryColor :
                            creatorTheme.buttonStyle === 'soft' ? primaryColor :
                            primaryIsLight ? '#000000' : '#ffffff',
                      borderColor: creatorTheme.buttonStyle === 'outline' ? primaryColor : undefined,
                      boxShadow: creatorTheme.buttonStyle === 'shadow' ? `0 10px 25px -5px ${primaryColor}40, 0 8px 10px -6px ${primaryColor}40` : undefined
                    }}
                  >
                    {getCtaText(p)}
                  </button>
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
                // Paid product with no external URL — trigger checkout
                if (p.price > 0) {
                  return (
                    <TrackClick key={i} creatorId={creator.id} productId={p.id}>
                      <div onClick={() => handleCheckout(p.id)} className="cursor-pointer">
                        {checkoutLoading === p.id ? (
                          <div className="relative">
                            {productCard}
                            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                            </div>
                          </div>
                        ) : productCard}
                      </div>
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
          <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-8 text-center mb-8`}>
            <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center mx-auto mb-4`}>
              <ShoppingBag className={`h-8 w-8 ${mutedTextColor}`} />
            </div>
            <p className={`${textColor} font-semibold mb-1`}>no products yet</p>
            <p className={`text-sm ${mutedTextColor}`}>check back soon</p>
          </div>
        )}

        {/* Creator Codes moved above */}

        {/* Footer */}
        <div className="text-center">
          <Link href="/" className={`text-xs ${mutedTextColor} hover:${textColor} transition-colors`}>
            ⚡ loadout.fit
          </Link>
        </div>
      </div>
    </div>
  );
}