'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import {
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Link as LinkIcon,
  Package,
  Type,
  Tag,
  ExternalLink,
  User,
  Save,
  X,
  Shuffle,
  Check,
  Palette,
  Heart
} from 'lucide-react';
import { CreatorTheme, DEFAULT_THEME, PRESET_THEMES, PRESET_GRADIENTS } from '@/types/theme';
import { getThemeStyles, getThemeFontClass } from '@/lib/utils';
import ImageUpload from '@/components/ImageUpload';

// Product types
interface Product {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  price: number;
  product_type: 'digital_product' | 'coaching' | 'affiliate_link' | 'subscription' | 'link' | 'header' | 'codes_block' | 'picks_block';
  file_url?: string;
  thumbnail_url?: string;
  external_url?: string;
  cta_text?: string;
  is_active: boolean;
  sort_order: number;
  layout?: 'classic' | 'featured';
  created_at: string;
  updated_at: string;
}

// Add form state
interface AddFormState {
  type: 'link' | 'product' | 'header' | 'codes' | 'picks' | null;
  title: string;
  description: string;
  price: string;
  external_url: string;
  layout: 'classic' | 'featured';
}

// Edit form state
interface EditFormState {
  product: Product | null;
  title: string;
  description: string;
  price: string;
  external_url: string;
  layout: 'classic' | 'featured';
}

export default function PageBuilder() {
  const { user, profile, initializing, refreshProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  
  // Theme state
  const [theme, setTheme] = useState<CreatorTheme>(DEFAULT_THEME);
  const [themeSaving, setThemeSaving] = useState(false);
  
  // Add form state
  const [addForm, setAddForm] = useState<AddFormState>({
    type: null,
    title: '',
    description: '',
    price: '',
    external_url: '',
    layout: 'classic'
  });
  
  // Edit form state
  const [editForm, setEditForm] = useState<EditFormState>({
    product: null,
    title: '',
    description: '',
    price: '',
    external_url: '',
    layout: 'classic'
  });

  // Picks collections for the picks block selector
  const [picksCollections, setPicksCollections] = useState<string[]>([]);
  const [selectedPicksCollection, setSelectedPicksCollection] = useState<string>('all');

  // Fetch picks collections
  useEffect(() => {
    if (!profile?.id) return;
    fetch(`/api/picks?creator_id=${profile.id}`)
      .then(res => res.json())
      .then(result => {
        const collections = Array.from(new Set(
          (result.data || []).map((p: any) => p.collection).filter(Boolean)
        )) as string[];
        setPicksCollections(collections);
      })
      .catch(() => {});
  }, [profile?.id]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      const res = await fetch(`/api/products?creator_id=${profile.id}`);
      const { data } = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!initializing) {
      fetchProducts();
    }
  }, [initializing, fetchProducts]);

  // Load theme when profile changes
  useEffect(() => {
    if (profile?.theme) {
      setTheme({ ...DEFAULT_THEME, ...profile.theme });
    } else {
      setTheme(DEFAULT_THEME);
    }
  }, [profile]);

  // Handle drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    setProducts(items);

    // Update sort_order for affected items
    const updates = items.map((item, index) => ({
      id: item.id,
      sort_order: index
    }));

    try {
      // Batch update sort_order
      for (const update of updates) {
        await fetch('/api/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      // Revert on error
      fetchProducts();
    }
  };

  // Add new item
  const handleAdd = async () => {
    if (!addForm.type || !addForm.title.trim() || !profile?.id) return;
    
    setSaving(true);
    try {
      const newProduct = {
        creator_id: profile.id,
        title: addForm.type === 'codes' ? 'my codes' : 
               addForm.type === 'picks' ? (selectedPicksCollection === 'all' ? 'my picks' : `picks: ${selectedPicksCollection}`) : addForm.title,
        description: addForm.type === 'picks' ? (selectedPicksCollection || 'all') : (addForm.description || ''),
        price: addForm.type === 'header' ? 0 : Number(addForm.price) || 0,
        product_type: addForm.type === 'link' ? 'link' : 
                      addForm.type === 'header' ? 'header' :
                      addForm.type === 'codes' ? 'codes_block' :
                      addForm.type === 'picks' ? 'picks_block' : 'digital_product',
        external_url: addForm.external_url || '',
        cta_text: addForm.type === 'product' ? 'Purchase' : 'Visit',
        is_active: true,
        sort_order: products.length,
        layout: addForm.layout
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      if (res.ok) {
        // Reset form
        setAddForm({
          type: null,
          title: '',
          description: '',
          price: '',
          external_url: '',
          layout: 'classic'
        });
        
        // Refresh products
        fetchProducts();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setSaving(false);
    }
  };

  // Edit item
  const startEdit = (product: Product) => {
    setEditForm({
      product,
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      external_url: product.external_url || '',
      layout: product.layout || 'classic'
    });
  };

  const handleEdit = async () => {
    if (!editForm.product) return;
    
    setSaving(true);
    try {
      const updates = {
        id: editForm.product.id,
        title: editForm.title,
        description: editForm.description,
        price: editForm.product.product_type === 'header' ? 0 : Number(editForm.price) || 0,
        external_url: editForm.external_url,
        layout: editForm.layout
      };

      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        setEditForm({ product: null, title: '', description: '', price: '', external_url: '', layout: 'classic' });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setSaving(false);
    }
  };

  // Delete item
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Toggle active state
  const toggleActive = async (product: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          is_active: !product.is_active
        })
      });

      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error toggling active state:', error);
    }
  };

  // Get icon for product type
  const getProductIcon = (type: string) => {
    switch (type) {
      case 'link':
        return LinkIcon;
      case 'header':
        return Type;
      case 'codes_block':
        return Tag;
      case 'picks_block':
        return Heart;
      default:
        return Package;
    }
  };

  // Get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'link':
        return 'bg-blue-500/10 text-blue-400';
      case 'header':
        return 'bg-purple-500/10 text-purple-400';
      case 'codes_block':
        return 'bg-amber-500/10 text-amber-400';
      case 'picks_block':
        return 'bg-rose-500/10 text-rose-400';
      default:
        return 'bg-emerald-500/10 text-emerald-400';
    }
  };

  // Save theme
  const handleThemeSave = async () => {
    if (!user) return;
    
    setThemeSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, theme }),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        alert(`failed to save theme: ${result.error}`);
        return;
      }
      
      await refreshProfile();
    } catch (error) {
      console.error('Theme save error:', error);
      alert('failed to save theme');
    } finally {
      setThemeSaving(false);
    }
  };

  // Shuffle theme (pick random preset)
  const shuffleTheme = () => {
    const presetKeys = Object.keys(PRESET_THEMES);
    const randomPreset = presetKeys[Math.floor(Math.random() * presetKeys.length)];
    setTheme(PRESET_THEMES[randomPreset]);
  };

  if (initializing || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-white/60 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-white/60 lowercase">loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 lowercase">page builder</h1>
        <p className="text-gray-500 dark:text-white/60">drag and drop to build your public page</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 p-1 bg-white dark:bg-[#2f2f2f] rounded-lg border border-gray-200 dark:border-white/10 inline-flex">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all lowercase ${
              activeTab === 'content'
                ? 'bg-white/10 text-gray-900 dark:text-white'
                : 'text-white/50 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            content
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all lowercase ${
              activeTab === 'design'
                ? 'bg-white/10 text-gray-900 dark:text-white'
                : 'text-white/50 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            design
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Content or Design Controls */}
        <div className="space-y-6">
          {activeTab === 'content' && (
            <>
          {/* Add Buttons */}
          <div className="bg-white dark:bg-[#2f2f2f] rounded-lg border border-gray-200 dark:border-white/10 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lowercase">add blocks</h2>
            <div className="grid grid-cols-5 gap-3">
              <button
                onClick={() => setAddForm({ ...addForm, type: 'link' })}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                disabled={!!addForm.type}
              >
                <LinkIcon size={20} />
                <span className="text-sm lowercase">add link</span>
              </button>
              <button
                onClick={() => setAddForm({ ...addForm, type: 'product' })}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                disabled={!!addForm.type}
              >
                <Package size={20} />
                <span className="text-sm lowercase">add product</span>
              </button>
              <button
                onClick={() => setAddForm({ ...addForm, type: 'header' })}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                disabled={!!addForm.type}
              >
                <Type size={20} />
                <span className="text-sm lowercase">add header</span>
              </button>
              <button
                onClick={() => setAddForm({ ...addForm, type: 'codes' })}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                disabled={!!addForm.type || products.some(p => p.product_type === 'codes_block')}
              >
                <Tag size={20} />
                <span className="text-sm lowercase">add codes</span>
              </button>
              <button
                onClick={() => setAddForm({ ...addForm, type: 'picks' })}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                disabled={!!addForm.type}
              >
                <Heart size={20} />
                <span className="text-sm lowercase">add picks</span>
              </button>
            </div>
          </div>

          {/* Add Form */}
          {addForm.type && (
            <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white lowercase">add {addForm.type}</h3>
                <button
                  onClick={() => setAddForm({ type: null, title: '', description: '', price: '', external_url: '', layout: 'classic' })}
                  className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {/* Picks collection selector */}
                {addForm.type === 'picks' && (
                  <div>
                    <label className="text-gray-500 dark:text-white/60 text-xs mb-2 block lowercase">show collection</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPicksCollection('all')}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedPicksCollection === 'all'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        all picks
                      </button>
                      {picksCollections.map(col => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSelectedPicksCollection(col)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedPicksCollection === col
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                    {picksCollections.length === 0 && (
                      <p className="text-white/40 text-xs mt-2">no collections yet — add collections in the picks page</p>
                    )}
                  </div>
                )}

                {addForm.type !== 'codes' && addForm.type !== 'picks' && (
                  <div>
                    <input
                      type="text"
                      placeholder="title"
                      value={addForm.title}
                      onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:text-white/40 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                )}
                {addForm.type !== 'header' && addForm.type !== 'codes' && addForm.type !== 'picks' && (
                  <div>
                    <label className="text-gray-500 dark:text-white/60 text-xs mb-2 block lowercase">layout</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAddForm({ ...addForm, layout: 'classic' })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          addForm.layout === 'classic'
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-gray-200 dark:border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full border-2 ${addForm.layout === 'classic' ? 'border-emerald-500 bg-emerald-500' : 'border-white/30'}`} />
                          <span className="text-gray-900 dark:text-white text-sm font-medium">classic</span>
                        </div>
                        <p className="text-gray-400 dark:text-white/40 text-xs">compact row</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddForm({ ...addForm, layout: 'featured' })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          addForm.layout === 'featured'
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-gray-200 dark:border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full border-2 ${addForm.layout === 'featured' ? 'border-emerald-500 bg-emerald-500' : 'border-white/30'}`} />
                          <span className="text-gray-900 dark:text-white text-sm font-medium">featured</span>
                        </div>
                        <p className="text-gray-400 dark:text-white/40 text-xs">large card + thumbnail</p>
                      </button>
                    </div>
                  </div>
                )}
                {(addForm.type === 'product' || addForm.type === 'link') && (
                  <div>
                    <input
                      type="url"
                      placeholder="url"
                      value={addForm.external_url}
                      onChange={(e) => setAddForm({ ...addForm, external_url: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:text-white/40 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                )}
                {addForm.type === 'product' && (
                  <>
                    <div>
                      <textarea
                        placeholder="description"
                        value={addForm.description}
                        onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:text-white/40 focus:outline-none focus:border-emerald-500/50 resize-none h-20"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="price"
                        value={addForm.price}
                        onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:text-white/40 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </>
                )}
                <button
                  onClick={handleAdd}
                  disabled={(addForm.type !== 'codes' && addForm.type !== 'picks' && !addForm.title.trim()) || saving}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors"
                >
                  <Save size={16} />
                  {saving ? 'saving...' : 'add'}
                </button>
              </div>
            </div>
          )}

          {/* Products List */}
          <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lowercase">page blocks</h2>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="products">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {products.length === 0 ? (
                      <p className="text-gray-400 dark:text-white/40 text-center py-8 lowercase">no blocks yet. add some above!</p>
                    ) : (
                      products.map((product, index) => {
                        const Icon = getProductIcon(product.product_type);
                        const isEditing = editForm.product?.id === product.id;
                        
                        return (
                          <Draggable key={product.id} draggableId={product.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`
                                  bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3
                                  ${snapshot.isDragging ? 'ring-2 ring-emerald-500/50' : ''}
                                  ${!product.is_active ? 'opacity-50' : ''}
                                `}
                              >
                                {isEditing ? (
                                  // Edit form
                                  <div className="space-y-3">
                                    {product.product_type !== 'codes_block' && product.product_type !== 'picks_block' && (
                                      <div>
                                        <input
                                          type="text"
                                          value={editForm.title}
                                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                          className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-gray-900 dark:text-white text-sm"
                                        />
                                      </div>
                                    )}
                                    {product.product_type === 'digital_product' && (
                                      <>
                                        <div>
                                          <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-gray-900 dark:text-white text-sm resize-none h-16"
                                          />
                                        </div>
                                        <div>
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                            className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-gray-900 dark:text-white text-sm"
                                          />
                                        </div>
                                      </>
                                    )}
                                    {(product.product_type === 'digital_product' || product.product_type === 'link') && (
                                      <div>
                                        <input
                                          type="url"
                                          value={editForm.external_url}
                                          onChange={(e) => setEditForm({ ...editForm, external_url: e.target.value })}
                                          className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-gray-900 dark:text-white text-sm"
                                        />
                                      </div>
                                    )}
                                    {product.product_type !== 'header' && product.product_type !== 'codes_block' && product.product_type !== 'picks_block' && (
                                      <div>
                                        <label className="text-white/50 text-xs mb-1 block">layout</label>
                                        <div className="grid grid-cols-2 gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setEditForm({ ...editForm, layout: 'classic' })}
                                            className={`px-2 py-1.5 rounded border text-xs transition-all ${
                                              editForm.layout === 'classic'
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                                : 'border-gray-200 dark:border-white/10 text-white/50 hover:border-white/20'
                                            }`}
                                          >
                                            classic
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditForm({ ...editForm, layout: 'featured' })}
                                            className={`px-2 py-1.5 rounded border text-xs transition-all ${
                                              editForm.layout === 'featured'
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                                : 'border-gray-200 dark:border-white/10 text-white/50 hover:border-white/20'
                                            }`}
                                          >
                                            featured
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <button
                                        onClick={handleEdit}
                                        disabled={saving}
                                        className="flex-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-gray-900 dark:text-white rounded text-sm"
                                      >
                                        save
                                      </button>
                                      <button
                                        onClick={() => setEditForm({ product: null, title: '', description: '', price: '', external_url: '', layout: 'classic' })}
                                        className="flex-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-900 dark:text-white rounded text-sm"
                                      >
                                        cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Display mode
                                  <div className="flex items-center gap-3">
                                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-white/40 hover:text-gray-500 dark:text-white/60">
                                      <GripVertical size={16} />
                                    </div>
                                    <div className={`p-2 rounded ${getTypeBadge(product.product_type)}`}>
                                      <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{product.title}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs ${getTypeBadge(product.product_type)}`}>
                                          {product.product_type}
                                        </span>
                                        {product.layout === 'featured' && (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400">★ featured</span>
                                        )}
                                        {(product.product_type === 'digital_product' || product.product_type === 'coaching') && product.price > 0 && (
                                          <span className="text-emerald-400 text-xs">${product.price}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => toggleActive(product)}
                                        className="p-1 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:text-white"
                                      >
                                        {product.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                      </button>
                                      {product.product_type !== 'codes_block' && product.product_type !== 'picks_block' && (
                                        <button
                                          onClick={() => startEdit(product)}
                                          className="p-1 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:text-white"
                                        >
                                          <Edit2 size={16} />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-1 text-gray-400 dark:text-white/40 hover:text-red-400"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
            </>
          )}

          {activeTab === 'design' && (
            <>
              {/* Preset Themes */}
              <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white lowercase">preset themes</h2>
                  <button
                    onClick={shuffleTheme}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-500 dark:text-white/60 hover:text-gray-900 dark:text-white text-sm transition-colors"
                  >
                    <Shuffle size={14} />
                    <span className="lowercase">shuffle</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(PRESET_THEMES).map(([name, preset]) => (
                    <button
                      key={name}
                      onClick={() => setTheme(preset)}
                      className="p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-white/20 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-200 dark:border-white/10" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div 
                          className="w-3 h-3 rounded border border-gray-200 dark:border-white/10" 
                          style={{ backgroundColor: preset.background }}
                        />
                        <div 
                          className="w-3 h-3 rounded border border-gray-200 dark:border-white/10" 
                          style={{ backgroundColor: preset.cardBg }}
                        />
                      </div>
                      <p className="text-gray-900 dark:text-white text-xs font-medium lowercase">{name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customize Theme */}
              <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lowercase">customize theme</h2>
                
                <div className="space-y-6">
                  {/* Background */}
                  <div>
                    <label className="block text-gray-500 dark:text-white/60 text-sm mb-3 lowercase">background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={theme.background}
                        onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                        className="w-12 h-9 rounded border border-white/5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.background}
                        onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                        className="flex-1 bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div>
                    <label className="block text-gray-500 dark:text-white/60 text-sm mb-3 lowercase">buttons</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="color"
                        value={theme.primary}
                        onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                        className="w-12 h-9 rounded border border-white/5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.primary}
                        onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                        className="flex-1 bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                        placeholder="#1a1a1a"
                      />
                    </div>
                    <div className="p-2 rounded bg-white/5">
                      <button
                        className="px-4 py-2 text-sm font-medium"
                        style={{ 
                          backgroundColor: (theme.buttonStyle === 'outline') ? 'transparent' : (theme.buttonStyle === 'soft') ? `${theme.primary}1A` : theme.primary, 
                          color: (theme.buttonStyle === 'outline' || theme.buttonStyle === 'soft') ? theme.primary : theme.background,
                          border: theme.buttonStyle === 'outline' ? `2px solid ${theme.primary}` : 'none',
                          borderRadius: theme.buttonStyle === 'pill' ? '9999px' : theme.buttonStyle === 'hard' ? '0px' : '8px',
                          boxShadow: theme.buttonStyle === 'shadow' ? `0 8px 20px -4px ${theme.primary}50` : 'none',
                        }}
                      >
                        button preview
                      </button>
                    </div>
                    {/* Button style picker */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {['fill', 'outline', 'soft', 'pill', 'hard', 'shadow'].map((style) => (
                        <button
                          key={style}
                          onClick={() => setTheme({ ...theme, buttonStyle: style as CreatorTheme['buttonStyle'] })}
                          className={`p-2 rounded-lg border transition-all ${
                            (theme.buttonStyle || 'fill') === style 
                              ? 'border-emerald-500 bg-emerald-500/10' 
                              : 'border-gray-200 dark:border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div 
                            className={`text-[10px] px-2 py-1 mx-auto w-fit ${
                              style === 'outline' ? 'bg-transparent border' :
                              style === 'soft' ? 'bg-emerald-500/20' :
                              style === 'shadow' ? 'bg-emerald-500 shadow-lg' :
                              'bg-emerald-500'
                            } ${style === 'pill' ? 'rounded-full' : style === 'hard' ? 'rounded-none' : 'rounded'}`}
                            style={{ 
                              borderColor: style === 'outline' ? theme.primary : undefined,
                              backgroundColor: style === 'outline' ? 'transparent' : style === 'soft' ? `${theme.primary}30` : theme.primary,
                              color: (style === 'outline' || style === 'soft') ? theme.primary : theme.background
                            }}
                          >
                            {style}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cards */}
                  <div>
                    <label className="block text-gray-500 dark:text-white/60 text-sm mb-3 lowercase">cards</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={theme.cardBg}
                        onChange={(e) => setTheme({ ...theme, cardBg: e.target.value })}
                        className="w-12 h-9 rounded border border-white/5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.cardBg}
                        onChange={(e) => setTheme({ ...theme, cardBg: e.target.value })}
                        className="flex-1 bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                        placeholder="#f5f5f5"
                      />
                    </div>
                  </div>

                  {/* Text */}
                  <div>
                    <label className="block text-gray-500 dark:text-white/60 text-sm mb-3 lowercase">text</label>
                    <select
                      value={theme.font}
                      onChange={(e) => setTheme({ ...theme, font: e.target.value as CreatorTheme['font'] })}
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f] mb-2"
                    >
                      <option value="default">default / sans</option>
                      <option value="serif">serif</option>
                      <option value="mono">mono</option>
                      <option value="rounded">rounded</option>
                    </select>
                    <div className={`p-2 rounded bg-white/5 ${getThemeFontClass(theme.font)}`}>
                      <p className="text-sm text-gray-500 dark:text-white/60">font preview text</p>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="block text-gray-500 dark:text-white/60 text-sm mb-3 lowercase">colors</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={theme.textColor}
                        onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                        className="w-12 h-9 rounded border border-white/5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.textColor}
                        onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                        className="flex-1 bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FEATURE 2: Background Wallpaper/Gradient */}
              <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lowercase">background</h2>
                
                {/* Background Type Toggle */}
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-4">
                  {['solid', 'gradient', 'image'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTheme({ ...theme, backgroundType: type as CreatorTheme['backgroundType'] })}
                      className={`flex-1 px-3 py-2 rounded text-sm transition-all lowercase ${
                        theme.backgroundType === type 
                          ? 'bg-emerald-500 text-black font-medium' 
                          : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Solid Background - use existing color picker */}
                {theme.backgroundType === 'solid' && (
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.background}
                      onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                      className="w-12 h-9 rounded border border-white/5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.background}
                      onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                      className="flex-1 bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                      placeholder="#ffffff"
                    />
                  </div>
                )}

                {/* Gradient Presets */}
                {theme.backgroundType === 'gradient' && (
                  <div>
                    <label className="block text-gray-500 dark:text-white/60 text-sm mb-3 lowercase">preset gradients</label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries({
                        midnight: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
                        ember: 'linear-gradient(135deg, #0a0a0a, #1a0000, #2d0000)',
                        ocean: 'linear-gradient(135deg, #0f172a, #0c2a4a, #0f172a)',
                        sunset: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                        aurora: 'linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e)',
                        cotton: 'linear-gradient(135deg, #fdfcfb, #e2d1c3)',
                        neon: 'linear-gradient(135deg, #0a0a0a, #1b0a2e, #0a1628)',
                        forest: 'linear-gradient(135deg, #0a1a0a, #1a2e1a, #0a1a0a)'
                      }).map(([name, gradient]) => (
                        <button
                          key={name}
                          onClick={() => setTheme({ ...theme, backgroundGradient: gradient })}
                          className={`h-12 rounded-lg border transition-all ${
                            theme.backgroundGradient === gradient 
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                              : 'border-gray-200 dark:border-white/10 hover:border-white/20'
                          }`}
                          style={{ background: gradient }}
                        >
                          <span className="sr-only">{name}</span>
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={theme.backgroundGradient || ''}
                      onChange={(e) => setTheme({ ...theme, backgroundGradient: e.target.value })}
                      placeholder="custom gradient (e.g. linear-gradient(135deg, #000, #fff))"
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    />
                  </div>
                )}

                {/* Image Upload */}
                {theme.backgroundType === 'image' && (
                  <div>
                    <ImageUpload
                      onUpload={(url) => setTheme({ ...theme, backgroundImage: url })}
                      currentImage={theme.backgroundImage}
                      label="background image"
                      aspectRatio="16/9"
                    />
                  </div>
                )}
              </div>

              {/* FEATURE 3: Header Layout */}
              <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lowercase">header</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { style: 'classic', label: 'classic', desc: 'centered circle avatar + name + bio' },
                    { style: 'banner', label: 'banner', desc: 'wide banner image, overlapping avatar' },
                    { style: 'minimal', label: 'minimal', desc: 'no avatar, just name + bio text' }
                  ].map(({ style, label, desc }) => (
                    <button
                      key={style}
                      onClick={() => setTheme({ ...theme, headerStyle: style as CreatorTheme['headerStyle'] })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        theme.headerStyle === style 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-gray-200 dark:border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="mb-2">
                        <div className="h-8 bg-white/10 rounded mb-1 flex items-center justify-center">
                          {style === 'classic' && <div className="w-4 h-4 rounded-full bg-white/30"></div>}
                          {style === 'banner' && <div className="w-full h-2 bg-white/30 rounded"></div>}
                          {style === 'minimal' && <div className="text-[8px] text-gray-400 dark:text-white/40">Name</div>}
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white text-xs font-medium lowercase">{label}</p>
                      <p className="text-gray-400 dark:text-white/40 text-[10px] mt-1">{desc}</p>
                    </button>
                  ))}
                </div>

                {/* Banner Image Upload */}
                {theme.headerStyle === 'banner' && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 lowercase">banner image</h3>
                    <p className="text-xs text-gray-500 mb-2">optimal size: 1200 × 400px</p>
                    <ImageUpload
                      onUpload={(url) => setTheme({ ...theme, headerImage: url })}
                      currentImage={theme.headerImage}
                      label="banner image"
                      aspectRatio="16/6"
                    />
                  </div>
                )}
              </div>

              {/* FEATURE 4: Card Transparency/Blur */}
              <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lowercase">cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { style: 'solid', label: 'solid', desc: 'opaque cards' },
                    { style: 'glass', label: 'glass', desc: 'glassmorphism blur' },
                    { style: 'transparent', label: 'transparent', desc: 'no background' }
                  ].map(({ style, label, desc }) => (
                    <button
                      key={style}
                      onClick={() => setTheme({ ...theme, cardStyle: style as CreatorTheme['cardStyle'] })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        theme.cardStyle === style 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-gray-200 dark:border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="mb-2">
                        <div className={`h-8 rounded border text-center flex items-center justify-center text-[8px] ${
                          style === 'solid' ? 'bg-white/20 border-white/30' :
                          style === 'glass' ? 'bg-white/5 border-white/20 backdrop-blur' :
                          'bg-transparent border-b border-white/20'
                        }`}>
                          {style === 'transparent' ? 'text' : 'card'}
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white text-xs font-medium lowercase">{label}</p>
                      <p className="text-gray-400 dark:text-white/40 text-[10px] mt-1">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* FEATURE 5: Social Icon Style */}
              <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lowercase">social icons</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { style: 'filled', label: 'filled', desc: 'solid circles' },
                    { style: 'outline', label: 'outline', desc: 'circle border only' },
                    { style: 'minimal', label: 'minimal', desc: 'just icons' },
                    { style: 'colored', label: 'colored', desc: 'brand colors' }
                  ].map(({ style, label, desc }) => (
                    <button
                      key={style}
                      onClick={() => setTheme({ ...theme, socialStyle: style as CreatorTheme['socialStyle'] })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        theme.socialStyle === style 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-gray-200 dark:border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="mb-2 flex justify-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] ${
                          style === 'filled' ? 'bg-white/20' :
                          style === 'outline' ? 'border border-white/30' :
                          style === 'minimal' ? '' :
                          'bg-blue-500' // colored example
                        }`}>
                          {style !== 'minimal' && '◯'}
                          {style === 'minimal' && '○'}
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white text-xs font-medium lowercase">{label}</p>
                      <p className="text-gray-400 dark:text-white/40 text-[10px] mt-1">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-4">
                <button
                  onClick={handleThemeSave}
                  disabled={themeSaving}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white hover:bg-white/90 disabled:bg-white/50 disabled:cursor-not-allowed text-black rounded-lg transition-colors font-medium"
                >
                  {themeSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                      <span className="lowercase">saving theme...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span className="lowercase">save theme</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Live Preview */}
        <div className="sticky top-8">
          <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lowercase">live preview</h2>
            
            {/* Phone Frame */}
            <div className="mx-auto max-w-sm">
              <div className="bg-black rounded-3xl p-2 border-4 border-gray-800">
                <div 
                  className={`rounded-2xl overflow-hidden min-h-[600px] max-h-[600px] overflow-y-auto ${getThemeFontClass(theme.font)}`}
                  style={{
                    ...getThemeStyles(theme),
                    background: (theme.backgroundType === 'gradient' && theme.backgroundGradient) 
                      ? theme.backgroundGradient 
                      : (theme.backgroundType === 'image' && theme.backgroundImage)
                        ? `url(${theme.backgroundImage}) center/cover`
                        : theme.background,
                  }}
                >
                  {/* Profile Header - respects headerStyle */}
                  {(theme.headerStyle || 'classic') === 'banner' ? (
                    <div>
                      <div className="h-24" style={theme.headerImage ? { backgroundImage: `url(${theme.headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: `${theme.primary}30` }} />
                      <div className="px-6 pb-4 -mt-10 text-center">
                        <div className="w-20 h-20 rounded-full mx-auto mb-3 border-4 flex items-center justify-center" style={{ borderColor: theme.background, backgroundColor: `${theme.primary}20` }}>
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User size={28} style={{ color: theme.primary }} />
                          )}
                        </div>
                        <h3 className="font-semibold text-lg" style={{ color: theme.textColor }}>{profile?.display_name || 'creator'}</h3>
                        <p className="text-sm" style={{ color: `${theme.textColor}80` }}>@{profile?.handle || 'handle'}</p>
                        {profile?.bio && <p className="text-sm mt-2" style={{ color: `${theme.textColor}90` }}>{profile.bio}</p>}
                      </div>
                    </div>
                  ) : (theme.headerStyle || 'classic') === 'minimal' ? (
                    <div className="p-6 text-center">
                      <h3 className="font-bold text-2xl" style={{ color: theme.textColor }}>{profile?.display_name || 'creator'}</h3>
                      <p className="text-sm mt-1" style={{ color: `${theme.textColor}60` }}>@{profile?.handle || 'handle'}</p>
                      {profile?.bio && <p className="text-sm mt-3" style={{ color: `${theme.textColor}80` }}>{profile.bio}</p>}
                    </div>
                  ) : (
                    <div className="p-6 text-center border-b" style={{ borderColor: `${theme.textColor}20` }}>
                      <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${theme.primary}20` }}>
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User size={32} style={{ color: theme.primary }} />
                        )}
                      </div>
                      <h3 className="font-semibold text-lg" style={{ color: theme.textColor }}>{profile?.display_name || 'creator'}</h3>
                      <p className="text-sm" style={{ color: `${theme.textColor}80` }}>@{profile?.handle || 'handle'}</p>
                      {profile?.bio && <p className="text-sm mt-2" style={{ color: `${theme.textColor}90` }}>{profile.bio}</p>}
                    </div>
                  )}

                  {/* Social Icons Preview */}
                  <div className="flex justify-center gap-2 py-3">
                    {['IG', 'TK', 'YT', 'X'].map(p => {
                      const ss = theme.socialStyle || 'filled';
                      const brandColors: Record<string, string> = { IG: '#E4405F', TK: '#000000', YT: '#FF0000', X: '#000000' };
                      return (
                        <div key={p} className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-mono"
                          style={
                            ss === 'colored' ? { backgroundColor: brandColors[p], color: '#fff' } :
                            ss === 'outline' ? { border: `1.5px solid ${theme.textColor}40`, color: `${theme.textColor}80`, backgroundColor: 'transparent' } :
                            ss === 'minimal' ? { color: `${theme.textColor}60`, backgroundColor: 'transparent' } :
                            { backgroundColor: `${theme.textColor}10`, color: `${theme.textColor}60` }
                          }
                        >{p}</div>
                      );
                    })}
                  </div>

                  {/* Products */}
                  <div className="p-4 space-y-3">
                    {products.filter(p => p.is_active).map((product) => {
                      const bs = theme.buttonStyle || 'fill';
                      const cs = theme.cardStyle || 'solid';
                      const isDarkBg = (theme.background || '#ffffff').replace('#','').match(/.{2}/g)?.reduce((s,c) => s + parseInt(c,16), 0) || 0;
                      const isDark = isDarkBg < 382;
                      
                      // Card style helpers
                      const cardBg = cs === 'glass' 
                        ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                        : cs === 'transparent' ? 'transparent' : theme.cardBg;
                      const cardBorder = cs === 'glass' 
                        ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')
                        : cs === 'transparent' ? 'transparent' : `${theme.textColor}15`;
                      const cardBlur = cs === 'glass' ? 'blur(12px)' : undefined;
                      
                      // Button style helpers
                      const btnRadius = bs === 'pill' ? '9999px' : bs === 'hard' ? '0px' : '8px';
                      const btnBg = (bs === 'outline') ? 'transparent' : (bs === 'soft') ? `${theme.primary}1A` : theme.primary;
                      const btnColor = (bs === 'outline' || bs === 'soft') ? theme.primary : theme.background;
                      const btnBorder = bs === 'outline' ? `2px solid ${theme.primary}` : 'none';
                      const btnShadow = bs === 'shadow' ? `0 8px 20px -4px ${theme.primary}50` : 'none';

                      if (product.product_type === 'header') {
                        return (
                          <div key={product.id} className="py-2">
                            <h4 className="font-medium text-center text-sm uppercase tracking-wide" style={{ color: `${theme.textColor}80` }}>
                              {product.title}
                            </h4>
                          </div>
                        );
                      }

                      // Featured layout
                      if (product.layout === 'featured') {
                        return (
                          <div key={product.id} className="rounded-2xl overflow-hidden transition-all"
                            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: cardBlur }}
                          >
                            <div className="aspect-video flex items-center justify-center" style={{ backgroundColor: `${theme.primary}15` }}>
                              {product.thumbnail_url 
                                ? <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
                                : <Package size={32} style={{ color: `${theme.primary}50` }} />
                              }
                            </div>
                            <div className="p-4">
                              <h4 className="font-bold text-lg" style={{ color: theme.textColor }}>{product.title}</h4>
                              {product.description && <p className="text-sm mt-1 line-clamp-2" style={{ color: `${theme.textColor}70` }}>{product.description}</p>}
                              <div className="flex items-center justify-between mt-3">
                                {product.price > 0 && <span className="font-bold text-lg" style={{ color: theme.primary }}>${product.price.toFixed(2)}</span>}
                                <button className="px-4 py-2 text-sm font-semibold ml-auto" style={{ borderRadius: btnRadius, backgroundColor: btnBg, color: btnColor, border: btnBorder, boxShadow: btnShadow }}>
                                  {product.cta_text || 'Purchase'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (product.product_type === 'link') {
                        return (
                          <div key={product.id} className="p-4 flex items-center gap-3 transition-colors"
                            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: btnRadius === '9999px' ? '9999px' : '12px', backdropFilter: cardBlur }}
                          >
                            <LinkIcon size={16} style={{ color: theme.primary }} />
                            <span className="font-medium flex-1" style={{ color: theme.textColor }}>{product.title}</span>
                            <ExternalLink size={14} style={{ color: `${theme.textColor}40` }} />
                          </div>
                        );
                      }

                      // Classic product card
                      return (
                        <div key={product.id} className="rounded-xl p-4"
                          style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: cardBlur }}
                        >
                          <h4 className="font-semibold" style={{ color: theme.textColor }}>{product.title}</h4>
                          {product.description && <p className="text-sm mt-1" style={{ color: `${theme.textColor}70` }}>{product.description}</p>}
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold" style={{ color: theme.primary }}>${product.price > 0 ? product.price.toFixed(2) : 'Free'}</span>
                            <button className="px-4 py-2 text-sm font-semibold" style={{ borderRadius: btnRadius, backgroundColor: btnBg, color: btnColor, border: btnBorder, boxShadow: btnShadow }}>
                              {product.cta_text || 'Purchase'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {products.filter(p => p.is_active).length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-sm lowercase" style={{ color: `${theme.textColor}40` }}>no active blocks</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}