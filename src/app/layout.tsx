import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'loadout — fitness creator storefront',
  description: 'The Stan.store for fitness creators. Sell workout plans, coaching, and digital products with your custom link-in-bio page.',
  keywords: [
    'fitness creator',
    'workout plans',
    'personal training',
    'link in bio',
    'creator storefront',
    'gym influencer',
    'fitness coaching',
  ],
  authors: [{ name: 'loadout' }],
  openGraph: {
    title: 'loadout — fitness creator storefront',
    description: 'The all-in-one platform for fitness creators to sell digital products and grow their business.',
    type: 'website',
    locale: 'en_US',
    siteName: 'loadout',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'loadout — fitness creator storefront',
    description: 'The all-in-one platform for fitness creators to sell digital products and grow their business.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <main className="min-h-screen bg-gray-50 dark:bg-[#212121]">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}