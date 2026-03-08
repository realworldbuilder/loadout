'use client';

import { useState } from 'react';
import { Bookmark, Check, Copy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BookmarkletPage() {
  const [copied, setCopied] = useState(false);

  // The bookmarklet code - extracts og:title, og:image, and current URL, then redirects to loadout
  const bookmarkletCode = `javascript:void(function(){var t=document.querySelector('meta[property="og:title"]'),i=document.querySelector('meta[property="og:image"]'),n=document.querySelector('meta[name="og:title"]'),m=document.querySelector('meta[name="og:image"]'),ti=t?t.content:n?n.content:document.title,im=i?i.content:m?m.content:'',p=document.querySelector('meta[property="product:price:amount"]'),pr=p?p.content:'';window.open('https://loadout.fit/dashboard/picks#add='+encodeURIComponent(JSON.stringify({title:ti,image_url:im,product_url:window.location.href,price:pr})),'_self')}())`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href="/dashboard/picks" 
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        back to picks
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2 lowercase">add from browser</h1>
      <p className="text-white/60 mb-8">
        add products to your picks from any website — even ones our scraper can't reach (like youngla, gymshark, etc)
      </p>

      {/* How it works */}
      <div className="bg-[#171717] border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 lowercase">how it works</h2>
        <ol className="space-y-4 text-white/80">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span>drag the button below to your bookmarks bar</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span>browse to any product page (youngla, gymshark, nike, anywhere)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <span>click the bookmarklet → it grabs the product name, image, and URL</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <span>you'll land back on loadout with everything pre-filled. just save.</span>
          </li>
        </ol>
      </div>

      {/* The bookmarklet */}
      <div className="bg-[#171717] border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 lowercase">the bookmarklet</h2>
        <p className="text-white/60 text-sm mb-4">
          drag this button to your bookmarks bar:
        </p>
        
        <div className="flex items-center gap-4 mb-6">
          {/* The draggable bookmarklet link */}
          <a
            href={bookmarkletCode}
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors cursor-grab active:cursor-grabbing text-sm"
            title="Drag this to your bookmarks bar"
          >
            <Bookmark size={16} />
            + add to loadout
          </a>
          
          <span className="text-white/40 text-sm">← drag to bookmarks bar</span>
        </div>

        {/* Alternative: copy */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-white/40 text-xs mb-2 lowercase">
            on mobile or can't drag? copy the code and create a bookmark manually:
          </p>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/60 transition-colors"
          >
            {copied ? (
              <><Check size={14} className="text-emerald-400" /> copied!</>
            ) : (
              <><Copy size={14} /> copy bookmarklet code</>
            )}
          </button>
        </div>
      </div>

      {/* Works with */}
      <div className="bg-[#171717] border border-white/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-3 lowercase">works with any site</h2>
        <p className="text-white/60 text-sm">
          youngla, gymshark, dfyne, nike, amazon, 1st phorm, alphalete — any product page with an image. 
          the bookmarklet runs in your browser so cloudflare/bot protection doesn't matter.
        </p>
      </div>
    </div>
  );
}
