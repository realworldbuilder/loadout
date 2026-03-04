'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Bot,
  Eye,
  DollarSign,
  Package
} from 'lucide-react';

type ProductType = 'digital' | 'coaching' | 'service' | 'subscription';

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productType, setProductType] = useState<ProductType>('digital');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  
  const supabase = createSupabaseClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title || !price) return;

    setLoading(true);
    try {
      // Get creator ID
      const { data: creator } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!creator) {
        throw new Error('Creator not found');
      }

      const priceCents = Math.round(parseFloat(price) * 100);
      let fileUrl: string | null = null;
      let thumbnailUrl: string | null = null;

      // Upload files if provided
      if (file && productType === 'digital') {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: fileData, error: fileError } = await supabase.storage
          .from('products')
          .upload(fileName, file);

        if (fileError) throw fileError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileData.path);
        
        fileUrl = publicUrl;
      }

      if (thumbnail) {
        const thumbnailExt = thumbnail.name.split('.').pop();
        const thumbnailName = `thumb_${Date.now()}.${thumbnailExt}`;
        
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from('products')
          .upload(thumbnailName, thumbnail);

        if (thumbnailError) throw thumbnailError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(thumbnailData.path);
        
        thumbnailUrl = publicUrl;
      }

      // Insert product
      const { error } = await supabase
        .from('products')
        .insert({
          creator_id: creator.id,
          title,
          description,
          price_cents: priceCents,
          type: productType,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl,
          is_active: true,
          sort_order: 0,
          metadata: { sold_count: 0 }
        });

      if (error) throw error;

      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('failed to create product. please try again.');
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="px-6 py-8 lg:px-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link
          href="/dashboard/products"
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white/70" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white lowercase">create product</h1>
          <p className="text-white/60 lowercase">add a new product to your page</p>
        </div>
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
                    product title *
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
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-white/40 lowercase">tell customers what they'll receive</p>
                    <Link 
                      href="/dashboard/ai/writer"
                      className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors flex items-center lowercase"
                    >
                      <Bot className="h-3 w-3 mr-1" />
                      use ai to write this
                    </Link>
                  </div>
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
                      product type *
                    </label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value as ProductType)}
                      className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="digital">digital (pdf/file)</option>
                      <option value="coaching">coaching service</option>
                      <option value="service">service</option>
                      <option value="subscription">subscription</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            {productType === 'digital' && (
              <div className="bg-[#111] border border-white/5 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-6 lowercase">digital file</h2>
                
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.zip,.mp4,.mov,.avi"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/80 mb-2 lowercase">
                      {file ? file.name : 'click to upload file'}
                    </p>
                    <p className="text-sm text-white/40 lowercase">
                      pdf, zip, mp4, mov, avi up to 100mb
                    </p>
                  </label>
                </div>
              </div>
            )}

            {/* Thumbnail */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6 lowercase">thumbnail</h2>
              
              <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="hidden"
                  id="thumbnail-upload"
                  accept="image/*"
                />
                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/80 mb-2 lowercase">
                    {thumbnail ? thumbnail.name : 'click to upload thumbnail'}
                  </p>
                  <p className="text-sm text-white/40 lowercase">
                    jpg, png, webp up to 10mb
                  </p>
                </label>
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
                {loading ? 'creating...' : 'create product'}
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
              <div className="aspect-video bg-[#0a0a0a] flex items-center justify-center">
                {thumbnail ? (
                  <img 
                    src={URL.createObjectURL(thumbnail)} 
                    alt="Preview" 
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
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-500">
                    {price ? formatPrice(parseFloat(price) * 100) : '$0.00'}
                  </span>
                  <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/60 lowercase">
                    {productType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-sm text-emerald-100 lowercase">
              💡 tip: add a compelling description and high-quality thumbnail to increase sales
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}