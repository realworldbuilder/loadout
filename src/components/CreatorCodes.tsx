'use client';

import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Check, Star } from 'lucide-react';

interface CreatorCode {
  id: string;
  creator_id: string;
  brand_name: string;
  brand_logo_url?: string;
  code_text: string;
  discount_description?: string;
  store_url?: string;
  category: string;
  is_featured: boolean;
  expires_at?: string;
  click_count: number;
  copy_count: number;
  created_at: string;
  updated_at: string;
}

interface CreatorCodesProps {
  creator_id: string;
}

export default function CreatorCodes({ creator_id }: CreatorCodesProps) {
  const [codes, setCodes] = useState<CreatorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'all' },
    { id: 'featured', label: 'featured' },
    { id: 'apparel', label: 'apparel' },
    { id: 'supplements', label: 'supplements' },
    { id: 'skincare', label: 'skincare' },
    { id: 'gear', label: 'gear' },
    { id: 'food', label: 'food' },
    { id: 'other', label: 'other' }
  ];

  useEffect(() => {
    loadCodes();
  }, [creator_id]);

  async function loadCodes() {
    try {
      setLoading(true);
      const res = await fetch(`/api/codes?creator_id=${creator_id}&public=true`);
      const result = await res.json();
      
      if (res.ok) {
        setCodes(result.data || []);
      } else {
        console.error('Error loading codes:', result.error);
      }
    } catch (error) {
      console.error('Error loading codes:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCodes = codes
    .filter(code => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'featured') return code.is_featured;
      return code.category === activeCategory;
    })
    .sort((a, b) => {
      // Featured codes first
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  async function handleCopyCode(codeId: string, codeText: string) {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCode(codeId);
      
      // Track the copy
      fetch('/api/codes/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeId, action: 'copy' }),
      }).catch(console.error);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }

  async function handleShopNowClick(codeId: string, storeUrl: string) {
    // Track the click
    fetch('/api/codes/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeId, action: 'click' }),
    }).catch(console.error);

    // Open in new tab
    window.open(storeUrl, '_blank');
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-[#171717]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-gray-400 dark:border-white/60 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-white/60 lowercase">loading codes...</p>
          </div>
        </div>
      </section>
    );
  }

  if (codes.length === 0) {
    return null; // Don't render section if no codes
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-[#171717]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 lowercase">exclusive codes</h2>
          <p className="text-lg text-gray-600 dark:text-white/70 lowercase">
            save on my favorite brands and products
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories
            .filter(cat => {
              // Only show categories that have codes, plus 'all' and 'featured'
              if (cat.id === 'all') return true;
              if (cat.id === 'featured') return codes.some(code => code.is_featured);
              return codes.some(code => code.category === cat.id);
            })
            .map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors lowercase ${
                  activeCategory === category.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-white/80 border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/50'
                }`}
              >
                {category.label}
              </button>
            ))}
        </div>

        {/* Codes grid */}
        {filteredCodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-white/60 lowercase">no codes in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCodes.map((code) => (
              <div
                key={code.id}
                className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-lg group"
              >
                {/* Header with brand */}
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    {code.brand_logo_url ? (
                      <img
                        src={code.brand_logo_url}
                        alt={code.brand_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600 dark:text-white/60">
                          {code.brand_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {code.is_featured && (
                      <div className="ml-2">
                        <Star className="h-5 w-5 text-emerald-500 fill-current" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 lowercase">
                    {code.brand_name}
                  </h3>
                  
                  <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 text-sm rounded-full lowercase">
                    {code.category}
                  </span>
                </div>

                {/* Code section */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleCopyCode(code.id, code.code_text)}
                    className="w-full mb-4 group/code"
                  >
                    <div className="relative bg-emerald-50 dark:bg-emerald-500/10 border-2 border-dashed border-emerald-200 dark:border-emerald-500/20 rounded-lg p-4 transition-colors group-hover/code:border-emerald-300 dark:group-hover/code:border-emerald-400">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">
                          {code.code_text}
                        </span>
                        {copiedCode === code.id ? (
                          <Check className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Copy className="h-5 w-5 text-emerald-500 opacity-60 group-hover/code:opacity-100 transition-opacity" />
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-lg opacity-0 group-hover/code:opacity-100 transition-opacity"></div>
                    </div>
                  </button>
                  
                  {copiedCode === code.id && (
                    <p className="text-center text-emerald-600 dark:text-emerald-400 text-sm mb-4 lowercase">
                      copied to clipboard!
                    </p>
                  )}

                  {code.discount_description && (
                    <p className="text-center text-gray-600 dark:text-white/70 mb-6 lowercase">
                      {code.discount_description}
                    </p>
                  )}

                  {/* Expiry and shop button */}
                  <div className="space-y-4">
                    {code.expires_at && (
                      <p className="text-center text-sm text-gray-500 dark:text-white/50 lowercase">
                        expires {new Date(code.expires_at).toLocaleDateString()}
                      </p>
                    )}
                    
                    {code.store_url && (
                      <button
                        onClick={() => handleShopNowClick(code.id, code.store_url!)}
                        className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 lowercase"
                      >
                        <span>shop now</span>
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}