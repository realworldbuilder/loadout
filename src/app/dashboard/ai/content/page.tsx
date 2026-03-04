'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Image as ImageIcon, User, Copy, Loader2, Check } from 'lucide-react';
import { createSupabaseClient, type Product } from '@/lib/supabase';

interface GeneratedCaption {
  content: string;
  hashtags: string[];
}

interface CarouselSlide {
  slideNumber: number;
  title: string;
  content: string;
}

interface GeneratedBio {
  bio: string;
  characterCount: number;
}

const CONTENT_STYLES = ['hype', 'educational', 'story', 'controversial', 'minimal'];
const PLATFORMS = ['instagram', 'tiktok', 'twitter/x'];

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<'caption' | 'carousel' | 'bio'>('caption');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Caption Generator State
  const [selectedProduct, setSelectedProduct] = useState('');
  const [contentStyle, setContentStyle] = useState(CONTENT_STYLES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [generatedCaptions, setGeneratedCaptions] = useState<GeneratedCaption[]>([]);

  // Carousel Builder State  
  const [carouselTopic, setCarouselTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);

  // Bio Generator State
  const [credentials, setCredentials] = useState('');
  const [niche, setNiche] = useState('');
  const [personality, setPersonality] = useState('');
  const [generatedBios, setGeneratedBios] = useState<GeneratedBio[]>([]);

  const supabase = createSupabaseClient();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: creatorData } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (creatorData) {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('creator_id', creatorData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  const handleCopyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateCaptions = async () => {
    if (!selectedProduct) return;
    
    setIsLoading(true);
    try {
      const product = products.find(p => p.id === selectedProduct);
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'caption',
          productInfo: {
            title: product?.title,
            description: product?.description,
            type: product?.type
          },
          style: contentStyle,
          platform
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      setGeneratedCaptions(data.captions || []);
    } catch (error) {
      console.error('Error generating captions:', error);
      alert('Failed to generate captions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCarousel = async () => {
    if (!carouselTopic.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'carousel',
          topic: carouselTopic,
          slideCount
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      setCarouselSlides(data.slides || []);
    } catch (error) {
      console.error('Error generating carousel:', error);
      alert('Failed to generate carousel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBios = async () => {
    if (!credentials.trim() || !niche.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bio',
          credentials,
          niche,
          personality
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      setGeneratedBios(data.bios || []);
    } catch (error) {
      console.error('Error generating bios:', error);
      alert('Failed to generate bios. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'caption', label: 'caption generator', icon: MessageSquare },
    { id: 'carousel', label: 'carousel builder', icon: ImageIcon },
    { id: 'bio', label: 'bio generator', icon: User },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#111] p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 text-sm
                ${isActive 
                  ? 'bg-emerald-500 text-black font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Caption Generator */}
        {activeTab === 'caption' && (
          <>
            {/* Left Panel */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-emerald-500" />
                caption generator
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    select product to promote
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500/50 focus:ring-0"
                  >
                    <option value="">choose a product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id} className="bg-[#0a0a0a]">
                        {product.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    style
                  </label>
                  <select
                    value={contentStyle}
                    onChange={(e) => setContentStyle(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500/50 focus:ring-0"
                  >
                    {CONTENT_STYLES.map((style) => (
                      <option key={style} value={style} className="bg-[#0a0a0a]">
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500/50 focus:ring-0"
                  >
                    {PLATFORMS.map((plat) => (
                      <option key={plat} value={plat} className="bg-[#0a0a0a]">
                        {plat}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={generateCaptions}
                  disabled={!selectedProduct || isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      generating...
                    </>
                  ) : (
                    'generate captions'
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel - Generated Captions */}
            <div className="space-y-4">
              {generatedCaptions.length === 0 && !isLoading && (
                <div className="bg-[#111] border border-white/5 rounded-lg p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-500" />
                  <p className="text-gray-500">generated captions will appear here</p>
                </div>
              )}

              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#111] border border-white/5 rounded-lg p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                        <div className="h-4 bg-white/10 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {generatedCaptions.map((caption, index) => (
                <div key={index} className="bg-[#111] border border-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-gray-400">option {index + 1}</span>
                    <button
                      onClick={() => handleCopyToClipboard(caption.content + '\n\n' + caption.hashtags.map(h => `#${h}`).join(' '), index)}
                      className="flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-white mb-3 whitespace-pre-wrap">{caption.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {caption.hashtags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="text-emerald-400 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Carousel Builder */}
        {activeTab === 'carousel' && (
          <>
            {/* Left Panel */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-emerald-500" />
                carousel builder
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    topic
                  </label>
                  <textarea
                    value={carouselTopic}
                    onChange={(e) => setCarouselTopic(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-0 resize-none"
                    rows={3}
                    placeholder="what should this carousel be about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    number of slides
                  </label>
                  <select
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500/50 focus:ring-0"
                  >
                    {[5, 6, 7, 8, 9, 10].map((count) => (
                      <option key={count} value={count} className="bg-[#0a0a0a]">
                        {count} slides
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={generateCarousel}
                  disabled={!carouselTopic.trim() || isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      building...
                    </>
                  ) : (
                    'build carousel'
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel - Carousel Slides */}
            <div className="space-y-4">
              {carouselSlides.length === 0 && !isLoading && (
                <div className="bg-[#111] border border-white/5 rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-500" />
                  <p className="text-gray-500">carousel slides will appear here</p>
                </div>
              )}

              {isLoading && (
                <div className="space-y-4">
                  {Array.from({ length: slideCount }).map((_, i) => (
                    <div key={i} className="bg-[#111] border border-white/5 rounded-lg p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-white/10 rounded w-1/4"></div>
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {carouselSlides.map((slide) => (
                <div key={slide.slideNumber} className="bg-[#111] border border-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-gray-400 bg-emerald-500/20 px-2 py-1 rounded">
                      slide {slide.slideNumber}
                    </span>
                    <button
                      onClick={() => handleCopyToClipboard(`${slide.title}\n\n${slide.content}`, slide.slideNumber)}
                      className="flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {copiedIndex === slide.slideNumber ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          copy
                        </>
                      )}
                    </button>
                  </div>
                  <h4 className="font-semibold text-white mb-2">{slide.title}</h4>
                  <p className="text-gray-300 text-sm">{slide.content}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bio Generator */}
        {activeTab === 'bio' && (
          <>
            {/* Left Panel */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-emerald-500" />
                bio generator
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    credentials
                  </label>
                  <input
                    type="text"
                    value={credentials}
                    onChange={(e) => setCredentials(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-0"
                    placeholder="e.g., NASM-CPT, 5 years experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    niche
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-0"
                    placeholder="e.g., strength training, weight loss"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    personality (optional)
                  </label>
                  <input
                    type="text"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-0"
                    placeholder="e.g., motivational, science-based"
                  />
                </div>

                <button
                  onClick={generateBios}
                  disabled={!credentials.trim() || !niche.trim() || isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      generating...
                    </>
                  ) : (
                    'generate bios'
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel - Generated Bios */}
            <div className="space-y-4">
              {generatedBios.length === 0 && !isLoading && (
                <div className="bg-[#111] border border-white/5 rounded-lg p-8 text-center">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-500" />
                  <p className="text-gray-500">generated bios will appear here</p>
                </div>
              )}

              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#111] border border-white/5 rounded-lg p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {generatedBios.map((bio, index) => (
                <div key={index} className="bg-[#111] border border-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">option {index + 1}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        bio.characterCount <= 150 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {bio.characterCount}/150
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(bio.bio, index + 100)}
                      className="flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {copiedIndex === index + 100 ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-white">{bio.bio}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}