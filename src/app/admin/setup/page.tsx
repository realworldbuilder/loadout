'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_PASSWORD = 'loadout2024';

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  type: 'digital' | 'coaching' | 'link' | 'subscription';
  external_url?: string;
}

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
}

interface FormData {
  instagram_input: string;
  display_name: string;
  handle: string;
  bio: string;
  avatar_url: string;
  social_links: SocialLinks;
  ai_persona: string;
  products: Product[];
}

export default function AdminSetupPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    instagram_input: '',
    display_name: '',
    handle: '',
    bio: '',
    avatar_url: '',
    social_links: {},
    ai_persona: '',
    products: []
  });

  const router = useRouter();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('incorrect password');
    }
  };

  const slugify = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleInstagramChange = (value: string) => {
    const cleanHandle = value.replace(/[@\s]/g, '').replace(/^(https?:\/\/)?(www\.)?(instagram\.com\/)?/, '');
    
    setFormData(prev => ({
      ...prev,
      instagram_input: cleanHandle,
      display_name: prev.display_name || cleanHandle.replace(/_/g, ' '),
      handle: prev.handle || slugify(cleanHandle),
      social_links: {
        ...prev.social_links,
        instagram: cleanHandle ? `https://instagram.com/${cleanHandle}` : undefined
      }
    }));
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      title: '',
      description: '',
      price: '0',
      type: 'digital'
    };
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removeProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.display_name || !formData.handle) {
      setError('display name and handle are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/setup-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'failed to create creator');
      }

      setSuccess(`Creator page created! Live at: loadout.fit/${formData.handle}`);
      
      // Reset form
      setFormData({
        instagram_input: '',
        display_name: '',
        handle: '',
        bio: '',
        avatar_url: '',
        social_links: {},
        ai_persona: '',
        products: []
      });

    } catch (error: any) {
      setError(error.message || 'failed to create creator');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`https://loadout.fit/${formData.handle}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-[#111] border border-white/5 rounded-lg p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-white mb-2">admin access</h1>
              <p className="text-white/60 text-sm">enter password to access creator setup tool</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                  password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40"
                  placeholder="enter admin password"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-[#10a37f] hover:bg-[#0f8f6f] text-white font-medium rounded transition-colors duration-200"
              >
                unlock admin panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">creator setup tool</h1>
          <p className="text-white/60">create loadout pages for creators before they sign up</p>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-lg p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-sm">
              {success}
              {formData.handle && (
                <button
                  onClick={copyUrl}
                  className="ml-2 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-1 rounded"
                >
                  copy url
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Instagram Handle Input */}
            <div>
              <label className="block text-white text-lg font-semibold mb-4">
                instagram handle or creator name
              </label>
              <input
                type="text"
                value={formData.instagram_input}
                onChange={(e) => handleInstagramChange(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40 text-lg"
                placeholder="@fitnessinfluencer or instagram.com/fitnessinfluencer"
              />
              <p className="mt-2 text-sm text-white/50">
                enter their Instagram handle to auto-fill what we can
              </p>
            </div>

            {/* Auto-filled and Manual Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  display name *
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => updateFormData('display_name', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40"
                  placeholder="Creator Name"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  handle * (url slug)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40">@</span>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => updateFormData('handle', slugify(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40"
                    placeholder="creator_handle"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40 resize-none"
                placeholder="tell their audience what they're about..."
                maxLength={160}
              />
              <p className="mt-1 text-xs text-white/50">{formData.bio.length}/160 characters</p>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                avatar url
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => updateFormData('avatar_url', e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40"
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">social links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/handle' },
                  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@handle' },
                  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@handle' },
                  { key: 'twitter', label: 'Twitter/X', placeholder: 'https://x.com/handle' },
                ].map((social) => (
                  <div key={social.key}>
                    <label className="block text-white/70 text-sm mb-1">
                      {social.label}
                    </label>
                    <input
                      type="url"
                      value={formData.social_links[social.key as keyof SocialLinks] || ''}
                      onChange={(e) => updateSocialLink(social.key as keyof SocialLinks, e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40"
                      placeholder={social.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Persona */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                ai chat personality/persona
              </label>
              <textarea
                value={formData.ai_persona}
                onChange={(e) => updateFormData('ai_persona', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40 resize-none"
                placeholder="describe their personality, tone, expertise areas..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-white/50">{formData.ai_persona.length}/500 characters</p>
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-semibold">products</h3>
                <button
                  type="button"
                  onClick={addProduct}
                  className="px-4 py-2 bg-[#10a37f] hover:bg-[#0f8f6f] text-white text-sm rounded transition-colors"
                >
                  add product
                </button>
              </div>

              {formData.products.map((product, index) => (
                <div key={product.id} className="bg-black/30 border border-white/5 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">product {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-xs mb-1">title *</label>
                      <input
                        type="text"
                        value={product.title}
                        onChange={(e) => updateProduct(product.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40 text-sm"
                        placeholder="product title"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-xs mb-1">price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40 text-sm"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-xs mb-1">type</label>
                      <select
                        value={product.type}
                        onChange={(e) => updateProduct(product.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white text-sm"
                      >
                        <option value="digital">digital</option>
                        <option value="coaching">coaching</option>
                        <option value="link">link</option>
                        <option value="subscription">subscription</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/70 text-xs mb-1">external url</label>
                      <input
                        type="url"
                        value={product.external_url || ''}
                        onChange={(e) => updateProduct(product.id, 'external_url', e.target.value)}
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40 text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-white/70 text-xs mb-1">description</label>
                    <textarea
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:outline-none focus:border-[#10a37f] text-white placeholder-white/40 resize-none text-sm"
                      placeholder="product description..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="border-t border-white/10 pt-6">
              <button
                type="submit"
                disabled={loading || !formData.display_name || !formData.handle}
                className="w-full py-3 px-6 bg-[#10a37f] hover:bg-[#0f8f6f] disabled:bg-[#10a37f]/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
              >
                {loading ? 'creating creator page...' : 'create creator page'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}