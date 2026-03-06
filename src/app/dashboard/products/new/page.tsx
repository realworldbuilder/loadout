'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createProduct } from '@/lib/products';
import { uploadThumbnail } from '@/lib/storage';
import type { ProductType } from '@/lib/products';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Upload, 
  Package,
  Eye,
  DollarSign,
  ExternalLink,
  X,
  ImageIcon
} from 'lucide-react';

function NewProductInner() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push('/login'); return; }
      if (!profile) { router.push('/onboarding'); return; }
    }
  }, [user, profile, authLoading, router]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const initialType = (searchParams.get('type') as ProductType) || 'digital_product';
  const [productType, setProductType] = useState<ProductType>(initialType);
  const [externalUrl, setExternalUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Set price to 0 for links
  useEffect(() => {
    if (productType === 'link') {
      setPrice('0');
    }
  }, [productType]);

  function handleThumbnailSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  function clearThumbnail() {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation based on product type
    if (!user || !profile || !title) return;
    
    if (productType === 'link') {
      if (!externalUrl) {
        alert('Please enter a destination URL for the link');
        return;
      }
    } else {
      if (!price) {
        alert('Please enter a price');
        return;
      }
    }

    setLoading(true);
    try {
      const priceNum = productType === 'link' ? 0 : parseFloat(price);
      if (productType !== 'link' && (isNaN(priceNum) || priceNum < 0)) {
        alert('Please enter a valid price');
        setLoading(false);
        return;
      }

      let thumbnailUrl: string | undefined;

      if (thumbnailFile) {
        setUploading(true);
        const { url, error } = await uploadThumbnail(thumbnailFile, profile.id);
        setUploading(false);
        if (error) {
          alert('Failed to upload thumbnail: ' + error);
          setLoading(false);
          return;
        }
        thumbnailUrl = url || undefined;
      }

      const { data, error } = await createProduct({
        creator_id: profile.id,
        title,
        description: description || undefined,
        price: priceNum,
        product_type: productType,
        external_url: externalUrl || undefined,
        cta_text: ctaText || undefined,
        thumbnail_url: thumbnailUrl,
        is_active: true,
        sort_order: 0,
      });

      if (error) {
        console.error('Error creating product:', error);
        alert('Failed to create product. Please try again.');
        return;
      }

      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const getProductTypeLabel = (type: ProductType) => {
    switch (type) {
      case 'digital_product': return 'digital';
      case 'coaching': return 'coaching';
      case 'affiliate_link': return 'affiliate';
      case 'subscription': return 'subscription';
      case 'link': return 'link';
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60 lowercase">loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/dashboard/products" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-white/70" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white lowercase">create product</h1>
          <p className="text-white/60 lowercase">add a new product to your storefront</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6 lowercase">basic info</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 lowercase">title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g., 12-week shred program" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 lowercase">description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                    className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 resize-none"
                    placeholder="describe what customers will get..." />
                  <p className="text-xs text-white/40 mt-2 lowercase">tell customers what they'll receive</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {productType !== 'link' && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2 lowercase">price ($) *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                          placeholder="29.99" step="0.01" min="0" required />
                      </div>
                    </div>
                  )}
                  <div className={productType === 'link' ? 'col-span-full' : ''}>
                    <label className="block text-sm font-medium text-white/80 mb-2 lowercase">type *</label>
                    <select value={productType} onChange={(e) => setProductType(e.target.value as ProductType)}
                      className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50">
                      <option value="digital_product">digital product</option>
                      <option value="coaching">coaching</option>
                      <option value="affiliate_link">affiliate link</option>
                      <option value="subscription">subscription</option>
                      <option value="link">link</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* External URL - for affiliate links or any product */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6 lowercase">
                {productType === 'link' ? 'destination url' : 'link'}
              </h2>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 lowercase">
                  external url {productType === 'link' ? '*' : ''}
                </label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                    placeholder={productType === 'link' ? 'https://youtube.com/@yourhandle' : 'https://example.com/product'}
                    required={productType === 'link'} />
                </div>
                <p className="text-xs text-white/40 mt-2 lowercase">
                  {productType === 'link' ? 'where people go when they click this link' : 'where customers go when they click "get it"'}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6 lowercase">call to action</h2>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 lowercase">button text</label>
                <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                  placeholder="get now, buy this, start today..." />
                <p className="text-xs text-white/40 mt-2 lowercase">leave empty to use default</p>
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6 lowercase">thumbnail</h2>
              
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />

              {thumbnailPreview ? (
                <div className="relative group">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full aspect-video object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={clearThumbnail}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/80 hover:text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/10 transition-colors">
                    <ImageIcon className="h-6 w-6 text-white/40 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <p className="text-white/60 text-sm mb-1 lowercase">click to upload thumbnail</p>
                  <p className="text-white/30 text-xs lowercase">jpg, png, webp · max 5mb</p>
                </button>
              )}
            </div>

            {/* Submit */}
            <div className="flex space-x-4">
              <Link href="/dashboard/products"
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center font-medium hover:bg-white/10 transition-colors lowercase">
                cancel
              </Link>
              <button type="submit" disabled={loading || !title || (productType === 'link' ? !externalUrl : !price)}
                className="flex-1 px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed lowercase">
                {uploading ? 'uploading...' : loading ? 'creating...' : productType === 'link' ? 'create link' : 'create product'}
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
              <div className="aspect-video bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-12 w-12 text-white/10" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1">{title || (productType === 'link' ? 'link title' : 'product title')}</h3>
                {description && <p className="text-sm text-white/60 mb-3 line-clamp-2">{description}</p>}
                <div className="flex items-center justify-between mb-3">
                  {productType !== 'link' && <span className="font-semibold text-emerald-500">{formatPrice(price)}</span>}
                  <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/60 lowercase ml-auto">{getProductTypeLabel(productType)}</span>
                </div>
                {productType === 'link' ? (
                  <div className="flex items-center justify-center py-2 text-white/60">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="text-sm lowercase">clickable link</span>
                  </div>
                ) : (
                  <button className="w-full px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg lowercase">
                    {ctaText || 'get this'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white/40">loading...</div>}>
      <NewProductInner />
    </Suspense>
  );
}
