export const dynamic = "force-dynamic";
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createSupabaseClient, type Creator, type Product } from '@/lib/supabase';
import ProductCard from '@/components/dashboard/ProductCard';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter,
  Package,
  ChevronDown
} from 'lucide-react';

type SortOption = 'newest' | 'best_selling' | 'price_low' | 'price_high';
type FilterOption = 'all' | 'active' | 'inactive';

export default function ProductsPage() {
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, searchTerm, sortBy, filterBy]);

  async function loadProducts() {
    if (!user) return;

    try {
      setLoading(true);
      
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
        case 'best_selling':
          return (b.metadata?.sold_count || 0) - (a.metadata?.sold_count || 0);
        case 'price_low':
          return a.price_cents - b.price_cents;
        case 'price_high':
          return b.price_cents - a.price_cents;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }

  async function handleToggleActive(productId: string, currentStatus: boolean) {
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

  async function handleDeleteProduct(productId: string) {
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

  function handleEditProduct(product: Product) {
    // TODO: Implement edit functionality or redirect to edit page
    console.log('Edit product:', product);
  }

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'newest': return 'newest';
      case 'best_selling': return 'best selling';
      case 'price_low': return 'price: low to high';
      case 'price_high': return 'price: high to low';
    }
  };

  const getFilterLabel = (filter: FilterOption) => {
    switch (filter) {
      case 'all': return 'all products';
      case 'active': return 'active only';
      case 'inactive': return 'inactive only';
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
          {creator?.tier === 'free' && (
            <p className="text-sm text-yellow-500 mt-2 lowercase">
              free tier: {activeProducts.length}/3 active products
            </p>
          )}
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
                  {(['newest', 'best_selling', 'price_low', 'price_high'] as SortOption[]).map((option) => (
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
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleActive={handleToggleActive}
                />
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