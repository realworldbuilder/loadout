'use client';

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings, 
  ExternalLink,
  Menu,
  X,
  LogOut,
  Bot,
  User,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

const navItems = [
  { href: '/dashboard/page-builder', label: 'page builder', icon: Layers },
  { href: '/dashboard', label: 'overview', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'products', icon: Package },
  { href: '/dashboard/analytics', label: 'analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, initializing } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      setSidebarCollapsed(savedCollapsed === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', newCollapsed.toString());
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Show loading skeleton while auth is initializing
  if (initializing) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-white/60 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60 lowercase">loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        bg-[#171717] border-r border-white/10
        flex flex-col
        transform transition-all duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            {sidebarCollapsed ? (
              <span className="text-xl font-bold text-white tracking-tight">L</span>
            ) : (
              <>
                <span className="text-xl font-bold text-white tracking-tight">loadout</span>
                <span className="text-[10px] font-medium text-white/40 bg-white/5 px-1.5 py-0.5 rounded">beta</span>
              </>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${sidebarCollapsed ? 'justify-center' : ''}
                  ${active 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!sidebarCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle - only show on desktop */}
        <div className="hidden lg:block p-3">
          <button
            onClick={toggleCollapsed}
            className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            title={sidebarCollapsed ? 'expand sidebar' : 'collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Profile + view page */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {profile?.handle && (
            <Link
              href={`/${profile.handle}`}
              target="_blank"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? 'view my page' : undefined}
            >
              <ExternalLink size={16} />
              {!sidebarCollapsed && 'view my page'}
            </Link>
          )}
          
          <div className={`flex items-center gap-3 px-3 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <User size={14} className="text-emerald-400" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{profile?.display_name || 'creator'}</p>
                <p className="text-xs text-white/40 truncate">@{profile?.handle || '...'}</p>
              </div>
            )}
            <button 
              onClick={handleSignOut}
              className={`text-white/30 hover:text-red-400 transition-colors ${sidebarCollapsed ? 'hidden' : ''}`}
              title="sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} transition-all duration-200`}>
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-bold text-white">loadout</span>
          <div className="w-6" /> {/* spacer */}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
