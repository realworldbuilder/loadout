'use client';

import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Check, Star, Grid3X3, ChevronDown, ChevronUp } from 'lucide-react';
import { CreatorCode, CodePick } from '@/types/codes';

interface CreatorCodesProps {
  creator_id: string;
  compact?: boolean;
}

export default function CreatorCodes({ creator_id, compact = true }: CreatorCodesProps) {
  const [codes, setCodes] = useState<CreatorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());

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

  async function handleShopClick(codeId: string, storeUrl: string) {
    // Track the click
    fetch('/api/codes/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeId, action: 'click' }),
    }).catch(console.error);

    // Open in new tab
    window.open(storeUrl, '_blank');
  }

  async function handlePickClick(pickId: string, productUrl: string) {
    // Track the pick click
    fetch('/api/codes/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pick_click', pickId }),
    }).catch(console.error);

    // Open in new tab
    window.open(productUrl, '_blank');
  }

  function toggleCodeExpanded(codeId: string) {
    const newExpanded = new Set(expandedCodes);
    if (newExpanded.has(codeId)) {
      newExpanded.delete(codeId);
    } else {
      newExpanded.add(codeId);
    }
    setExpandedCodes(newExpanded);
  }

  if (loading) {
    return (
      <div className="py-4">
        <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white/60 rounded-full mx-auto"></div>
      </div>
    );
  }

  if (codes.length === 0) {
    return null; // Don't render if no codes
  }

  const availableCategories = categories.filter(cat => {
    if (cat.id === 'all') return true;
    if (cat.id === 'featured') return codes.some(code => code.is_featured);
    return codes.some(code => code.category === cat.id);
  });

  return (
    <div className="mb-6">
      {/* Small label */}
      <h3 className="text-sm font-medium text-white/60 mb-3 lowercase">codes</h3>
      
      {/* Category filter pills - only show if multiple categories */}
      {availableCategories.length > 1 && codes.length >= 5 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {availableCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors lowercase ${
                activeCategory === category.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      {/* Codes list */}
      {filteredCodes.length === 0 ? (
        <p className="text-white/40 text-sm py-4 lowercase">no codes in this category</p>
      ) : (
        <div className="space-y-0">
          {filteredCodes.map((code, index) => {
            const isExpanded = expandedCodes.has(code.id);
            const hasPicks = code.picks && code.picks.length > 0;
            const isLastItem = index === filteredCodes.length - 1;
            
            return (
              <div
                key={code.id}
                className={`relative bg-transparent border-white/10 ${
                  (!isExpanded && !isLastItem) ? 'border-b' : ''
                } ${code.is_featured ? 'border-l-2 border-l-emerald-500 pl-2' : ''}`}
                style={{
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Main code row */}
                <div 
                  className={`flex items-center gap-3 h-12 px-0 py-2 ${
                    hasPicks ? 'cursor-pointer hover:bg-white/5' : ''
                  }`}
                  onClick={hasPicks ? () => toggleCodeExpanded(code.id) : undefined}
                >
                  {/* Brand logo */}
                  <div className="w-6 h-6 flex-shrink-0">
                    {code.brand_logo_url ? (
                      <img
                        src={code.brand_logo_url}
                        alt={code.brand_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white/60">
                          {code.brand_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Brand name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate lowercase">
                        {code.brand_name}
                      </p>
                      {hasPicks && (
                        <div className="flex items-center gap-1">
                          <Grid3X3 className="h-3 w-3 text-white/40" />
                          <span className="text-xs text-white/40">{code.picks?.length || 0}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 text-white/40" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-white/40" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Code in mono font */}
                  <div className="flex-shrink-0">
                    <span className="text-sm font-bold font-mono text-white bg-white/5 px-2 py-1 rounded border border-white/10">
                      {code.code_text}
                    </span>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(code.id, code.code_text);
                    }}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    title="tap to copy"
                  >
                    {copiedCode === code.id ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-white/60" />
                    )}
                  </button>

                  {/* Shop arrow */}
                  {code.store_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShopClick(code.id, code.store_url!);
                      }}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      title="shop"
                    >
                      <ExternalLink className="h-3 w-3 text-white/60" />
                    </button>
                  )}

                  {/* Featured star indicator */}
                  {code.is_featured && (
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
                      <Star className="h-3 w-3 text-emerald-500 fill-current" />
                    </div>
                  )}
                </div>

                {/* Expanded picks section */}
                {hasPicks && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="py-3 pl-8">
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {code.picks?.map((pick) => (
                          <button
                            key={pick.id}
                            onClick={() => handlePickClick(pick.id, pick.product_url)}
                            className="flex-shrink-0 group"
                            title={pick.title}
                          >
                            <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                              {pick.image_url ? (
                                <img
                                  src={pick.image_url}
                                  alt={pick.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-xs text-white/40 text-center px-1">
                                    {pick.title.split(' ')[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-white/60 mt-1 text-center truncate w-16 lowercase">
                              {pick.title}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom border for expanded items or last item */}
                {(isExpanded || isLastItem) && !isLastItem && (
                  <div className="border-b border-white/10" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}