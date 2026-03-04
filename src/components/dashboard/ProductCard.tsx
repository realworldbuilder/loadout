import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/supabase';
import { 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Package 
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onToggleActive?: (productId: string, currentStatus: boolean) => void;
}

export default function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('are you sure you want to delete this product? this action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDelete?.(product.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="bg-[#161616] border border-white/5 rounded-lg overflow-hidden transition-all duration-200 hover:border-white/10 group">
      {/* Thumbnail */}
      <div className="aspect-video bg-[#111] relative flex items-center justify-center">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <Package className="h-8 w-8 text-white/40" />
        )}
        
        {/* Status indicator */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full lowercase ${
            product.is_active 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
              : 'bg-white/10 text-white/60 border border-white/10'
          }`}>
            {product.is_active ? 'active' : 'inactive'}
          </span>
        </div>

        {/* Actions overlay - shown on hover */}
        <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleActive?.(product.id, product.is_active)}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
            title={product.is_active ? 'deactivate' : 'activate'}
          >
            {product.is_active ? (
              <ToggleRight className="h-4 w-4 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-white/60" />
            )}
          </button>
          
          <button
            onClick={() => onEdit?.(product)}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
            title="edit"
          >
            <Edit className="h-4 w-4 text-white/80" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-red-500/50 transition-colors disabled:opacity-50"
            title="delete"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{product.title}</h3>
        
        {product.description && (
          <p className="text-sm text-white/60 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-emerald-500">
              {formatPrice(product.price_cents)}
            </span>
            <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/60 lowercase">
              {product.type}
            </span>
          </div>

          <div className="text-xs text-white/40">
            sold: {product.metadata?.sold_count || 0}
          </div>
        </div>
      </div>
    </div>
  );
}