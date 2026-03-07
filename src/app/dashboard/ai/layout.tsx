'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wand2, PenTool } from 'lucide-react';

export default function AILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'product writer',
      href: '/dashboard/ai/writer',
      icon: PenTool,
    },
    {
      label: 'content lab',
      href: '/dashboard/ai/content',
      icon: Wand2,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">ai tools</h1>
            <p className="text-gray-400">
              ai-powered product copy and social content generation
            </p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex space-x-1 bg-white dark:bg-[#111] p-1 rounded-lg mb-8 w-fit">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 text-sm
                  ${isActive 
                    ? 'bg-emerald-500 text-black font-medium' 
                    : 'text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Content */}
        {children}
    </div>
  );
}