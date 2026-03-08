'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FITNESS_BRANDS, Brand } from '@/lib/brands';
import { Search } from 'lucide-react';

interface BrandResult {
  name: string;
  domain: string;
  icon: string;
  brandId: string;
}

interface SearchResult {
  type: 'preset' | 'brand';
  name: string;
  image: string;
  url: string;
  category: string;
  brand?: Brand;
}

interface SelectedBrand {
  name: string;
  logoUrl: string;
  url: string;
  category: string;
}

interface BrandAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBrandSelect: (brand: SelectedBrand) => void;
  placeholder?: string;
  className?: string;
}

export function BrandAutocomplete({ 
  value, 
  onChange, 
  onBrandSelect, 
  placeholder = "search brands...",
  className = ""
}: BrandAutocompleteProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const lower = q.toLowerCase();

    // 1. Search preset fitness brands locally (instant)
    const presetMatches: SearchResult[] = FITNESS_BRANDS
      .filter(brand => brand.name.toLowerCase().includes(lower))
      .slice(0, 6)
      .map(brand => ({
        type: 'preset' as const,
        name: brand.name,
        image: brand.logoUrl,
        url: brand.url,
        category: brand.category,
        brand,
      }));

    // Show preset results immediately
    if (presetMatches.length > 0) {
      setResults(presetMatches);
      setIsOpen(true);
      setSelectedIndex(-1);
    }

    // 2. Search Brandfetch API (async) with 200ms debounce
    setIsLoading(true);
    try {
      const res = await fetch(`/api/brand-search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        const brandResults: SearchResult[] = (Array.isArray(data) ? data : [])
          .slice(0, 6)
          .map((b: BrandResult) => ({
            type: 'brand' as const,
            name: b.name,
            image: b.icon,
            url: `https://${b.domain}`,
            category: 'other', // External brands get 'other' category
          }));

        // Merge: presets first, then brands (dedupe by name)
        const seen = new Set(presetMatches.map(r => r.name.toLowerCase()));
        const merged = [
          ...presetMatches,
          ...brandResults.filter(b => !seen.has(b.name.toLowerCase())),
        ].slice(0, 10);

        setResults(merged);
        setIsOpen(merged.length > 0);
        setSelectedIndex(-1);
      }
    } catch {
      // Keep preset results if API fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(newValue), 200);
  };

  const selectResult = (result: SearchResult) => {
    onChange(result.name);
    onBrandSelect({
      name: result.name,
      logoUrl: result.image,
      url: result.url,
      category: result.category,
    });
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      selectResult(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-white/40" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
            else if (value) search(value);
          }}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-emerald-500 ${className}`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 dark:border-white/40 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl max-h-[320px] overflow-y-auto"
        >
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.name}-${index}`}
              onClick={() => selectResult(result)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-white/5 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-emerald-50 dark:bg-emerald-500/10'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <img
                src={result.image}
                alt={result.name}
                className="w-8 h-8 object-contain bg-white rounded-sm flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate lowercase">
                  {result.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-white/60 truncate lowercase">
                  {result.type === 'preset' ? result.category : 'from brandfetch'}
                </div>
              </div>
              {result.type === 'preset' && (
                <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full lowercase">
                  {result.category}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}