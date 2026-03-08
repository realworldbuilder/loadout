'use client';

import { useEffect, useState } from 'react';
import { Eye, Heart } from 'lucide-react';

interface CreatorPick {
  id: string;
  creator_id: string;
  code_id?: string;
  title: string;
  image_url?: string;
  product_url: string;
  collection?: string;
  sort_order: number;
  click_count: number;
  is_active: boolean;
  created_at: string;
}

interface CreatorCode {
  id: string;
  code_text: string;
}

interface CreatorPicksProps {
  creator_id: string;
  filterCollection?: string; // if set, only show picks from this collection
}

export default function CreatorPicks({ creator_id, filterCollection }: CreatorPicksProps) {
  const [picks, setPicks] = useState<CreatorPick[]>([]);
  const [codes, setCodes] = useState<CreatorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  useEffect(() => {
    loadPicks();
    loadCodes();
  }, [creator_id]);

  async function loadPicks() {
    try {
      const res = await fetch(`/api/picks?creator_id=${creator_id}&public=true`);
      const result = await res.json();
      
      if (!res.ok) {
        console.error('Error loading picks:', result.error);
        return;
      }

      setPicks(result.data || []);
    } catch (error) {
      console.error('Error loading picks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCodes() {
    try {
      const res = await fetch(`/api/codes?creator_id=${creator_id}&public=true`);
      const result = await res.json();
      
      if (!res.ok) {
        console.error('Error loading codes:', result.error);
        return;
      }

      setCodes(result.data || []);
    } catch (error) {
      console.error('Error loading codes:', error);
    }
  }

  async function trackClick(pickId: string) {
    try {
      await fetch('/api/codes/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pick_click',
          pickId: pickId
        }),
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  function handlePickClick(pick: CreatorPick) {
    trackClick(pick.id);
    window.open(pick.product_url, '_blank', 'noopener,noreferrer');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-20 space-y-2">
              <div className="w-20 h-20 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!picks.length) {
    return null;
  }

  // Pre-filter by collection prop if set
  const basePicks = filterCollection 
    ? picks.filter(pick => pick.collection === filterCollection)
    : picks;

  // Get unique collections (only relevant if no filterCollection set)
  const collections = filterCollection 
    ? [] 
    : Array.from(new Set(basePicks.map(pick => pick.collection).filter(Boolean))) as string[];
  
  // Filter picks by selected collection tab
  const filteredPicks = selectedCollection 
    ? basePicks.filter(pick => pick.collection === selectedCollection)
    : basePicks;

  return (
    <div className="space-y-4">
      {/* Section label */}
      <div className="flex items-center space-x-2">
        <Heart className="h-4 w-4 text-gray-500 dark:text-white/50" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-white/70 lowercase">picks</h3>
      </div>

      {/* Collection tabs */}
      {collections.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCollection(null)}
            className={`px-3 py-1 text-xs rounded-full flex-shrink-0 transition-colors lowercase ${
              selectedCollection === null
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
            }`}
          >
            all
          </button>
          {collections.map((collection) => (
            <button
              key={collection}
              onClick={() => setSelectedCollection(collection)}
              className={`px-3 py-1 text-xs rounded-full flex-shrink-0 transition-colors lowercase ${
                selectedCollection === collection
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
              }`}
            >
              {collection}
            </button>
          ))}
        </div>
      )}

      {/* Picks carousel */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {filteredPicks.map((pick) => {
          const linkedCode = codes.find(code => code.id === pick.code_id);
          
          return (
            <div
              key={pick.id}
              onClick={() => handlePickClick(pick)}
              className="flex-shrink-0 cursor-pointer group"
            >
              <div className="relative">
                {/* Product image */}
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-200">
                  {pick.image_url ? (
                    <img
                      src={pick.image_url}
                      alt={pick.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="h-8 w-8 text-gray-300 dark:text-white/20" />
                    </div>
                  )}
                </div>

                {/* Code badge overlay */}
                {linkedCode && (
                  <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    {linkedCode.code_text.length > 4 
                      ? linkedCode.code_text.substring(0, 2) 
                      : linkedCode.code_text
                    }
                  </div>
                )}
              </div>

              {/* Product title */}
              <div className="mt-2 w-20">
                <p className="text-xs text-gray-600 dark:text-white/60 text-center line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors lowercase">
                  {pick.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}