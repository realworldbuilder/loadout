'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProduct, updateProduct, deleteProduct } from '@/lib/products';
import type { Product, ProductType } from '@/lib/products';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  Package,
  Eye,
  DollarSign,
  ExternalLink,
  Trash2
} from 'lucide-react';

export default function EditProductPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // Auth guards
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (!profile) {
        router.push('/onboarding');
        return;
      }
    }
  }, [user, profile, authLoading, router]);

  // Load product data
  useEffect(() => {
    if (profile && productId) {
      loadProduct();
    }
  }, [profile, productId]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productType, setProductType] = useState<ProductType>('digital');
  const [externalUrl, setExternalUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [layout, setLayout] = useState<'classic' | 'featured'>('classic');

  async function loadProduct() {
    try {
      setLoadingProduct(true);
      const { data, error } = await getProduct(productId);
      
      if (error) {
        console.error('Error loading product:', error);
        router.push('/dashboard/products');
        return;
      }

      if (!data) {
        router.push('/dashboard/products');
        return;
      }

      // Check if this product belongs to the current user
      if (data.creator_id !== profile?.id) {
        router.push('/dashboard/products');
        return;
      }

      setProduct(data);
      
      // Populate form
      setTitle(data.title);
      setDescription(data.description || '');
      setPrice(data.price.toString());
      setProductType(data.product_type);
      setExternalUrl(data.external_url || '');
      setCtaText(data.cta_text || '');
      setLayout(data.layout || 'classic');
    } catch (error) {
      console.error('Error loading product:', error);
      router.push('/dashboard/products');
    } finally {
      setLoadingProduct(false);
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile || !title || !price || !product) return;

    setLoading(true);
    try {
      const priceNum = parseFloat(price);
      
      if (isNaN(priceNum) || priceNum < 0) {
        alert('Please enter a valid price');
        setLoading(false);
        return;
      }

      // TODO: Handle file uploads in Phase 4
      
      const updateData = {
        title,
        description: description || undefined,
        price: priceNum,
        product_type: productType,
        external_url: externalUrl || undefined,
        cta_text: ctaText || undefined,
        layout: layout,
      };

      const { error } = await updateProduct(product.id, updateData);

      if (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product. Please try again.');
        return;
      }

      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    
    if (!window.confirm('are you sure you want to delete this product? this action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await deleteProduct(product.id);

      if (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
        return;
      }

      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  const formatPrice = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const getProductTypeLabel = (type: ProductType) => {
    switch (type) {
      case 'digital': return 'digital';
      case 'coaching': return 'coaching';
      case 'affiliate_link': return 'affiliate';
      case 'subscription': return 'subscription';
      case 'link': return 'link';
      case 'header': return 'header';
      case 'email_collector': return 'email';
      case 'embed': return 'embed';
      default: return type;
    }
  };

  if (authLoading || !profile || loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60 lowercase">loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-white/60 lowercase">product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/products"
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white/70" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white lowercase">edit product</h1>
            <p className="text-white/60 lowercase">update your product details</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 lowercase"
        >
          <Trash2 className="h-4 w-4" />
          <span>{deleting ? 'deleting...' : 'delete'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6 lowercase">basic info</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 lowercase">
                    title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g., 12-week shred program"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 lowercase">
                    description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 resize-none"
                    placeholder="describe what customers will get..."
                  />
                  <p className="text-xs text-white/40 mt-2 lowercase">tell customers what they'll receive</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 lowercase">
                      price ($) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                        placeholder="29.99"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 lowercase">
                      type *
                    </label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value as ProductType)}
                      className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="digital_product">digital product</option>
                      <option value="coaching">coaching</option>
                      <option value="affiliate_link">affiliate link</option>
                      <option value="subscription">subscription</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Picker */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6 lowercase">layout style</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Classic Layout */}
                <button
                  type="button"
                  onClick={() => setLayout('classic')}
                  className={`p-4 rounded-2xl border transition-all ${
                    layout === 'classic'
                      ? 'border-emerald-500/50 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                      : 'border-white/10 bg-[#161616] hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="w-full h-16 bg-white/5 rounded border border-white/10 p-2">
                      <div className="flex items-center space-x-2 h-full">
                        <div className="w-10 h-10 bg-white/10 rounded flex-shrink-0"></div>
                        <div className="flex-1 space-y-1">
                          <div className="w-3/4 h-2 bg-white/20 rounded"></div>
                          <div className="w-1/2 h-1.5 bg-white/10 rounded"></div>
                        </div>
                        <div className="w-12 h-6 bg-emerald-500/30 rounded text-xs flex items-center justify-center">
                          <span className="text-[10px] text-emerald-400">$29</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className={`font-medium mb-1 lowercase ${layout === 'classic' ? 'text-emerald-400' : 'text-white'}`}>
                        classic
                      </h3>
                      <p className="text-xs text-white/60 lowercase">compact row layout</p>
                    </div>
                  </div>
                </button>

                {/* Featured Layout */}
                <button
                  type="button"
                  onClick={() => setLayout('featured')}
                  className={`p-4 rounded-2xl border transition-all ${
                    layout === 'featured'
                      ? 'border-emerald-500/50 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                      : 'border-white/10 bg-[#161616] hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="w-full h-20 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                      <div className="h-12 bg-white/10"></div>
                      <div className="p-2 space-y-1">
                        <div className="w-3/4 h-2 bg-white/20 rounded"></div>
                        <div className="flex items-center justify-between">
                          <div className="w-1/3 h-1.5 bg-white/10 rounded"></div>
                          <div className="w-8 h-3 bg-emerald-500/30 rounded text-xs flex items-center justify-center">
                            <span className="text-[8px] text-emerald-400">$29</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className={`font-medium mb-1 lowercase ${layout === 'featured' ? 'text-emerald-400' : 'text-white'}`}>
                        featured
                      </h3>
                      <p className="text-xs text-white/60 lowercase">large card with hero image</p>
                    </div>
                  </div>
                </button>
              </div>
              {layout === 'featured' && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-sm text-emerald-400 lowercase">
                    <strong>featured layout tip:</strong> add a thumbnail image for the best visual impact
                  </p>
                </div>
              )}
            </div>

            {/* Conditional Fields */}
            {productType === 'affiliate_link' && (
              <div className="bg-[#111] border border-white/5 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-6 lowercase">affiliate link</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 lowercase">
                      external url
                    </label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input
                        type="url"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                        placeholder="https://example.com/product"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6 lowercase">call to action</h2>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 lowercase">
                  button text
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                  placeholder="get now, buy this, start today..."
                />
                <p className="text-xs text-white/40 mt-2 lowercase">
                  leave empty to use default: "get this"
                </p>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6 lowercase">thumbnail</h2>
              
              <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors">
                <div className="text-white/40 mb-4">
                  {product.thumbnail_url ? (
                    <img 
                      src={product.thumbnail_url} 
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-white/40" />
                    </div>
                  )}
                </div>
                <p className="text-white/80 mb-2 lowercase">file upload coming in phase 4</p>
                <p className="text-sm text-white/40 lowercase">for now, thumbnails cannot be changed</p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex space-x-4">
              <Link
                href="/dashboard/products"
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center font-medium hover:bg-white/10 transition-colors lowercase"
              >
                cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !title || !price}
                className="flex-1 px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed lowercase"
              >
                {loading ? 'saving...' : 'save changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-[#111] border border-white/5 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-white lowercase">preview</h2>
            </div>
            
            <div className="bg-[#161616] border border-white/5 rounded-lg overflow-hidden">
              {/* Preview thumbnail */}
              <div className="aspect-video bg-gray-600 flex items-center justify-center">
                {product.thumbnail_url ? (
                  <img 
                    src={product.thumbnail_url} 
                    alt={title || product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-12 w-12 text-white/20" />
                )}
              </div>
              
              {/* Preview content */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1">
                  {title || 'product title'}
                </h3>
                {description && (
                  <p className="text-sm text-white/60 mb-3 line-clamp-2">
                    {description}
                  </p>
                )}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-emerald-500">
                    {formatPrice(price)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/60 lowercase">
                    {getProductTypeLabel(productType)}
                  </span>
                </div>
                <button className="w-full px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg lowercase">
                  {ctaText || 'get this'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-sm text-emerald-100 lowercase">
              💡 tip: update your description to keep customers engaged
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}