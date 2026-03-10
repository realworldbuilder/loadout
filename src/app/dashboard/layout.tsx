'use client';

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  Layers,
  Dumbbell,
  Sun,
  Moon,
  Tag,
  Heart,
  ClipboardList,
  FileText
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'overview', icon: LayoutDashboard },
  { href: '/dashboard/page-builder', label: 'page builder', icon: Layers },
  { href: '/dashboard/products', label: 'products', icon: Package },
  { href: '/dashboard/codes', label: 'codes', icon: Tag },
  { href: '/dashboard/picks', label: 'picks', icon: Heart },
  { href: '/dashboard/applications', label: 'applications', icon: FileText },
  { href: '/dashboard/coaching', label: 'coaching', icon: ClipboardList },
  { href: '/dashboard/analytics', label: 'analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, initializing } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
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

  const handleThemeToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // Show loading skeleton while auth is initializing
  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#212121] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-400 dark:border-white/60 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-white/60 lowercase">loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#212121] flex">
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
        bg-white dark:bg-[#171717] border-r border-gray-200 dark:border-white/10
        flex flex-col
        transform transition-all duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`p-5 border-b border-gray-200 dark:border-white/10 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <Link href="/" className="flex items-center gap-2">
            {sidebarCollapsed ? (
              <span className="text-lg">🏋️</span>
            ) : (
              <>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">loadout</span>
                <span className="text-[10px] font-medium text-gray-500 dark:text-white/40 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">beta</span>
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
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
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

        {/* Theme toggle */}
        <div className="p-3">
          <button
            onClick={handleThemeToggle}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? `theme: ${theme}` : undefined}
          >
            {theme === 'light' ? <Sun size={16} /> : theme === 'dark' ? <Moon size={16} /> : (systemTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />)}
            {!sidebarCollapsed && (
              <span>
                {theme === 'system' ? `auto (${systemTheme})` : theme}
              </span>
            )}
          </button>
        </div>

        {/* Collapse toggle - only show on desktop */}
        <div className="hidden lg:block p-3">
          <button
            onClick={toggleCollapsed}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? 'expand sidebar' : 'collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>collapse</span></>}
          </button>
        </div>

        {/* Profile + view page */}
        <div className="p-3 border-t border-gray-200 dark:border-white/10 space-y-2">
          {profile?.handle && (
            <Link
              href={`/${profile.handle}`}
              target="_blank"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? 'view my page' : undefined}
            >
              <ExternalLink size={16} />
              {!sidebarCollapsed && 'view my page'}
            </Link>
          )}
          
          {sidebarCollapsed ? (
            <button 
              onClick={handleSignOut}
              className="flex items-center justify-center px-3 py-2 text-gray-400 dark:text-white/30 hover:text-red-400 transition-colors"
              title="sign out"
            >
              <LogOut size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white truncate">{profile?.display_name || 'creator'}</p>
                <p className="text-xs text-gray-500 dark:text-white/40 truncate">@{profile?.handle || '...'}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="text-gray-400 dark:text-white/30 hover:text-red-400 transition-colors"
                title="sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} transition-all duration-200`}>
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-gray-50/80 dark:bg-[#212121]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-bold text-gray-900 dark:text-white">loadout</span>
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
