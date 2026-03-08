'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter,
  Tag,
  ChevronDown,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Heart,
  X,
  Image
} from 'lucide-react';

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
  brand_name: string;
  code_text: string;
}

type SortOption = 'newest' | 'title' | 'collection' | 'clicks';
type FilterOption = 'all' | 'with-code' | 'no-code';

export default function PicksPage() {
  const { user, profile, initializing } = useAuth();
  const [picks, setPicks] = useState<CreatorPick[]>([]);
  const [filteredPicks, setFilteredPicks] = useState<CreatorPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPick, setEditingPick] = useState<CreatorPick | null>(null);
  const [codes, setCodes] = useState<CreatorCode[]>([]);

  useEffect(() => {
    if (profile) {
      loadPicks();
      loadCodes();
    }
  }, [profile]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [picks, searchTerm, sortBy, filterBy, selectedCollection]);

  async function loadPicks() {
    if (!profile) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/picks?creator_id=${profile.id}`);
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
    if (!profile) return;

    try {
      const res = await fetch(`/api/codes?creator_id=${profile.id}`);
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

  function applyFiltersAndSort() {
    let filtered = [...picks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(pick =>
        pick.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pick.product_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pick.collection?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter by code
    if (filterBy === 'with-code') {
      filtered = filtered.filter(pick => pick.code_id);
    } else if (filterBy === 'no-code') {
      filtered = filtered.filter(pick => !pick.code_id);
    }

    // Apply collection filter
    if (selectedCollection !== 'all') {
      filtered = filtered.filter(pick => pick.collection === selectedCollection);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'collection':
          return (a.collection || '').localeCompare(b.collection || '');
        case 'clicks':
          return b.click_count - a.click_count;
        default:
          return 0;
      }
    });

    setFilteredPicks(filtered);
  }

  async function handleDeletePick(pickId: string) {
    if (!window.confirm('are you sure you want to delete this pick? this action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch('/api/picks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pickId }),
      });
      
      if (!res.ok) {
        console.error('Error deleting pick');
        return;
      }

      setPicks(picks.filter(pick => pick.id !== pickId));
    } catch (error) {
      console.error('Error deleting pick:', error);
    }
  }

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'newest': return 'newest';
      case 'title': return 'title a-z';
      case 'collection': return 'collection';
      case 'clicks': return 'most clicked';
    }
  };

  const getFilterLabel = (filter: FilterOption) => {
    switch (filter) {
      case 'all': return 'all picks';
      case 'with-code': return 'with code';
      case 'no-code': return 'no code';
    }
  };

  // Get unique collections
  const collections = Array.from(new Set(picks.map(pick => pick.collection).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-400 dark:border-white/60 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-white/60 lowercase">loading picks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 lowercase">picks</h1>
          <p className="text-gray-500 dark:text-white/60 lowercase">
            share your favorite products with followers
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingPick(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors lowercase mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          add pick
        </button>
      </div>

      {picks.length === 0 ? (
        /* Empty state */
        <div className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg p-12 text-center">
          <Heart className="h-16 w-16 text-gray-300 dark:text-white/20 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 lowercase">no picks yet</h3>
          <p className="text-gray-500 dark:text-white/60 mb-8 lowercase">
            add your favorite products to share with followers
          </p>
          <button
            onClick={() => {
              setEditingPick(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors lowercase"
          >
            <Plus className="h-4 w-4 mr-2" />
            add your first pick
          </button>
        </div>
      ) : (
        <>
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="search picks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-emerald-500 lowercase"
              />
            </div>

            {/* Collection filter */}
            {collections.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCollectionDropdown(!showCollectionDropdown);
                    setShowSortDropdown(false);
                    setShowFilterDropdown(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white hover:border-emerald-500 transition-colors lowercase min-w-[150px] justify-between"
                >
                  <span>{selectedCollection === 'all' ? 'all collections' : selectedCollection}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showCollectionDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20">
                    <button
                      onClick={() => {
                        setSelectedCollection('all');
                        setShowCollectionDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors first:rounded-t-lg lowercase ${
                        selectedCollection === 'all' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white/80'
                      }`}
                    >
                      all collections
                    </button>
                    {collections.map((collection) => (
                      <button
                        key={collection}
                        onClick={() => {
                          setSelectedCollection(collection);
                          setShowCollectionDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors last:rounded-b-lg lowercase ${
                          selectedCollection === collection ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white/80'
                        }`}
                      >
                        {collection}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                  setShowCollectionDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white hover:border-emerald-500 transition-colors lowercase min-w-[150px] justify-between"
              >
                <span>sort: {getSortLabel(sortBy)}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20">
                  {(['newest', 'title', 'collection', 'clicks'] as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg lowercase ${
                        sortBy === option ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white/80'
                      }`}
                    >
                      {getSortLabel(option)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowSortDropdown(false);
                  setShowCollectionDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white hover:border-emerald-500 transition-colors lowercase min-w-[120px] justify-between"
              >
                <span>{getFilterLabel(filterBy)}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20">
                  {(['all', 'with-code', 'no-code'] as FilterOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setFilterBy(option);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg lowercase ${
                        filterBy === option ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white/80'
                      }`}
                    >
                      {getFilterLabel(option)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Picks grid */}
          {filteredPicks.length === 0 ? (
            <div className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg p-8 text-center">
              <Heart className="h-12 w-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60 lowercase">no picks match your search</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPicks.map((pick) => {
                const linkedCode = codes.find(code => code.id === pick.code_id);
                return (
                  <div key={pick.id} className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg p-6 transition-all duration-200 hover:border-emerald-500/50 group">
                    <div className="flex items-center gap-4">
                      {/* Product image */}
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-200 dark:bg-white/10 rounded-lg overflow-hidden">
                        {pick.image_url ? (
                          <img
                            src={pick.image_url}
                            alt={pick.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-6 w-6 text-gray-400 dark:text-white/40" />
                          </div>
                        )}
                      </div>

                      {/* Pick info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate lowercase">
                            {pick.title}
                          </h3>
                          
                          {/* Linked code badge */}
                          {linkedCode && (
                            <span className="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                              {linkedCode.code_text}
                            </span>
                          )}

                          {/* Collection tag */}
                          {pick.collection && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 text-xs rounded-full">
                              {pick.collection}
                            </span>
                          )}

                          {/* Click count */}
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-white/50">
                            <Eye className="h-3 w-3" />
                            <span>{pick.click_count}</span>
                          </div>
                        </div>

                        <a
                          href={pick.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-500 dark:text-white/60 hover:text-emerald-500 transition-colors truncate block"
                        >
                          {pick.product_url}
                        </a>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={pick.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                          title="view product"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        
                        <button
                          onClick={() => {
                            setEditingPick(pick);
                            setShowModal(true);
                          }}
                          className="p-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                          title="edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeletePick(pick.id)}
                          className="p-2 bg-gray-100 dark:bg-white/10 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <PickModal
          pick={editingPick}
          codes={codes}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingPick(null);
          }}
          onSave={() => {
            loadPicks();
            setShowModal(false);
            setEditingPick(null);
          }}
          creatorId={profile?.id}
        />
      )}

      {/* Click outside handler */}
      {(showSortDropdown || showFilterDropdown || showCollectionDropdown) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowSortDropdown(false);
            setShowFilterDropdown(false);
            setShowCollectionDropdown(false);
          }} 
        />
      )}
    </div>
  );
}

function PickModal({ 
  pick, 
  codes,
  isOpen, 
  onClose, 
  onSave, 
  creatorId 
}: { 
  pick: CreatorPick | null;
  codes: CreatorCode[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  creatorId?: string;
}) {
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    product_url: '',
    code_id: '',
    collection: ''
  });
  const [loading, setLoading] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);

  useEffect(() => {
    if (pick) {
      setFormData({
        title: pick.title,
        image_url: pick.image_url || '',
        product_url: pick.product_url,
        code_id: pick.code_id || '',
        collection: pick.collection || ''
      });
    } else {
      setFormData({
        title: '',
        image_url: '',
        product_url: '',
        code_id: '',
        collection: ''
      });
    }
    setScrapingUrl(false);
  }, [pick, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!creatorId) return;

    setLoading(true);
    
    try {
      const res = await fetch('/api/picks', {
        method: pick ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(pick && { id: pick.id }),
          creator_id: creatorId,
          ...formData,
          code_id: formData.code_id || null,
          collection: formData.collection || null
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Error saving pick:', error);
        return;
      }

      onSave();
    } catch (error) {
      console.error('Error saving pick:', error);
    } finally {
      setLoading(false);
    }
  }

  async function scrapeUrl(url: string) {
    if (!url || !url.startsWith('http')) return;

    try {
      setScrapingUrl(true);
      const res = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        console.error('Error scraping URL');
        return;
      }

      const result = await res.json();
      
      // Always fill from scrape results
      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        image_url: result.image || prev.image_url,
      }));
    } catch (error) {
      console.error('Error scraping URL:', error);
    } finally {
      setScrapingUrl(false);
    }
  }

  async function handleFetchUrl() {
    const url = formData.product_url.trim();
    if (!url || !url.startsWith('http')) return;
    await scrapeUrl(url);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white lowercase">
            {pick ? 'edit pick' : 'add new pick'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Step 1: Paste URL + Fetch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
              product url *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.product_url}
                onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                className="flex-1 px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                placeholder="paste product link..."
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handleFetchUrl}
                disabled={scrapingUrl || !formData.product_url.startsWith('http')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors lowercase flex items-center gap-2"
              >
                {scrapingUrl ? (
                  <>
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                    fetching...
                  </>
                ) : (
                  'fetch'
                )}
              </button>
            </div>
          </div>

          {/* Preview card after fetch */}
          {(formData.title || formData.image_url) && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex gap-3 items-start">
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{formData.title || 'untitled'}</p>
                <p className="text-xs text-gray-500 dark:text-white/40 truncate">{formData.product_url}</p>
              </div>
            </div>
          )}

          {/* Title (editable, auto-filled by fetch) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
              title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              placeholder="auto-filled from url, or type manually"
            />
          </div>

          {/* Image URL (hidden unless they want to override) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
              image url <span className="text-white/40">(auto-filled)</span>
            </label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              placeholder="auto-filled from url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
              linked code
            </label>
            <select
              value={formData.code_id}
              onChange={(e) => setFormData({ ...formData, code_id: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">no linked code</option>
              {codes.map((code) => (
                <option key={code.id} value={code.id}>
                  {code.brand_name} - {code.code_text}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
              collection
            </label>
            <input
              type="text"
              value={formData.collection}
              onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              placeholder="gym bag, supplement stack..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-white/80 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors lowercase"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors lowercase"
            >
              {loading ? 'saving...' : (pick ? 'update' : 'create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}