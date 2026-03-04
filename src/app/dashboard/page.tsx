'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient, type Creator, type Product, type Order } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Users,
  ExternalLink,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
}

export default function DashboardPage() {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalViews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
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
        
        // Load stats and recent orders
        await Promise.all([
          loadStats(creatorData.id),
          loadRecentOrders(creatorData.id),
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats(creatorId: string) {
    try {
      // Get revenue and order count
      const { data: orders } = await supabase
        .from('orders')
        .select('amount_cents, platform_fee_cents')
        .eq('creator_id', creatorId)
        .eq('status', 'completed');

      const totalRevenue = orders?.reduce((sum, order) => 
        sum + (order.amount_cents - order.platform_fee_cents), 0) || 0;
      const totalOrders = orders?.length || 0;

      // Get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', creatorId)
        .eq('is_active', true);

      // Get page views
      const { count: viewCount } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', creatorId);

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts: productCount || 0,
        totalViews: viewCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
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
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-2xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to GymSignal Creator!</h1>
          <p className="text-gray-400 mb-6">Let's set up your creator profile to get started.</p>
          <Link href="/onboarding" className="btn-primary">
            Complete Setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {creator.display_name}!</h1>
            <p className="text-gray-400">
              Here's how your storefront is performing
            </p>
          </div>
          
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link 
              href={`/${creator.handle}`}
              target="_blank"
              className="btn-secondary flex items-center"
            >
              View Storefront
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/dashboard/products" className="btn-primary flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gradient">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Products</p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profile Views</p>
                <p className="text-3xl font-bold">{stats.totalViews}</p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="p-6 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Link href="/dashboard/orders" className="text-primary-600 hover:text-primary-500">
                View All
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No orders yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Orders will appear here when customers purchase your products
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        order.status === 'completed' ? 'bg-green-500' : 
                        order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{(order as any).product_title || 'Product'}</p>
                        <p className="text-sm text-gray-400">{order.buyer_email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.amount_cents)}</p>
                      <p className="text-sm text-gray-400">
                        {formatRelativeTime(order.created_at)}
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