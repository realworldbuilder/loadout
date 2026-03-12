'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Instagram, Youtube, Twitter, ExternalLink, ShoppingBag, Mail, Play } from 'lucide-react';
import TrackClick from '@/components/TrackClick';
import CreatorCodes from '@/components/CreatorCodes';
import CreatorPicks from '@/components/CreatorPicks';
import CoachingForm from '@/components/CoachingForm';
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
    threads?: string;
    pinterest?: string;
    snapchat?: string;
    facebook?: string;
    spotify?: string;
    twitch?: string;
  };
  subscription_tier?: string;
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

// Snapchat Icon
const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.959-.289.175-.098.354-.178.573-.178.265 0 .525.107.742.3.18.159.33.437.304.732-.04.494-.555.781-.994.972-.204.089-.393.165-.53.229-.171.08-.265.127-.34.189-.07.055-.102.111-.102.209 0 .06.01.109.03.163.163.534.537 1.045.942 1.507.323.369.664.695.978.979.581.524.987.918 1.001 1.439.016.522-.418.895-.774 1.079-.476.248-1.03.378-1.65.389-.214.004-.42-.013-.617-.03a7.94 7.94 0 0 0-.49-.042c-.1 0-.178.008-.235.024a4.14 4.14 0 0 0-.397.186c-.375.188-.879.441-1.713.441-.04 0-.084 0-.126-.003-.845-.03-1.331-.293-1.706-.48a3.91 3.91 0 0 0-.381-.178c-.06-.018-.143-.028-.248-.028-.155 0-.327.012-.489.042-.197.017-.403.034-.617.03-.62-.011-1.174-.141-1.65-.389-.357-.184-.791-.557-.774-1.079.013-.521.42-.915 1.001-1.439.313-.284.655-.61.978-.979.406-.462.78-.973.942-1.507.02-.054.03-.103.03-.163 0-.098-.033-.154-.102-.209-.075-.062-.169-.109-.34-.189a8.263 8.263 0 0 1-.53-.229c-.44-.191-.954-.478-.994-.972-.026-.295.039-.573.304-.732.217-.193.477-.3.742-.3.219 0 .398.08.573.178.3.169.659.273.959.289.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793"/>
  </svg>
);

// Facebook Icon
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Spotify Icon
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

// Twitch Icon
const TwitchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
);

// Pinterest Embed Component
const PinterestEmbed = ({ url }: { url: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if ((window as any).PinUtils) {
      (window as any).PinUtils.build(ref.current);
    }
  }, [url]);
  
  const isPin = url.includes('/pin/');
  const dataPinDo = isPin ? 'embedPin' : url.match(/pinterest\.\w+\/[^/]+\/[^/]+\/?$/) ? 'embedBoard' : 'embedUser';
  
  return (
    <div ref={ref} className="mb-8">
      <a
        data-pin-do={dataPinDo}
        href={url}
      />
    </div>
  );
};

// Countdown Block Component
const CountdownBlock = ({ product, textColor }: { product: DBProduct; textColor: string }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    if (!product.description) return;

    const updateCountdown = () => {
      const targetDate = new Date(product.description!).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [product.description]);

  return (
    <div className="py-4">
      <h3 className={`font-medium ${textColor} text-center mb-4 text-lg`}>
        {product.title}
      </h3>
      
      {timeLeft.expired ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            live now
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'days', value: timeLeft.days },
            { label: 'hrs', value: timeLeft.hours },
            { label: 'min', value: timeLeft.minutes },
            { label: 'sec', value: timeLeft.seconds }
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="bg-[#171717] border border-white/10 rounded-lg py-3 px-1 sm:px-2 shadow-lg">
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {value.toString().padStart(2, '0')}
                </div>
              </div>
              <div className={`text-xs sm:text-sm mt-2 font-medium ${textColor} opacity-60`}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Demo data removed - now fully dynamic from database

interface CreatorProfileProps {
  handle: string;
  dbData: {
    creator: DBCreator;
    products: DBProduct[];
  };
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
  const creator = dbData.creator;
  const products = dbData.products || [];
  const [emailStates, setEmailStates] = useState<Record<string, { email: string; isSubmitting: boolean; success: boolean; error: string }>>({});

  // Theme handling - use full theme structure
  const creatorTheme: CreatorTheme = { ...DEFAULT_THEME, ...creator.theme };

  // Load Pinterest SDK when there are pinterest blocks
  useEffect(() => {
    const hasPinterest = products.some(p => p.product_type === 'pinterest_block');
    if (!hasPinterest) return;
    
    // Load Pinterest SDK
    if (!document.getElementById('pinterest-sdk')) {
      const script = document.createElement('script');
      script.id = 'pinterest-sdk';
      script.src = 'https://assets.pinterest.com/js/pinit.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else if ((window as any).PinUtils) {
      // Re-parse if SDK already loaded
      (window as any).PinUtils.build();
    }
  }, [products]);
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

  // All data is now from database - no demo fallbacks needed

  // Theme handling removed - now using new implementation above

  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') return price;
    if (price === 0) return 'Free';
    if (price % 1 === 0) return `$${price}`;
    return `$${price.toFixed(2)}`;
  };

  const getProductEmoji = (productType: string): string => {
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
    if (creator.social_links.threads) socialLinks.push({ 
      platform: 'threads', 
      url: creator.social_links.threads, 
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.19.408-2.285 1.33-3.082.88-.762 2.107-1.2 3.546-1.266 1.104-.05 2.129.075 3.063.376.01-.468-.01-.94-.066-1.408-.178-1.426-.763-2.144-2.353-2.26-.983-.073-1.863.211-2.26.77l-1.981-.96c.703-1.184 2.137-1.876 3.93-1.79 1.263.06 2.376.466 3.117 1.264.67.722 1.06 1.725 1.155 2.98.05.667.042 1.378-.023 2.118.642.397 1.19.862 1.618 1.403 1.09 1.378 1.574 3.175 1.32 4.916-.322 2.2-1.45 4.034-3.264 5.3C18.292 23.175 15.632 23.97 12.186 24zm-1.248-8.632c-1.21.063-2.59.547-2.529 1.665.035.635.573 1.27 1.936 1.344 1.588.086 2.823-.521 3.39-1.96.21-.533.346-1.15.408-1.855-.752-.222-1.584-.342-2.48-.308-.246.012-.488.035-.725.072v.042z"/></svg>
      )
    });
    if (creator.social_links.pinterest) socialLinks.push({
      platform: 'pinterest',
      url: creator.social_links.pinterest,
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
      )
    });
    if (creator.social_links.snapchat) socialLinks.push({
      platform: 'snapchat',
      url: creator.social_links.snapchat,
      icon: SnapchatIcon
    });
    if (creator.social_links.facebook) socialLinks.push({
      platform: 'facebook',
      url: creator.social_links.facebook,
      icon: FacebookIcon
    });
    if (creator.social_links.spotify) socialLinks.push({
      platform: 'spotify',
      url: creator.social_links.spotify,
      icon: SpotifyIcon
    });
    if (creator.social_links.twitch) socialLinks.push({
      platform: 'twitch',
      url: creator.social_links.twitch,
      icon: TwitchIcon
    });
  }

  return (
    <div className={`min-h-screen ${fontClass}`} style={pageStyle}>
      <div className="max-w-[480px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* No back link needed for database creators */}

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
                {creator.avatar_url ? (
                  <img 
                    src={creator.avatar_url} 
                    alt={creator.display_name} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" 
                    style={{ borderColor: creatorTheme.background }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-3xl border-4 shadow-lg" style={{ borderColor: creatorTheme.background }}>
                    💪
                  </div>
                )}
              </div>
            </div>
            
            {/* Name and info below banner */}
            <div className="text-center pt-6">
              <h1 className={`text-2xl font-bold ${textColor} mb-1`}>{creator.display_name}</h1>
              <p className={`${mutedTextColor} mb-3`}>@{creator.handle}</p>
              {creator.bio && (
                <p className={`${mutedTextColor} leading-relaxed max-w-sm mx-auto mb-6 text-center whitespace-pre-line`}>
                  {creator.bio}
                </p>
              )}
              
              {/* Social icons */}
              {socialLinks.length > 0 && (
                <div className="flex justify-center gap-4">
                  {socialLinks.map(({ platform, url, icon: Icon }) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${getSocialIconClasses(creatorTheme.socialStyle, platform, isDark)} min-w-[44px] min-h-[44px] flex items-center justify-center`}
                    >
                      <Icon className="h-5 w-5" />
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
              <p className={`${mutedTextColor} leading-relaxed max-w-md mx-auto mb-6 text-center text-lg whitespace-pre-line`}>
                {creator.bio}
              </p>
            )}
            
            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div className="flex justify-center gap-4">
                {socialLinks.map(({ platform, url, icon: Icon }) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${getSocialIconClasses(creatorTheme.socialStyle, platform, isDark)} min-w-[44px] min-h-[44px] flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Classic layout (default)
          <div className="text-center mb-8">
            {/* Avatar - 96px with shadow */}
            {creator.avatar_url ? (
              <img 
                src={creator.avatar_url} 
                alt={creator.display_name} 
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-lg" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                💪
              </div>
            )}

            {/* Name - large, bold, text-2xl */}
            <h1 className={`text-2xl font-bold ${textColor} mb-1`}>{creator.display_name}</h1>
            
            {/* Handle - @handle in gray */}
            <p className={`${mutedTextColor} mb-3`}>@{creator.handle}</p>
            
            {/* Bio - max 2-3 lines, centered */}
            {creator.bio && (
              <p className={`${mutedTextColor} leading-relaxed max-w-sm mx-auto mb-6 text-center whitespace-pre-line`}>
                {creator.bio}
              </p>
            )}

            {/* Social icons - 44x44 minimum for touch targets */}
            {socialLinks.length > 0 && (
              <div className="flex justify-center gap-4 mb-6">
                {socialLinks.map(({ platform, url, icon: Icon }) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${getSocialIconClasses(creatorTheme.socialStyle, platform, isDark)} min-w-[44px] min-h-[44px] flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Codes and picks only render when explicitly added via page builder blocks */}

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
                // collection field (or fallback to description) stores the filter
                const collection = (p.collection || p.description) && (p.collection || p.description) !== 'all' ? (p.collection || p.description) : undefined;
                return (
                  <div key={i} className="mb-6">
                    <CreatorPicks creator_id={creator?.id || ''} filterCollection={collection} />
                  </div>
                );
              }

              // Coaching application form — links to multi-step apply page
              if (p.product_type === 'coaching_form' || p.type === 'coaching_form') {
                return (
                  <div key={i} className="mb-6">
                    <a
                      href={`/${creator.handle}/apply`}
                      className="block w-full py-4 px-6 rounded-2xl text-center font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        backgroundColor: primaryColor || '#10a37f',
                        color: '#fff',
                      }}
                    >
                      {p.title || 'apply for coaching'}
                    </a>
                    {p.description && (
                      <p className={`text-sm ${mutedTextColor} text-center mt-2`}>{p.description}</p>
                    )}
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

              // Text block type - clean text content
              if (p.product_type === 'text_block') {
                return (
                  <div key={i} className="py-3">
                    {p.title && (
                      <h3 className={`font-medium ${textColor} mb-3 text-lg`}>
                        {p.title}
                      </h3>
                    )}
                    <div className={`${textColor} leading-relaxed whitespace-pre-line`}>
                      {p.description || ''}
                    </div>
                  </div>
                );
              }

              // Countdown timer block - live countdown with dark cards and emerald accent
              if (p.product_type === 'countdown_block') {
                return <CountdownBlock key={i} product={p} textColor={textColor} />;
              }

              // Video embed block
              if (p.product_type === 'video_block') {
                const videoUrl = p.description || p.external_url || '';
                let embedUrl = '';
                
                // YouTube
                const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (ytMatch) {
                  embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
                }
                
                // TikTok
                const tkMatch = videoUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
                if (tkMatch) {
                  embedUrl = `https://www.tiktok.com/embed/v2/${tkMatch[1]}`;
                }

                if (embedUrl) {
                  return (
                    <div key={i} className="mb-8">
                      <div className="aspect-video rounded-xl overflow-hidden">
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          frameBorder="0"
                        />
                      </div>
                    </div>
                  );
                }
                return null;
              }

              // Pinterest block component
              if (p.product_type === 'pinterest_block') {
                const pinUrl = p.description || p.external_url || '';
                if (!pinUrl) return null;
                
                return <PinterestEmbed key={i} url={pinUrl} />;
              }

              if (p.product_type === 'instagram_block') {
                const igUrl = p.description || p.external_url || '';
                if (!igUrl) return null;
                
                // Extract post ID and build embed
                const igMatch = igUrl.match(/instagram\.com\/(p|reel|reels)\/([A-Za-z0-9_-]+)/);
                if (!igMatch) return null;
                
                return (
                  <div key={i} className="mb-8">
                    <iframe
                      src={`https://www.instagram.com/${igMatch[1]}/${igMatch[2]}/embed`}
                      className="w-full rounded-xl border-0"
                      style={{ minHeight: '480px', maxWidth: '540px', margin: '0 auto', display: 'block' }}
                      allowTransparency
                      allowFullScreen
                      scrolling="no"
                    />
                  </div>
                );
              }

              if (p.product_type === 'tiktok_block') {
                const tkUrl = p.description || p.external_url || '';
                if (!tkUrl) return null;
                
                const tkMatch = tkUrl.match(/tiktok\.com\/@([^/]+)\/video\/(\d+)/);
                if (!tkMatch) return null;
                
                const tkUsername = tkMatch[1];
                
                return (
                  <a
                    key={i}
                    href={tkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-8 block rounded-xl overflow-hidden transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: isDark ? '#00f2ea' : '#000' }}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.17V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: isDark ? '#fff' : '#000' }}>
                          {p.title !== 'tiktok' ? p.title : `@${tkUsername}`}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                          watch on tiktok →
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: isDark ? '#fff' : '#000' }}><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </a>
                );
              }

              if (p.product_type === 'spotify_block') {
                const spotUrl = p.description || p.external_url || '';
                if (!spotUrl) return null;
                
                // Convert open.spotify.com URL to embed URL
                // Supports: track, album, playlist, episode, show
                const spotMatch = spotUrl.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
                if (!spotMatch) return null;
                
                const spotType = spotMatch[1];
                const spotId = spotMatch[2];
                const isCompact = spotType === 'track';
                
                return (
                  <div key={i} className="mb-8">
                    <iframe
                      src={`https://open.spotify.com/embed/${spotType}/${spotId}?theme=0`}
                      className="w-full rounded-xl border-0"
                      style={{ height: isCompact ? '152px' : '352px' }}
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                );
              }

              // Email collector component
              if (p.product_type === 'email_collector' || p.type === 'email_collector') {
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
                  <div className={`${getCardClasses(creatorTheme.cardStyle, isDark)} rounded-xl p-4 transition-all duration-200 cursor-pointer group hover:scale-[1.02] hover:shadow-lg min-h-[60px] flex items-center`}
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

                if (creator.id && p.id) {
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
                          {getProductEmoji(p.product_type || p.type)}
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
                        className={`w-full min-h-[44px] ${getButtonClasses(creatorTheme.buttonStyle, primaryColor, isDark)} hover:scale-[1.02]`}
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

                if (creator.id && p.id) {
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
                        {getProductEmoji(p.product_type || p.type)}
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
                    className={`w-full min-h-[44px] ${getButtonClasses(creatorTheme.buttonStyle, primaryColor, isDark)} hover:scale-[1.02]`}
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

              if (creator.id && p.id) {
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

              return <div key={i}>{productCard}</div>;
            })}
          </div>
        )}

        {/* No products */}
        {products.length === 0 && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-8 text-center mb-8`}>
            <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center mx-auto mb-4`}>
              <ShoppingBag className={`h-8 w-8 ${mutedTextColor}`} />
            </div>
            <p className={`${textColor} font-semibold mb-1`}>no products yet</p>
            <p className={`text-sm ${mutedTextColor}`}>check back soon</p>
          </div>
        )}

        {/* Creator Codes moved above */}

        {/* Footer CTA - hidden for Pro creators */}
        {creator.subscription_tier !== 'pro' && (
          <div className="pt-10 pb-6 space-y-3">
            <Link 
              href="https://loadout.fit/signup" 
              className="block w-full py-3 px-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] rounded-full text-center transition-all duration-200 group"
            >
              <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                claim your page on <span className="font-semibold text-emerald-400/80 group-hover:text-emerald-400">loadout.fit</span>
              </span>
            </Link>
            <p className="text-center text-[10px] text-white/20">free forever • no credit card</p>
          </div>
        )}
      </div>
    </div>
  );
}