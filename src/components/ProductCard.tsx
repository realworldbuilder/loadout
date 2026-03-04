'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Download, 
  ExternalLink, 
  Calendar,
  Package,
  CreditCard,
  Loader2
} from 'lucide-react';
import { type Product, type Creator } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';

interface ProductCardProps {
  product: Product;
  creator: Creator;
}

export default function ProductCard({ product, creator }: ProductCardProps) {
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    try {
      setLoading(true);
      
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          successUrl: `${window.location.origin}/${creator.handle}?success=true`,
          cancelUrl: `${window.location.origin}/${creator.handle}`,
        }),
      });

      const { url, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Unable to process purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getProductIcon() {
    switch (product.type) {
      case 'digital':
        return <Download className="h-5 w-5" />;
      case 'coaching':
        return <Calendar className="h-5 w-5" />;
      case 'link':
        return <ExternalLink className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  }

  function getProductTypeLabel() {
    switch (product.type) {
      case 'digital':
        return 'Digital Product';
      case 'coaching':
        return 'Coaching Service';
      case 'link':
        return 'External Link';
      default:
        return 'Product';
    }
  }

  return (
    <div className="card card-hover">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Product Type Badge */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="flex items-center space-x-1 text-sm text-gray-400">
                {getProductIcon()}
                <span>{getProductTypeLabel()}</span>
              </span>
            </div>

            {/* Product Title */}
            <h3 className="text-xl font-semibold mb-2 text-white">
              {product.title}
            </h3>

            {/* Product Description */}
            {product.description && (
              <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Product Thumbnail */}
          <div className="ml-4 flex-shrink-0">
            {product.thumbnail_url ? (
              <Image
                src={product.thumbnail_url}
                alt={product.title}
                width={80}
                height={80}
                className="rounded-lg object-cover border border-gray-700"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-primary rounded-lg flex items-center justify-center">
                {getProductIcon()}
              </div>
            )}
          </div>
        </div>

        {/* Product Actions */}
        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="text-2xl font-bold text-gradient">
            {product.price_cents === 0 ? 'Free' : formatPrice(product.price_cents)}
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="btn-primary flex items-center space-x-2 min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>{product.price_cents === 0 ? 'Get Free' : 'Buy Now'}</span>
              </>
            )}
          </button>
        </div>

        {/* Additional Product Info */}
        <div className="mt-4 pt-4 border-t border-gray-800 text-sm text-gray-400">
          <div className="flex items-center justify-between">
            <span>
              {product.type === 'digital' && product.download_limit && (
                `${product.download_limit} downloads included`
              )}
              {product.type === 'coaching' && (
                'Personalized coaching session'
              )}
              {product.type === 'link' && (
                'External resource'
              )}
            </span>
            
            {product.metadata?.duration && (
              <span>{product.metadata.duration}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}