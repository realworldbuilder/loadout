'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient, type Creator, type Product } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';
import { formatDate } from '@/lib/utils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Package,
  ToggleLeft,
  ToggleRight,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductsPage() {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Get creator profile
      const { data: creatorData } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (creatorData) {
        setCreator(creatorData);
        
        // Load products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('creator_id', creatorData.id)
          .order('created_at', { ascending: false });

        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleProductStatus(productId: string, currentStatus: boolean) {
    try {
      await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, is_active: !currentStatus }
          : product
      ));
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  }

  async function deleteProduct(productId: string) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-2xl">Loading products...</div>
      </div>
    );
  }

  const activeProducts = products.filter(p => p.is_active);
  const canAddMoreProducts = creator?.tier === 'free' ? activeProducts.length < 3 : true;

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-gray-400">
              Manage your digital products and services
            </p>
            {creator?.tier === 'free' && (
              <p className="text-sm text-yellow-500 mt-2">
                Free tier: {activeProducts.length}/3 active products
              </p>
            )}
          </div>
          
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {creator && (
              <Link 
                href={`/${creator.handle}`}
                target="_blank"
                className="btn-secondary flex items-center"
              >
                View Storefront
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            )}
            
            {canAddMoreProducts ? (
              <button 
                onClick={() => setShowNewProductModal(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </button>
            ) : (
              <Link href="/dashboard/upgrade" className="btn-primary flex items-center">
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <div className="card">
            <div className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first product to start selling to your audience
              </p>
              
              <button 
                onClick={() => setShowNewProductModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Product
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="card">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 bg-background-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.thumbnail_url ? (
                          <Image
                            src={product.thumbnail_url}
                            alt={product.title}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-500" />
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">{product.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.is_active 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        {product.description && (
                          <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="font-semibold text-primary-600">
                            {formatPrice(product.price_cents)}
                          </span>
                          <span>{product.type}</span>
                          <span>Created {formatDate(product.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleProductStatus(product.id, product.is_active)}
                        className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
                        title={product.is_active ? 'Deactivate product' : 'Activate product'}
                      >
                        {product.is_active ? (
                          <ToggleRight className="h-5 w-5 text-primary-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      
                      <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
                        <Edit className="h-5 w-5 text-gray-400" />
                      </button>
                      
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Product Modal */}
        {showNewProductModal && (
          <NewProductModal 
            onClose={() => setShowNewProductModal(false)}
            onProductCreated={loadProducts}
            creatorId={creator?.id || ''}
          />
        )}
      </div>
    </div>
  );
}

// Simple new product modal component
function NewProductModal({ 
  onClose, 
  onProductCreated, 
  creatorId 
}: { 
  onClose: () => void;
  onProductCreated: () => void;
  creatorId: string;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'digital' | 'coaching' | 'link'>('digital');
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !price) return;

    try {
      setLoading(true);
      
      const priceCents = Math.round(parseFloat(price) * 100);
      
      await supabase
        .from('products')
        .insert({
          creator_id: creatorId,
          title,
          description,
          price_cents: priceCents,
          type,
          is_active: true,
        });

      onProductCreated();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g., 12-Week Muscle Building Program"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea h-24"
              placeholder="Describe what customers will get..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="29.99"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Product Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="input"
            >
              <option value="digital">Digital Product (PDF, videos, etc.)</option>
              <option value="coaching">Coaching Service</option>
              <option value="link">External Link</option>
            </select>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title || !price}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}