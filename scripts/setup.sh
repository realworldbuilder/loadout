#!/bin/bash

# GymSignal Creator Platform Setup Script

echo "🏋️ Setting up GymSignal Creator Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ $NODE_VERSION -lt 18 ]; then
    echo "❌ Node.js 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating environment file..."
    cp .env.local.example .env.local
    echo "⚠️  Please edit .env.local with your Stripe and Supabase credentials"
fi

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI detected"
    echo "💾 You can run 'supabase db push' to set up your database"
else
    echo "ℹ️  Install Supabase CLI with: npm install -g supabase"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Run the database migration in Supabase"
echo "3. Start the dev server with: npm run dev"
echo ""
echo "🔗 Visit: http://localhost:3000"
echo ""
echo "📚 Read the README.md for detailed setup instructions"