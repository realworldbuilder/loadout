'use client';

import { useState, useEffect } from 'react';
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
                <p className={`${mutedTextColor} leading-relaxed max-w-sm mx-auto mb-6 text-center`}>
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
              <p className={`${mutedTextColor} leading-relaxed max-w-md mx-auto mb-6 text-center text-lg`}>
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
              <p className={`${mutedTextColor} leading-relaxed max-w-sm mx-auto mb-6 text-center`}>
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

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <Link 
            href="https://loadout.fit" 
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors`}
          >
            powered by loadout.fit
          </Link>
        </div>
      </div>
    </div>
  );
}