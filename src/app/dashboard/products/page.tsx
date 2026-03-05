'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCreatorProducts, deleteProduct, toggleProductActive } from '@/lib/products';
import type { Product } from '@/lib/products';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter,
  Package,
  ChevronDown,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink
} from 'lucide-react';

type SortOption = 'newest' | 'price_low' | 'price_high' | 'title';
type FilterOption = 'all' | 'active' | 'inactive';

export default function ProductsPage() {
  const { user, profile, initializing } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    if (profile) {
      loadProducts();
    }
  }, [profile]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, searchTerm, sortBy, filterBy]);

  async function loadProducts() {
    if (!profile) return;

    try {
      setLoading(true);
      const { data, error } = await getCreatorProducts(profile.id);
      
      if (error) {
        console.error('Error loading products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFiltersAndSort() {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(product => 
        filterBy === 'active' ? product.is_active : !product.is_active
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }

  async function handleToggleActive(productId: string, currentStatus: boolean) {
    try {
      const { error } = await toggleProductActive(productId, !currentStatus);
      
      if (error) {
        console.error('Error toggling product status:', error);
        return;
      }

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

  async function handleDeleteProduct(productId: string) {
    if (!window.confirm('are you sure you want to delete this product? this action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await deleteProduct(productId);
      
      if (error) {
        console.error('Error deleting product:', error);
        return;
      }

      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  function handleEditProduct(productId: string) {
    router.push(`/dashboard/products/${productId}/edit`);
  }

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'newest': return 'newest';
      case 'price_low': return 'price: low to high';
      case 'price_high': return 'price: high to low';
      case 'title': return 'title a-z';
    }
  };

  const getFilterLabel = (filter: FilterOption) => {
    switch (filter) {
      case 'all': return 'all products';
      case 'active': return 'active only';
      case 'inactive': return 'inactive only';
    }
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'digital_product': return 'digital';
      case 'coaching': return 'coaching';
      case 'affiliate_link': return 'affiliate';
      case 'subscription': return 'subscription';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60 lowercase">loading products...</p>
        </div>
      </div>
    );
  }

  const activeProducts = products.filter(p => p.is_active);

  return (
    <div className="px-6 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 lowercase">products</h1>
          <p className="text-white/60 lowercase">
            manage your digital products and services
          </p>
        </div>
        
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors lowercase"
          >
            <Plus className="h-4 w-4 mr-2" />
            add product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        /* Empty state */
        <div className="bg-[#111] border border-white/5 rounded-lg p-12 text-center">
          <Package className="h-16 w-16 text-white/20 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-white mb-2 lowercase">no products yet</h3>
          <p className="text-white/60 mb-8 lowercase">
            create your first product to start selling to your audience
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center px-6 py-3 bg-emerald-500 text-black font-medium rounded-lg hover:bg-emerald-400 transition-colors lowercase"
          >
            <Plus className="h-4 w-4 mr-2" />
            create your first product
          </Link>
        </div>
      ) : (
        <>
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#111] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 lowercase"
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-[#111] border border-white/10 rounded-lg text-white hover:border-white/20 transition-colors lowercase min-w-[200px] justify-between"
              >
                <span>sort: {getSortLabel(sortBy)}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[#111] border border-white/10 rounded-lg shadow-xl z-20">
                  {(['newest', 'price_low', 'price_high', 'title'] as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg lowercase ${
                        sortBy === option ? 'text-emerald-500' : 'text-white/80'
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
                className="flex items-center space-x-2 px-4 py-3 bg-[#111] border border-white/10 rounded-lg text-white hover:border-white/20 transition-colors lowercase min-w-[150px] justify-between"
              >
                <span>{getFilterLabel(filterBy)}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[#111] border border-white/10 rounded-lg shadow-xl z-20">
                  {(['all', 'active', 'inactive'] as FilterOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setFilterBy(option);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg lowercase ${
                        filterBy === option ? 'text-emerald-500' : 'text-white/80'
                      }`}
                    >
                      {getFilterLabel(option)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Products grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#111] border border-white/5 rounded-lg p-8 text-center">
              <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 lowercase">no products match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-[#161616] border border-white/5 rounded-lg overflow-hidden transition-all duration-200 hover:border-white/10 group">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-[#111] relative flex items-center justify-center">
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                        <Package className="h-8 w-8 text-white/40" />
                      </div>
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
                        onClick={() => handleToggleActive(product.id, product.is_active)}
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
                        onClick={() => handleEditProduct(product.id)}
                        className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
                        title="edit"
                      >
                        <Edit className="h-4 w-4 text-white/80" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-red-500/50 transition-colors"
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
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/60 lowercase">
                          {getProductTypeLabel(product.product_type)}
                        </span>
                      </div>

                      {product.product_type === 'affiliate_link' && product.external_url && (
                        <ExternalLink className="h-4 w-4 text-white/40" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
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