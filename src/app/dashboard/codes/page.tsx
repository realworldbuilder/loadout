'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter,
  Tag,
  ChevronDown,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Copy,
  Eye,
  Calendar,
  Star,
  StarOff
} from 'lucide-react';

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

type SortOption = 'newest' | 'featured' | 'brand' | 'copies' | 'clicks';
type FilterOption = 'all' | 'featured' | 'apparel' | 'supplements' | 'skincare' | 'gear' | 'food' | 'other';

export default function CodesPage() {
  const { user, profile, initializing } = useAuth();
  const [codes, setCodes] = useState<CreatorCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<CreatorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<CreatorCode | null>(null);

  useEffect(() => {
    if (profile) {
      loadCodes();
    }
  }, [profile]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [codes, searchTerm, sortBy, filterBy]);

  async function loadCodes() {
    if (!profile) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/codes?creator_id=${profile.id}`);
      const result = await res.json();
      
      if (!res.ok) {
        console.error('Error loading codes:', result.error);
        return;
      }

      setCodes(result.data || []);
    } catch (error) {
      console.error('Error loading codes:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFiltersAndSort() {
    let filtered = [...codes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(code =>
        code.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.code_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.discount_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      if (filterBy === 'featured') {
        filtered = filtered.filter(code => code.is_featured);
      } else {
        filtered = filtered.filter(code => code.category === filterBy);
      }
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'featured':
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'brand':
          return a.brand_name.localeCompare(b.brand_name);
        case 'copies':
          return b.copy_count - a.copy_count;
        case 'clicks':
          return b.click_count - a.click_count;
        default:
          return 0;
      }
    });

    setFilteredCodes(filtered);
  }

  async function handleToggleFeatured(codeId: string, currentStatus: boolean) {
    try {
      const res = await fetch('/api/codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: codeId, is_featured: !currentStatus }),
      });
      
      if (!res.ok) {
        console.error('Error toggling featured status');
        return;
      }

      setCodes(codes.map(code => 
        code.id === codeId 
          ? { ...code, is_featured: !currentStatus }
          : code
      ));
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  }

  async function handleDeleteCode(codeId: string) {
    if (!window.confirm('are you sure you want to delete this code? this action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch('/api/codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: codeId }),
      });
      
      if (!res.ok) {
        console.error('Error deleting code');
        return;
      }

      setCodes(codes.filter(code => code.id !== codeId));
    } catch (error) {
      console.error('Error deleting code:', error);
    }
  }

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'newest': return 'newest';
      case 'featured': return 'featured first';
      case 'brand': return 'brand a-z';
      case 'copies': return 'most copied';
      case 'clicks': return 'most clicked';
    }
  };

  const getFilterLabel = (filter: FilterOption) => {
    return filter === 'all' ? 'all categories' : filter;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-400 dark:border-white/60 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-white/60 lowercase">loading codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 lowercase">codes</h1>
          <p className="text-gray-500 dark:text-white/60 lowercase">
            manage your discount codes and affiliate links
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingCode(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors lowercase mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          add code
        </button>
      </div>

      {codes.length === 0 ? (
        /* Empty state */
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-12 text-center">
          <Tag className="h-16 w-16 text-gray-300 dark:text-white/20 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 lowercase">no codes yet</h3>
          <p className="text-gray-500 dark:text-white/60 mb-8 lowercase">
            add discount codes to share with your audience
          </p>
          <button
            onClick={() => {
              setEditingCode(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors lowercase"
          >
            <Plus className="h-4 w-4 mr-2" />
            add your first code
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
                placeholder="search codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-emerald-500 lowercase"
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white hover:border-emerald-500 transition-colors lowercase min-w-[180px] justify-between"
              >
                <span>sort: {getSortLabel(sortBy)}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20">
                  {(['newest', 'featured', 'brand', 'copies', 'clicks'] as SortOption[]).map((option) => (
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
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white hover:border-emerald-500 transition-colors lowercase min-w-[150px] justify-between"
              >
                <span>{getFilterLabel(filterBy)}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20">
                  {(['all', 'featured', 'apparel', 'supplements', 'skincare', 'gear', 'food', 'other'] as FilterOption[]).map((option) => (
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

          {/* Codes grid */}
          {filteredCodes.length === 0 ? (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-8 text-center">
              <Tag className="h-12 w-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60 lowercase">no codes match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCodes.map((code) => (
                <div key={code.id} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden transition-all duration-200 hover:border-emerald-500/50 group">
                  {/* Header with brand */}
                  <div className="p-4 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {code.brand_logo_url ? (
                          <img
                            src={code.brand_logo_url}
                            alt={code.brand_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-white/60">
                              {code.brand_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white lowercase">{code.brand_name}</h3>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 rounded-full lowercase">
                            {code.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleFeatured(code.id, code.is_featured)}
                          className={`p-2 rounded-lg transition-colors ${
                            code.is_featured 
                              ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' 
                              : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
                          }`}
                          title={code.is_featured ? 'remove from featured' : 'mark as featured'}
                        >
                          {code.is_featured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditingCode(code);
                            setShowModal(true);
                          }}
                          className="p-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                          title="edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteCode(code.id)}
                          className="p-2 bg-gray-100 dark:bg-white/10 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Code */}
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-dashed border-emerald-200 dark:border-emerald-500/20 rounded-lg">
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">
                          {code.code_text}
                        </span>
                      </div>
                      {code.is_featured && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            featured
                          </span>
                        </div>
                      )}
                    </div>

                    {code.discount_description && (
                      <p className="text-center text-gray-600 dark:text-white/60 text-sm mb-4 lowercase">
                        {code.discount_description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/50 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Copy className="h-3 w-3" />
                          <span>{code.copy_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{code.click_count}</span>
                        </div>
                      </div>
                      {code.expires_at && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>expires {new Date(code.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Store link */}
                    {code.store_url && (
                      <a
                        href={code.store_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        shop now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <CodeModal
          code={editingCode}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingCode(null);
          }}
          onSave={() => {
            loadCodes();
            setShowModal(false);
            setEditingCode(null);
          }}
          creatorId={profile?.id}
        />
      )}

      {/* Click outside handler */}
      {(showSortDropdown || showFilterDropdown) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowSortDropdown(false);
            setShowFilterDropdown(false);
          }} 
        />
      )}
    </div>
  );
}

function CodeModal({ 
  code, 
  isOpen, 
  onClose, 
  onSave, 
  creatorId 
}: { 
  code: CreatorCode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  creatorId?: string;
}) {
  const [formData, setFormData] = useState({
    brand_name: '',
    brand_logo_url: '',
    code_text: '',
    discount_description: '',
    store_url: '',
    category: 'other',
    is_featured: false,
    expires_at: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (code) {
      setFormData({
        brand_name: code.brand_name,
        brand_logo_url: code.brand_logo_url || '',
        code_text: code.code_text,
        discount_description: code.discount_description || '',
        store_url: code.store_url || '',
        category: code.category,
        is_featured: code.is_featured,
        expires_at: code.expires_at ? code.expires_at.split('T')[0] : ''
      });
    } else {
      setFormData({
        brand_name: '',
        brand_logo_url: '',
        code_text: '',
        discount_description: '',
        store_url: '',
        category: 'other',
        is_featured: false,
        expires_at: ''
      });
    }
  }, [code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!creatorId) return;

    setLoading(true);
    
    try {
      const res = await fetch('/api/codes', {
        method: code ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(code && { id: code.id }),
          creator_id: creatorId,
          ...formData,
          expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Error saving code:', error);
        return;
      }

      onSave();
    } catch (error) {
      console.error('Error saving code:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/10 w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white lowercase">
            {code ? 'edit code' : 'add new code'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
              brand name *
            </label>
            <input
              type="text"
              required
              value={formData.brand_name}
              onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              placeholder="nike"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
              code text *
            </label>
            <input
              type="text"
              required
              value={formData.code_text}
              onChange={(e) => setFormData({ ...formData, code_text: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              placeholder="SAVE20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
              discount description
            </label>
            <input
              type="text"
              value={formData.discount_description}
              onChange={(e) => setFormData({ ...formData, discount_description: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              placeholder="20% off everything"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
              store url
            </label>
            <input
              type="url"
              value={formData.store_url}
              onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              placeholder="https://nike.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
                category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="apparel">apparel</option>
                <option value="supplements">supplements</option>
                <option value="skincare">skincare</option>
                <option value="gear">gear</option>
                <option value="food">food</option>
                <option value="other">other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
                expires
              </label>
              <input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1 lowercase">
              brand logo url
            </label>
            <input
              type="url"
              value={formData.brand_logo_url}
              onChange={(e) => setFormData({ ...formData, brand_logo_url: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 text-emerald-500 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded focus:ring-emerald-500 focus:ring-2"
            />
            <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700 dark:text-white/80 lowercase">
              mark as featured
            </label>
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
              {loading ? 'saving...' : (code ? 'update' : 'create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}