# Loadout Platform

The all-in-one storefront platform for fitness creators, coaches, and gymfluencers. Built with Next.js, Supabase, and Stripe.

## 🏋️ Features

- **Link-in-Bio Pages**: Beautiful, mobile-optimized profiles at `loadout.app/@handle`
- **Digital Product Sales**: Sell workout plans, coaching templates, meal prep guides
- **Secure Payments**: Stripe Connect integration with instant payouts to creators
- **Analytics Dashboard**: Track sales, views, and conversion rates
- **Custom Branding**: Personalized themes and colors (Pro tier)
- **File Storage**: Supabase storage for product files and images
- **Mobile-First**: Optimized for Instagram and TikTok traffic

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe Connect Express
- **Deployment**: Vercel
- **Analytics**: Custom Supabase events

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account
- Stripe account

### 1. Clone and Install

```bash
git clone <repository-url>
cd loadout-creator
npm install
```

### 2. Environment Setup

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
- Supabase URL and anon key (already configured)
- Stripe publishable and secret keys
- Webhook secret for Stripe

### 3. Database Setup

Run the migration to set up your database schema:

```sql
-- Connect to your Supabase dashboard and run:
-- supabase/migrations/001_creator_platform.sql
```

Or use the Supabase CLI:
```bash
supabase db push
```

### 4. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── [handle]/          # Creator profile pages
│   ├── dashboard/         # Creator dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ProductCard.tsx    # Product display component
│   ├── ProfileCard.tsx    # Creator profile component
│   └── CreatorNav.tsx     # Dashboard navigation
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client & types
│   ├── stripe.ts          # Stripe configuration
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
```

## 💾 Database Schema

### Core Tables

- **`creators`**: Creator profiles, handles, social links, Stripe accounts
- **`products`**: Digital products, pricing, files, metadata  
- **`orders`**: Purchase records, payment tracking
- **`page_views`**: Analytics for profile visits
- **`link_clicks`**: Analytics for product interactions

### Row Level Security (RLS)

All tables use RLS policies to ensure:
- Creators can only access their own data
- Public can view active creators and products
- Analytics data is creator-scoped

## 💰 Revenue Model

### Pricing Tiers

- **Free**: 3 products, basic analytics, GymSignal branding
- **Pro ($9.99/mo)**: Unlimited products, custom themes, advanced analytics
- **Studio ($29.99/mo)**: White-label, team accounts, priority support

### Platform Fees

- **5%** platform fee on all transactions
- **2.9% + $0.30** Stripe processing fees
- **Total**: ~8% cost to creators (competitive with industry)

## 🔧 Configuration

### Stripe Connect Setup

1. Enable Connect in your Stripe dashboard
2. Configure webhook endpoints:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
3. Set application fee percentage (5%)

### Supabase Configuration

1. Enable Row Level Security on all tables
2. Configure storage buckets for product files
3. Set up email templates for auth

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Domain Setup

- Main app: `loadout.app/create` (dashboard)
- Creator profiles: `loadout.app/@handle`
- Landing: `loadout.app`

## 📊 Analytics & Monitoring

Track key metrics:
- Creator signups and retention
- Transaction volume (GMV)
- Conversion rates (views → purchases)
- Average order value
- Creator earnings

## 🛡️ Security

- Row Level Security (RLS) on all database tables
- Stripe Connect for secure payment handling
- Input validation and sanitization
- Rate limiting on API endpoints
- HTTPS everywhere

## 🔄 API Endpoints

### Public Endpoints
- `GET /api/creators/[handle]` - Get creator profile
- `POST /api/checkout` - Create Stripe checkout session

### Protected Endpoints  
- `GET /api/dashboard/stats` - Creator analytics
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product

## 🎨 Theming

Creators can customize their storefront colors:

```typescript
interface Theme {
  primary: string;     // Main brand color
  background: string;  // Page background
  surface: string;     // Card backgrounds  
  accent: string;      // Accent elements
  text: string;        // Text color
}
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email [support@loadout.app](mailto:support@loadout.app) or join our [Discord community](https://discord.gg/loadout).

---

**Built with 💪 by the GymSignal team**

Turn your fitness influence into sustainable income with Loadout.