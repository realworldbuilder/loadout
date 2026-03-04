'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createSupabaseClient, type Product, type Order } from '@/lib/supabase';
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
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalProducts: 0,
    totalSold: 0,
    pageViews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseClient();

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

      // Load dashboard data once we have a profile
      loadDashboardData();
    }
  }, [user, profile, authLoading, router]);

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
      // Get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', creatorId)
        .eq('is_active', true);

      // For Phase 1, use placeholder stats since orders/revenue may not be implemented yet
      setStats({
        totalRevenue: 0, // Placeholder - will be real when orders are implemented
        totalProducts: productCount || 0,
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
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          products (title)
        `)
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(data || []);
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

  if (authLoading || loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60 lowercase">loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 lowercase">
          welcome back, {profile.display_name}
        </h1>
        <p className="text-white/60 lowercase">
          @{profile.handle} • here's how your page is performing
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/dashboard/products/new"
          className="bg-[#111] border border-white/5 rounded-lg p-6 hover:border-white/10 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <Plus className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-white lowercase">add product</h3>
          </div>
          <p className="text-sm text-white/60 lowercase">create a new product to sell</p>
        </Link>

        <Link
          href={`/${profile.handle}`}
          target="_blank"
          className="bg-[#111] border border-white/5 rounded-lg p-6 hover:border-white/10 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <ExternalLink className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-white lowercase">view my page</h3>
          </div>
          <p className="text-sm text-white/60 lowercase">see how visitors see your page</p>
        </Link>

        <button className="bg-[#111] border border-white/5 rounded-lg p-6 hover:border-white/10 transition-all duration-200 group text-left">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <Share2 className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-white lowercase">share link</h3>
          </div>
          <p className="text-sm text-white/60 lowercase">copy your page link to share</p>
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
          <div className="bg-[#111] border border-white/5 rounded-lg p-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2 lowercase">start selling</h3>
              <p className="text-white/60 text-sm mb-6 lowercase">
                create your first product to start earning
              </p>
              <Link 
                href="/dashboard/products/new"
                className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded transition-colors duration-200 lowercase"
              >
                <Plus className="h-4 w-4 mr-2" />
                add your first product
              </Link>
            </div>
          </div>
        )}

        {/* AI suggestion + Recent orders */}
        <div className="space-y-8">
          {/* AI suggestion */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Bot className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2 lowercase">ai suggestion</h3>
                <p className="text-emerald-100 text-sm mb-4 lowercase">
                  cutting season is trending — promote your shred program
                </p>
                <Link 
                  href="/dashboard/ai/writer"
                  className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors lowercase"
                >
                  use ai writer <TrendingUp className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-[#111] border border-white/5 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white lowercase">recent orders</h2>
              <Link href="/dashboard/orders" className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors lowercase">
                view all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 lowercase">no orders yet</p>
                <p className="text-sm text-white/40 mt-1 lowercase">
                  orders will appear here when customers purchase
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-[#161616] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        order.status === 'completed' ? 'bg-emerald-500' : 
                        order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-white text-sm">
                          {(order as any).products?.title || 'unknown product'}
                        </p>
                        <p className="text-xs text-white/60">{order.buyer_email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-white text-sm">{formatPrice(order.amount_cents)}</p>
                      <p className="text-xs text-white/40">
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