'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Package, 
  Bot, 
  Calendar, 
  BarChart3, 
  Mail, 
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Layers
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAiToolsExpanded, setIsAiToolsExpanded] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      label: 'overview',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'products',
      href: '/dashboard/products',
      icon: Package,
    },
    {
      label: 'ai tools',
      icon: Bot,
      items: [
        { label: 'product writer', href: '/dashboard/ai/writer' },
        { label: 'content lab', href: '/dashboard/ai/content' },
      ]
    },
    {
      label: 'calendar',
      href: '/dashboard/calendar',
      icon: Calendar,
    },
    {
      label: 'analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      label: 'pipeline',
      href: '/dashboard/pipeline',
      icon: Mail,
    },
    {
      label: 'settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Dumbbell className="h-6 w-6 text-emerald-500" />
          <span className="text-lg font-bold text-white lowercase">loadout</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-4">
          {navItems.map((item) => {
            if (item.items) {
              // AI Tools submenu
              const isAiActive = item.items.some(subItem => isActiveLink(subItem.href));
              
              return (
                <li key={item.label}>
                  <button
                    onClick={() => setIsAiToolsExpanded(!isAiToolsExpanded)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      isAiActive
                        ? 'bg-emerald-500 text-black' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium lowercase">{item.label}</span>
                    </div>
                    {isAiToolsExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {isAiToolsExpanded && (
                    <ul className="mt-2 ml-6 space-y-1">
                      {item.items.map((subItem) => (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={`block px-3 py-2 rounded-lg transition-colors text-sm ${
                              isActiveLink(subItem.href)
                                ? 'bg-emerald-500 text-black' 
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            // Regular nav item
            const isActive = isActiveLink(item.href!);
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href!}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-black' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium lowercase">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#111] border border-white/10 rounded-lg text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:w-64 bg-[#111] border-r border-white/5 min-h-screen ${className}`}>
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 w-64 h-full bg-[#111] border-r border-white/5 z-50 lg:hidden flex flex-col">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-white/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </>
      )}

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/5 z-30">
        <div className="flex items-center justify-around py-2">
          {[navItems[0], navItems[1], navItems[4], navItems[6]].map((item) => {
            const isActive = isActiveLink(item.href!);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive ? 'text-emerald-500' : 'text-white/60'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs lowercase">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}