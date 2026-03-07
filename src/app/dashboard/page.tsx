'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { type Product, type Order } from '@/lib/supabase';
import StatsCard from '@/components/dashboard/StatsCard';
import Link from 'next/link';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Eye,
  Plus,
  ExternalLink,
  Share2,
  Bot,
  TrendingUp
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  totalSold: number;
  pageViews: number;
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading, initializing } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalProducts: 0,
    totalSold: 0,
    pageViews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Auth guards
  useEffect(() => {
    // Wait for initial auth check to complete
    if (initializing) return;
    
    // If still loading profile updates, wait
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    // undefined = still loading profile, null = no profile exists
    if (profile === undefined) return;
    
    if (profile === null) {
      router.push('/onboarding');
      return;
    }

    // Load dashboard data once we have a profile
    loadDashboardData();
  }, [user, profile, authLoading, initializing, router]);

  async function loadDashboardData() {
    if (!profile) return;

    try {
      setLoading(true);
      
      await Promise.all([
        loadStats(profile.id),
        loadRecentOrders(profile.id),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats(creatorId: string) {
    try {
      // Get product count by fetching all products and counting active ones
      const response = await fetch(`/api/products?creator_id=${creatorId}`);
      
      let productCount = 0;
      if (response.ok) {
        const result = await response.json();
        productCount = (result.data || []).filter((p: Product) => p.is_active).length;
      }

      // For Phase 1, use placeholder stats since orders/revenue may not be implemented yet
      setStats({
        totalRevenue: 0, // Placeholder - will be real when orders are implemented
        totalProducts: productCount,
        totalSold: 0, // Placeholder - will be real when orders are implemented
        pageViews: 0, // Placeholder - will be real when analytics are implemented
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to placeholder stats
      setStats({
        totalRevenue: 0,
        totalProducts: 0,
        totalSold: 0,
        pageViews: 0,
      });
    }
  }

  async function loadRecentOrders(creatorId: string) {
    try {
      // For Phase 1, just show empty orders since there's no orders API route yet
      // When orders are implemented, this will be replaced with:
      // const response = await fetch(`/api/orders?creator_id=${creatorId}&limit=5`);
      setRecentOrders([]);
    } catch (error) {
      console.error('Error loading recent orders:', error);
      // Ignore error since orders table might not exist yet in Phase 1
      setRecentOrders([]);
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Revenue chart data removed for Phase 1 - will be added when real analytics are implemented

  if (initializing || authLoading || loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-400 dark:border-white/60 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-white/60 lowercase">
            {initializing ? 'checking auth...' : authLoading ? 'loading profile...' : 'loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 lowercase">
          welcome back, {profile.display_name}
        </h1>
        <p className="text-gray-500 dark:text-white/60 lowercase">
          @{profile.handle} • here's how your page is performing
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/dashboard/products/new"
          className="bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-white/10 rounded-lg p-6 hover:border-gray-300 dark:hover:border-white/15 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
              <Plus className="h-5 w-5 text-gray-500 dark:text-white/60" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white lowercase">add product</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-white/60 lowercase">create a new product to sell</p>
        </Link>

        <Link
          href={`/${profile.handle}`}
          target="_blank"
          className="bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-white/10 rounded-lg p-6 hover:border-gray-300 dark:hover:border-white/15 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
              <ExternalLink className="h-5 w-5 text-gray-500 dark:text-white/60" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white lowercase">view my page</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-white/60 lowercase">see how visitors see your page</p>
        </Link>

        <button className="bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-white/10 rounded-lg p-6 hover:border-gray-300 dark:hover:border-white/15 transition-all duration-200 group text-left">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
              <Share2 className="h-5 w-5 text-gray-500 dark:text-white/60" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white lowercase">share link</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-white/60 lowercase">copy your page link to share</p>
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="total revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title="products"
          value={stats.totalProducts}
          icon={Package}
        />
        <StatsCard
          title="total sold"
          value={stats.totalSold}
          icon={ShoppingCart}
        />
        <StatsCard
          title="page views"
          value={stats.pageViews.toLocaleString()}
          icon={Eye}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Empty state for products */}
        {stats.totalProducts === 0 && (
          <div className="bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-white/10 rounded-lg p-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 lowercase">start selling</h3>
              <p className="text-gray-500 dark:text-white/60 text-sm mb-6 lowercase">
                create your first product to start earning
              </p>
              <Link 
                href="/dashboard/products/new"
                className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-white text-gray-900 dark:text-black hover:bg-gray-800 dark:hover:bg-white/90 font-medium rounded transition-colors duration-200 lowercase"
              >
                <Plus className="h-4 w-4 mr-2" />
                add your first product
              </Link>
            </div>
          </div>
        )}

        {/* AI suggestion + Recent orders */}
        <div className="space-y-8">
          {/* Recent orders */}
          <div className="bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white lowercase">recent orders</h2>
              <Link href="/dashboard/orders" className="text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white transition-colors lowercase">
                view all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-white/60 lowercase">no orders yet</p>
                <p className="text-sm text-gray-400 dark:text-white/40 mt-1 lowercase">
                  orders will appear here when customers purchase
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#3f3f3f] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        order.status === 'completed' ? 'bg-emerald-500' : 
                        order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {(order as any).products?.title || 'unknown product'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-white/60">{order.buyer_email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatPrice(order.amount_cents)}</p>
                      <p className="text-xs text-gray-400 dark:text-white/40">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}