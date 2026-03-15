import ChatWidget from '@/components/ChatWidget';

// Simple test creator page to demo the chat widget
export default function TestCreatorPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Creator Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
            TC
          </div>
          <h1 className="text-3xl font-bold mb-2">Test Creator</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            I am a fitness expert helping people achieve their goals with proven training programs and nutritional guidance.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Complete Fitness Program */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="aspect-video bg-zinc-700 rounded mb-4 flex items-center justify-center text-zinc-400">
              🏋️‍♂️
            </div>
            <h3 className="font-semibold text-lg mb-2">Complete Fitness Program</h3>
            <p className="text-zinc-400 text-sm mb-4">
              A comprehensive 12-week workout program designed for all fitness levels.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold">$49.99</span>
              <button className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded text-sm font-medium transition-colors">
                Get Started
              </button>
            </div>
          </div>

          {/* Nutrition Masterclass */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="aspect-video bg-zinc-700 rounded mb-4 flex items-center justify-center text-zinc-400">
              🥗
            </div>
            <h3 className="font-semibold text-lg mb-2">Nutrition Masterclass</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Learn the fundamentals of nutrition for fitness and sustainable eating habits.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold">$29.99</span>
              <button className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded text-sm font-medium transition-colors">
                Learn More
              </button>
            </div>
          </div>

          {/* 1:1 Coaching */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="aspect-video bg-zinc-700 rounded mb-4 flex items-center justify-center text-zinc-400">
              👥
            </div>
            <h3 className="font-semibold text-lg mb-2">1:1 Coaching Session</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Personalized one-on-one coaching session tailored to your specific goals.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold">$99.99</span>
              <button className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded text-sm font-medium transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-2 text-emerald-400">Test the Chat Widget!</h2>
            <p className="text-zinc-300">
              Click the chat bubble in the bottom-right corner to test the AI assistant. 
              It can help recommend products, answer questions about training, and provide guidance 
              based on the products above.
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              Note: This is a demo page for testing the chat widget functionality.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget 
        creatorHandle="testcreator"
        creatorName="Test Creator"
      />
    </div>
  );
}