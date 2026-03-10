'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Filter,
  TrendingUp,
  Star,
  Users,
  Tag,
  ShoppingBag,
  Heart,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

// Mock data - to be replaced with Supabase queries later
const featuredCreators = [
  {
    id: '1',
    handle: 'jessicafit',
    displayName: 'jessica chen',
    bio: 'transform your body in 12 weeks',
    bannerImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    followers: 125000,
    niche: 'strength training',
    verified: true
  },
  {
    id: '2',
    handle: 'mikelift',
    displayName: 'mike torres',
    bio: 'powerlifting made simple',
    bannerImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=400&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    followers: 89000,
    niche: 'powerlifting',
    verified: true
  },
  {
    id: '3',
    handle: 'sarahsweat',
    displayName: 'sarah jones',
    bio: 'hiit workouts for busy people',
    bannerImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
    followers: 67000,
    niche: 'cardio',
    verified: false
  }
];

const categories = [
  { id: 'all', name: 'all', icon: Filter },
  { id: 'programs', name: 'training programs', icon: TrendingUp },
  { id: 'nutrition', name: 'meal plans', icon: Heart },
  { id: 'coaching', name: 'coaching', icon: Users },
  { id: 'codes', name: 'discount codes', icon: Tag },
  { id: 'picks', name: 'picks', icon: Star },
  { id: 'apparel', name: 'apparel', icon: ShoppingBag }
];

const trendingCreators = [
  {
    id: '1',
    handle: 'alexfit',
    displayName: 'alex kim',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
    followers: 45000,
    niche: 'calisthenics',
    verified: false
  },
  {
    id: '2',
    handle: 'emilyyoga',
    displayName: 'emily watson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1506629905607-cdedb65d8448?w=400&h=200&fit=crop',
    followers: 32000,
    niche: 'yoga',
    verified: true
  },
  {
    id: '3',
    handle: 'jasonbeast',
    displayName: 'jason lee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=200&fit=crop',
    followers: 78000,
    niche: 'bodybuilding',
    verified: true
  },
  {
    id: '4',
    handle: 'mariastrong',
    displayName: 'maria rodriguez',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
    followers: 23000,
    niche: 'crossfit',
    verified: false
  }
];

const hotCodes = [
  {
    id: '1',
    code: 'JARET10',
    brand: 'youngla',
    brandLogo: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=100&h=100&fit=crop',
    discount: '10% off',
    expiresAt: '2026-03-15',
    creator: 'jaret campisi'
  },
  {
    id: '2',
    code: 'MIKE15',
    brand: 'gorilla mode',
    brandLogo: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=100&h=100&fit=crop',
    discount: '15% off',
    expiresAt: '2026-03-20',
    creator: 'mike israetel'
  },
  {
    id: '3',
    code: 'SARAH20',
    brand: 'alo yoga',
    brandLogo: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=100&h=100&fit=crop',
    discount: '20% off',
    expiresAt: '2026-03-18',
    creator: 'sarah johnson'
  }
];

const curatedPicks = [
  {
    id: '1',
    name: 'whey protein powder',
    brand: 'optimum nutrition',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop',
    price: '$39.99',
    creator: 'mike torres',
    category: 'supplements'
  },
  {
    id: '2',
    name: 'resistance bands set',
    brand: 'bodylastics',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    price: '$29.99',
    creator: 'alex kim',
    category: 'equipment'
  },
  {
    id: '3',
    name: 'yoga mat',
    brand: 'manduka',
    image: 'https://images.unsplash.com/photo-1506629905607-cdedb65d8448?w=300&h=300&fit=crop',
    price: '$89.99',
    creator: 'emily watson',
    category: 'equipment'
  },
  {
    id: '4',
    name: 'pre-workout',
    brand: 'c4 energy',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop',
    price: '$24.99',
    creator: 'jason lee',
    category: 'supplements'
  }
];

export default function DiscoverPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentFeatured, setCurrentFeatured] = useState(0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0a]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl">🏋️</span>
                <span className="text-lg font-bold tracking-tight lowercase">loadout</span>
                <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">.fit</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-4 text-sm">
                <Link href="/discover" className="text-emerald-400 font-medium lowercase">
                  discover
                </Link>
                <Link href="/" className="text-white/60 hover:text-white transition-colors lowercase">
                  home
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
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

      {/* Hero Section - Featured Creators Carousel */}
      <section className="pt-20 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-bold lowercase">featured creators</h1>
          </div>

          <div className="relative overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentFeatured * 100}%)` }}
            >
              {featuredCreators.map((creator, index) => (
                <div key={creator.id} className="w-full flex-shrink-0">
                  <div className="relative h-[300px] sm:h-[400px] bg-[#171717] rounded-2xl border border-white/10 overflow-hidden group cursor-pointer">
                    <img 
                      src={creator.bannerImage} 
                      alt={creator.displayName}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <div className="flex items-end gap-4">
                        <img 
                          src={creator.avatar} 
                          alt={creator.displayName}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl sm:text-2xl font-bold lowercase">@{creator.handle}</h3>
                            {creator.verified && (
                              <Star className="h-5 w-5 text-emerald-400 fill-current" />
                            )}
                          </div>
                          <p className="text-white/80 text-sm sm:text-base mb-2 lowercase">{creator.bio}</p>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {creator.followers.toLocaleString()}
                            </span>
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs lowercase">
                              {creator.niche}
                            </span>
                          </div>
                        </div>
                        <Link 
                          href={`/${creator.handle}`}
                          className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors lowercase"
                        >
                          view profile
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {featuredCreators.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeatured(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentFeatured ? 'bg-emerald-400' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Chips */}
      <section className="pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors lowercase ${
                    isSelected 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#171717] text-white/70 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Creators */}
      <section className="pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold lowercase">trending creators</h2>
            </div>
            <Link href="/creators" className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors lowercase">
              view all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingCreators.map((creator) => (
              <Link key={creator.id} href={`/${creator.handle}`}>
                <div className="bg-[#171717] rounded-xl border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all group">
                  <div className="relative h-24 overflow-hidden">
                    <img 
                      src={creator.bannerImage} 
                      alt=""
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <img 
                        src={creator.avatar} 
                        alt={creator.displayName}
                        className="w-12 h-12 rounded-full border border-white/20 -mt-8 relative z-10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className="font-bold text-sm lowercase truncate">@{creator.handle}</h3>
                          {creator.verified && (
                            <Star className="h-3 w-3 text-emerald-400 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-white/60 text-xs mb-2 lowercase">{creator.displayName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/50 text-xs">
                            {creator.followers.toLocaleString()} followers
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] lowercase">
                            {creator.niche}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Collabs / Hot Codes */}
      <section className="pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold lowercase">hot codes</h2>
            </div>
            <Link href="/codes" className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors lowercase">
              view all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotCodes.map((code) => (
              <div key={code.id} className="bg-[#171717] rounded-xl border border-white/10 p-4 hover:border-emerald-500/30 transition-all group cursor-pointer">
                <div className="flex items-center gap-4 mb-3">
                  <img 
                    src={code.brandLogo} 
                    alt={code.brand}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-emerald-400 text-lg">{code.code}</span>
                      <ChevronRight className="h-4 w-4 text-white/40" />
                      <span className="font-semibold lowercase">{code.brand}</span>
                    </div>
                    <p className="text-white/60 text-sm lowercase">by {code.creator}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                    {code.discount}
                  </span>
                  <span className="text-white/40 text-xs">
                    expires {new Date(code.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Picks Feed */}
      <section className="pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold lowercase">curator picks</h2>
            </div>
            <Link href="/picks" className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors lowercase">
              view all
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {curatedPicks.map((pick) => (
              <div key={pick.id} className="bg-[#171717] rounded-xl border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all group cursor-pointer">
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={pick.image} 
                    alt={pick.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 right-2">
                    <ExternalLink className="h-4 w-4 text-white/60" />
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 lowercase line-clamp-2">{pick.name}</h3>
                  <p className="text-white/60 text-xs mb-2 lowercase">{pick.brand}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{pick.price}</span>
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] lowercase">
                      {pick.category}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mt-2 lowercase">picked by @{pick.creator}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span>🏋️</span>
            <span className="text-sm font-semibold lowercase">loadout.fit</span>
            <span className="text-xs text-white/40 lowercase">— discover fitness creators</span>
          </div>
          <p className="text-xs text-white/40">&copy; 2026 loadout</p>
        </div>
      </footer>
    </div>
  );
}