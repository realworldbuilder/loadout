'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Package, 
  BarChart3, 
  Settings, 
  ExternalLink, 
  CreditCard,
  Users,
  Dumbbell,
  LogOut
} from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';

interface CreatorNavProps {
  creatorHandle?: string;
}

export default function CreatorNav({ creatorHandle }: CreatorNavProps) {
  const pathname = usePathname();
  const supabase = createSupabaseClient();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'Products',
      href: '/dashboard/products',
      icon: Package,
    },
    {
      label: 'Orders',
      href: '/dashboard/orders',
      icon: CreditCard,
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <nav className="w-64 bg-background-secondary border-r border-gray-800 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-primary-600" />
          <span className="text-lg font-bold text-gradient">GymSignal Creator</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Actions */}
      <div className="p-4 border-t border-gray-800">
        {/* View Storefront Link */}
        {creatorHandle && (
          <Link
            href={`/${creatorHandle}`}
            target="_blank"
            className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors mb-2"
          >
            <ExternalLink className="h-5 w-5" />
            <span>View Storefront</span>
          </Link>
        )}

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}