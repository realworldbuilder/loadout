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
  ExternalLink,
  User,
  Save,
  X
} from 'lucide-react';

// Product types
interface Product {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  price: number;
  product_type: 'digital_product' | 'coaching' | 'affiliate_link' | 'subscription' | 'link' | 'header';
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
  type: 'link' | 'product' | 'header' | null;
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
  const { user, profile, initializing } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
        title: addForm.title,
        description: addForm.description || '',
        price: addForm.type === 'header' ? 0 : Number(addForm.price) || 0,
        product_type: addForm.type === 'link' ? 'link' : 
                      addForm.type === 'header' ? 'header' : 'digital_product',
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
      default:
        return 'bg-emerald-500/10 text-emerald-400';
    }
  };

  if (initializing || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60 lowercase">loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 lowercase">page builder</h1>
        <p className="text-white/60">drag and drop to build your public page</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Block List + Controls */}
        <div className="space-y-6">
          {/* Add Buttons */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-4">
            <h2 className="text-lg font-semibold text-white mb-4 lowercase">add blocks</h2>
            <div className="grid grid-cols-3 gap-3">
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
            </div>
          </div>

          {/* Add Form */}
          {addForm.type && (
            <div className="bg-[#111] rounded-lg border border-white/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white lowercase">add {addForm.type}</h3>
                <button
                  onClick={() => setAddForm({ type: null, title: '', description: '', price: '', external_url: '', layout: 'classic' })}
                  className="text-white/60 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="title"
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                {addForm.type !== 'header' && (
                  <div>
                    <label className="text-white/60 text-xs mb-2 block lowercase">layout</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAddForm({ ...addForm, layout: 'classic' })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          addForm.layout === 'classic'
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full border-2 ${addForm.layout === 'classic' ? 'border-emerald-500 bg-emerald-500' : 'border-white/30'}`} />
                          <span className="text-white text-sm font-medium">classic</span>
                        </div>
                        <p className="text-white/40 text-xs">compact row</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddForm({ ...addForm, layout: 'featured' })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          addForm.layout === 'featured'
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full border-2 ${addForm.layout === 'featured' ? 'border-emerald-500 bg-emerald-500' : 'border-white/30'}`} />
                          <span className="text-white text-sm font-medium">featured</span>
                        </div>
                        <p className="text-white/40 text-xs">large card + thumbnail</p>
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
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50"
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
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 resize-none h-20"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="price"
                        value={addForm.price}
                        onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </>
                )}
                <button
                  onClick={handleAdd}
                  disabled={!addForm.title.trim() || saving}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Save size={16} />
                  {saving ? 'saving...' : 'add'}
                </button>
              </div>
            </div>
          )}

          {/* Products List */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-4">
            <h2 className="text-lg font-semibold text-white mb-4 lowercase">page blocks</h2>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="products">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {products.length === 0 ? (
                      <p className="text-white/40 text-center py-8 lowercase">no blocks yet. add some above!</p>
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
                                  bg-white/5 border border-white/10 rounded-lg p-3
                                  ${snapshot.isDragging ? 'ring-2 ring-emerald-500/50' : ''}
                                  ${!product.is_active ? 'opacity-50' : ''}
                                `}
                              >
                                {isEditing ? (
                                  // Edit form
                                  <div className="space-y-3">
                                    <div>
                                      <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                      />
                                    </div>
                                    {product.product_type === 'digital_product' && (
                                      <>
                                        <div>
                                          <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm resize-none h-16"
                                          />
                                        </div>
                                        <div>
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                            className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
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
                                          className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                        />
                                      </div>
                                    )}
                                    {product.product_type !== 'header' && (
                                      <div>
                                        <label className="text-white/50 text-xs mb-1 block">layout</label>
                                        <div className="grid grid-cols-2 gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setEditForm({ ...editForm, layout: 'classic' })}
                                            className={`px-2 py-1.5 rounded border text-xs transition-all ${
                                              editForm.layout === 'classic'
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                                : 'border-white/10 text-white/50 hover:border-white/20'
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
                                                : 'border-white/10 text-white/50 hover:border-white/20'
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
                                        className="flex-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm"
                                      >
                                        save
                                      </button>
                                      <button
                                        onClick={() => setEditForm({ product: null, title: '', description: '', price: '', external_url: '', layout: 'classic' })}
                                        className="flex-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm"
                                      >
                                        cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Display mode
                                  <div className="flex items-center gap-3">
                                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white/60">
                                      <GripVertical size={16} />
                                    </div>
                                    <div className={`p-2 rounded ${getTypeBadge(product.product_type)}`}>
                                      <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white text-sm font-medium truncate">{product.title}</p>
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
                                        className="p-1 text-white/40 hover:text-white"
                                      >
                                        {product.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                      </button>
                                      <button
                                        onClick={() => startEdit(product)}
                                        className="p-1 text-white/40 hover:text-white"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-1 text-white/40 hover:text-red-400"
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
        </div>

        {/* Right Panel - Live Preview */}
        <div className="sticky top-8">
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 lowercase">live preview</h2>
            
            {/* Phone Frame */}
            <div className="mx-auto max-w-sm">
              <div className="bg-black rounded-3xl p-2 border-4 border-gray-800">
                <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden min-h-[600px] max-h-[600px] overflow-y-auto">
                  {/* Profile Header */}
                  <div className="p-6 text-center border-b border-white/10">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 mx-auto mb-4 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.display_name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-emerald-400" />
                      )}
                    </div>
                    <h3 className="text-white font-semibold text-lg">{profile?.display_name || 'creator'}</h3>
                    <p className="text-white/60 text-sm">@{profile?.handle || 'handle'}</p>
                    {profile?.bio && (
                      <p className="text-white/80 text-sm mt-2">{profile.bio}</p>
                    )}
                  </div>

                  {/* Products */}
                  <div className="p-4 space-y-3">
                    {products.filter(p => p.is_active).map((product) => {
                      if (product.product_type === 'header') {
                        return (
                          <div key={product.id} className="py-2">
                            <h4 className="text-white/80 font-medium text-center text-sm uppercase tracking-wide">
                              {product.title}
                            </h4>
                          </div>
                        );
                      }

                      // Featured layout — big card
                      if (product.layout === 'featured') {
                        return (
                          <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all">
                            {product.thumbnail_url ? (
                              <div className="aspect-video bg-white/5">
                                <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
                                <Package size={32} className="text-emerald-400/40" />
                              </div>
                            )}
                            <div className="p-4">
                              <h4 className="text-white font-bold text-lg">{product.title}</h4>
                              {product.description && (
                                <p className="text-white/60 text-sm mt-1 line-clamp-2">{product.description}</p>
                              )}
                              <div className="flex items-center justify-between mt-3">
                                {product.price > 0 && (
                                  <span className="text-emerald-400 font-bold text-lg">${product.price.toFixed(2)}</span>
                                )}
                                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium ml-auto">
                                  {product.cta_text || (product.product_type === 'link' ? 'Visit' : 'Purchase')}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (product.product_type === 'link') {
                        return (
                          <a
                            key={product.id}
                            href={product.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <LinkIcon size={16} className="text-blue-400" />
                              <span className="text-white font-medium">{product.title}</span>
                              <ExternalLink size={14} className="text-white/40 ml-auto" />
                            </div>
                          </a>
                        );
                      }

                      // Classic product card
                      return (
                        <div key={product.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-white font-semibold">{product.title}</h4>
                              {product.description && (
                                <p className="text-white/60 text-sm mt-1">{product.description}</p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-400 font-bold">
                                ${product.price > 0 ? product.price.toFixed(2) : 'Free'}
                              </span>
                              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                {product.cta_text || 'Purchase'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {products.filter(p => p.is_active).length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-white/40 text-sm lowercase">no active blocks</p>
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