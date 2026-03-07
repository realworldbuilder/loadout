'use client';

import { useState } from 'react';
import { Wand2, Copy, ExternalLink, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GeneratedContent {
  title: string;
  description: string;
  suggestedPrice: number;
  keywords: string[];
  reasoning: string;
}

const PROGRAM_TYPES = [
  'shred/cut',
  'bulk/mass', 
  'strength',
  'powerlifting',
  'bodybuilding',
  'mobility/flexibility',
  'athletic performance',
  'nutrition/meal plan',
  'general fitness'
];

const DURATIONS = [4, 6, 8, 12, 16];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const AUDIENCES = ['men', 'women', 'everyone'];

const EXAMPLE_PROMPTS = [
  '12-week push pull legs',
  'beginner home workout',
  'competition prep'
];

export default function WriterPage() {
  const [description, setDescription] = useState('');
  const [programType, setProgramType] = useState(PROGRAM_TYPES[0]);
  const [duration, setDuration] = useState(DURATIONS[2]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  const [audience, setAudience] = useState(AUDIENCES[2]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  
  const router = useRouter();

  const handleExampleClick = (prompt: string) => {
    setDescription(`Complete ${prompt} program for ${difficulty} trainees. Includes progressive workout schedule and exercise variations.`);
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          type: programType,
          duration,
          difficulty,
          audience
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      setGeneratedContent(data);
      setEditedTitle(data.title);
      setEditedDescription(data.description);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseThis = () => {
    // Store the generated content in localStorage and navigate to create product page
    const productData = {
      title: editedTitle,
      description: editedDescription,
      price: generatedContent?.suggestedPrice || 0,
      type: 'digital'
    };
    
    localStorage.setItem('prefilledProduct', JSON.stringify(productData));
    router.push('/dashboard/products/new');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-200px)]">
      {/* Left Panel - Input */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#111] border border-white/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <PenTool className="h-5 w-5 mr-2 text-emerald-500" />
            product details
          </h2>

          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                what's your program about?
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-0 resize-none transition-colors"
                rows={4}
                placeholder="describe your fitness program in 2-3 sentences..."
              />
              
              {/* Example prompts */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleExampleClick(prompt)}
                      className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full text-gray-400 hover:text-gray-900 dark:text-white transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Program Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                program type
              </label>
              <select
                value={programType}
                onChange={(e) => setProgramType(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:ring-0"
              >
                {PROGRAM_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-[#0a0a0a]">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration & Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:ring-0"
                >
                  {DURATIONS.map((weeks) => (
                    <option key={weeks} value={weeks} className="bg-[#0a0a0a]">
                      {weeks} weeks
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:ring-0"
                >
                  {DIFFICULTIES.map((level) => (
                    <option key={level} value={level} className="bg-[#0a0a0a]">
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                target audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:ring-0"
              >
                {AUDIENCES.map((aud) => (
                  <option key={aud} value={aud} className="bg-[#0a0a0a]">
                    {aud}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!description.trim() || isGenerating}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  generate listing
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Output */}
      <div className="space-y-6">
        {!generatedContent && !isGenerating && (
          <div className="bg-white dark:bg-[#111] border border-white/5 rounded-lg p-8 text-center h-full flex items-center justify-center">
            <div className="text-gray-500">
              <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">ai-generated content will appear here</p>
              <p className="text-sm">fill out the form and click generate to get started</p>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="bg-white dark:bg-[#111] border border-white/5 rounded-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
              <div className="space-y-2 mt-6">
                <div className="h-3 bg-white/5 rounded"></div>
                <div className="h-3 bg-white/5 rounded"></div>
                <div className="h-3 bg-white/5 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        )}

        {generatedContent && (
          <div className="bg-white dark:bg-[#111] border border-white/5 rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center">
                <Wand2 className="h-5 w-5 mr-2 text-emerald-500" />
                generated content
              </h2>
              <button
                onClick={handleUseThis}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-2 px-4 rounded-lg transition-colors flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                use this
              </button>
            </div>

            {/* Editable Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                product title
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:ring-0"
              />
            </div>

            {/* Editable Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                description
              </label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:ring-0 resize-none"
                rows={8}
              />
            </div>

            {/* Suggested Price */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                suggested price
              </label>
              <div className="bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-400">
                    ${generatedContent.suggestedPrice}
                  </span>
                  <span className="text-xs text-gray-400">usd</span>
                </div>
                {generatedContent.reasoning && (
                  <p className="text-sm text-gray-400 mt-2">
                    {generatedContent.reasoning}
                  </p>
                )}
              </div>
            </div>

            {/* SEO Keywords */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                seo keywords
              </label>
              <div className="flex flex-wrap gap-2">
                {generatedContent.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PenTool({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}