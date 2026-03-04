-- GymSignal Creator Platform Database Schema
-- Migration 001: Core creator platform tables and policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creators table: Main creator/influencer profiles
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    handle VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    theme JSONB DEFAULT '{"primary": "#10a37f", "background": "#0d0d0d", "accent": "#34d399"}',
    social_links JSONB DEFAULT '{}', -- {instagram: "", tiktok: "", youtube: "", twitter: ""}
    stripe_account_id VARCHAR(255),
    stripe_onboarding_complete BOOLEAN DEFAULT false,
    tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'studio')),
    subscription_ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table: Digital products, coaching services, external links
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL DEFAULT 0, -- 0 for free products
    type VARCHAR(20) NOT NULL CHECK (type IN ('digital', 'coaching', 'link', 'subscription')),
    file_url TEXT, -- Supabase storage URL for digital products
    thumbnail_url TEXT, -- Product preview image
    download_limit INTEGER, -- null = unlimited downloads
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}', -- Flexible storage for product-specific data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table: Purchase records and transaction history
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER NOT NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_transfer_id VARCHAR(255), -- Transfer to creator account
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    download_count INTEGER DEFAULT 0, -- Track digital product downloads
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page views analytics table
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
    referrer TEXT, -- Where the visitor came from
    user_agent TEXT, -- Browser/device information
    country VARCHAR(2), -- ISO country code (can be populated via geolocation)
    ip_address INET, -- Store for fraud detection (but respect privacy)
    session_id UUID, -- Group views by session
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Link/product click analytics table  
CREATE TABLE IF NOT EXISTS link_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    country VARCHAR(2),
    ip_address INET,
    session_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Email subscribers table (for email collection)
CREATE TABLE IF NOT EXISTS email_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) NOT NULL,
    source VARCHAR(50), -- 'product_purchase', 'newsletter_signup', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(creator_id, email)
);

-- Creator themes table (for custom branding)
CREATE TABLE IF NOT EXISTS creator_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    config JSONB NOT NULL, -- Full theme configuration
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(creator_id, name)
);

-- Create indexes for performance
-- Creators indexes
CREATE INDEX IF NOT EXISTS creators_handle_idx ON creators(handle);
CREATE INDEX IF NOT EXISTS creators_user_id_idx ON creators(user_id);
CREATE INDEX IF NOT EXISTS creators_tier_active_idx ON creators(tier, is_active);
CREATE INDEX IF NOT EXISTS creators_stripe_account_idx ON creators(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

-- Products indexes
CREATE INDEX IF NOT EXISTS products_creator_id_idx ON products(creator_id);
CREATE INDEX IF NOT EXISTS products_active_sort_idx ON products(creator_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS products_type_idx ON products(type);
CREATE INDEX IF NOT EXISTS products_price_idx ON products(price_cents);

-- Orders indexes
CREATE INDEX IF NOT EXISTS orders_creator_id_idx ON orders(creator_id);
CREATE INDEX IF NOT EXISTS orders_product_id_idx ON orders(product_id);
CREATE INDEX IF NOT EXISTS orders_buyer_email_idx ON orders(buyer_email);
CREATE INDEX IF NOT EXISTS orders_stripe_payment_intent_idx ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS orders_status_created_idx ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS orders_creator_status_date_idx ON orders(creator_id, status, created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS page_views_creator_timestamp_idx ON page_views(creator_id, timestamp);
CREATE INDEX IF NOT EXISTS page_views_timestamp_idx ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS page_views_referrer_idx ON page_views(referrer) WHERE referrer IS NOT NULL;

CREATE INDEX IF NOT EXISTS link_clicks_product_timestamp_idx ON link_clicks(product_id, timestamp);
CREATE INDEX IF NOT EXISTS link_clicks_creator_timestamp_idx ON link_clicks(creator_id, timestamp);
CREATE INDEX IF NOT EXISTS link_clicks_timestamp_idx ON link_clicks(timestamp);

-- Email subscribers indexes
CREATE INDEX IF NOT EXISTS email_subscribers_creator_active_idx ON email_subscribers(creator_id, is_active);
CREATE INDEX IF NOT EXISTS email_subscribers_email_idx ON email_subscribers(email);

-- Enable Row Level Security (RLS)
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creators table
-- Creators can view and update their own data
CREATE POLICY "Creators can view own profile" ON creators
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Creators can update own profile" ON creators
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Creators can insert own profile" ON creators
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Public can view active creator profiles
CREATE POLICY "Public can view active creators" ON creators
    FOR SELECT USING (is_active = true);

-- RLS Policies for products table
-- Creators can manage their own products
CREATE POLICY "Creators can manage own products" ON products
    FOR ALL USING (
        creator_id IN (
            SELECT id FROM creators WHERE user_id = auth.uid()
        )
    );

-- Public can view active products from active creators
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (
        is_active = true 
        AND creator_id IN (
            SELECT id FROM creators WHERE is_active = true
        )
    );

-- RLS Policies for orders table
-- Creators can view their own orders
CREATE POLICY "Creators can view own orders" ON orders
    FOR SELECT USING (
        creator_id IN (
            SELECT id FROM creators WHERE user_id = auth.uid()
        )
    );

-- System can insert orders (for webhook processing)
CREATE POLICY "System can insert orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Creators can update their own orders (for download tracking)
CREATE POLICY "Creators can update own orders" ON orders
    FOR UPDATE USING (
        creator_id IN (
            SELECT id FROM creators WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for analytics tables
-- Creators can view their own analytics
CREATE POLICY "Creators can view own page views" ON page_views
    FOR SELECT USING (
        creator_id IN (
            SELECT id FROM creators WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert page views" ON page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can view own link clicks" ON link_clicks
    FOR SELECT USING (
        creator_id IN (
            SELECT id FROM creators WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert link clicks" ON link_clicks
    FOR INSERT WITH CHECK (true);

-- RLS Policies for email subscribers
CREATE POLICY "Creators can manage own subscribers" ON email_subscribers
    FOR ALL USING (
        creator_id IN (
            SELECT id FROM creators WHERE user_id = auth.uid()
        )
    );

-- Public can subscribe (insert only)
CREATE POLICY "Public can subscribe" ON email_subscribers
    FOR INSERT WITH CHECK (true);

-- RLS Policies for creator themes
CREATE POLICY "Creators can manage own themes" ON creator_themes
    FOR ALL USING (
        creator_id IN (
            SELECT id FROM creators WHERE user_id = auth.uid()
        )
    );

-- Create functions for common operations

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate creator handle
CREATE OR REPLACE FUNCTION validate_creator_handle()
RETURNS TRIGGER AS $$
BEGIN
    -- Check handle format (alphanumeric, underscore, hyphen only)
    IF NOT NEW.handle ~ '^[a-zA-Z0-9_-]+$' THEN
        RAISE EXCEPTION 'Handle can only contain letters, numbers, underscores, and hyphens';
    END IF;
    
    -- Check length
    IF LENGTH(NEW.handle) < 3 OR LENGTH(NEW.handle) > 30 THEN
        RAISE EXCEPTION 'Handle must be between 3 and 30 characters';
    END IF;
    
    -- Check for reserved handles
    IF LOWER(NEW.handle) IN ('admin', 'api', 'www', 'app', 'dashboard', 'create', 'signup', 'login', 'about', 'help', 'support', 'terms', 'privacy', 'blog', 'gymsignal') THEN
        RAISE EXCEPTION 'This handle is reserved and cannot be used';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add handle validation trigger
CREATE TRIGGER validate_creator_handle_trigger
    BEFORE INSERT OR UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION validate_creator_handle();

-- Function to calculate creator analytics
CREATE OR REPLACE FUNCTION get_creator_analytics(creator_uuid UUID, days INTEGER DEFAULT 30)
RETURNS TABLE(
    total_views BIGINT,
    total_clicks BIGINT,
    total_orders BIGINT,
    total_revenue_cents BIGINT,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(views.count, 0) as total_views,
        COALESCE(clicks.count, 0) as total_clicks,
        COALESCE(orders.count, 0) as total_orders,
        COALESCE(orders.revenue, 0) as total_revenue_cents,
        CASE 
            WHEN COALESCE(views.count, 0) > 0 
            THEN ROUND((COALESCE(orders.count, 0)::NUMERIC / views.count::NUMERIC) * 100, 2)
            ELSE 0 
        END as conversion_rate
    FROM 
        (SELECT COUNT(*) as count 
         FROM page_views 
         WHERE creator_id = creator_uuid 
         AND timestamp >= NOW() - INTERVAL '1 day' * days) views
    CROSS JOIN
        (SELECT COUNT(*) as count 
         FROM link_clicks 
         WHERE creator_id = creator_uuid 
         AND timestamp >= NOW() - INTERVAL '1 day' * days) clicks
    CROSS JOIN
        (SELECT COUNT(*) as count, COALESCE(SUM(amount_cents - platform_fee_cents), 0) as revenue
         FROM orders 
         WHERE creator_id = creator_uuid 
         AND status = 'completed'
         AND created_at >= NOW() - INTERVAL '1 day' * days) orders;
END;
$$ language 'plpgsql';

-- Create some initial data/seed if needed
-- Insert default theme configurations
INSERT INTO creator_themes (id, creator_id, name, config, is_active) 
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'Default Dark', 
     '{"primary": "#10a37f", "background": "#0d0d0d", "surface": "#1a1a1a", "accent": "#34d399", "text": "#ffffff"}', true),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'Fitness Orange',
     '{"primary": "#f97316", "background": "#0c0a09", "surface": "#1c1917", "accent": "#fb923c", "text": "#ffffff"}', false),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'Ocean Blue',
     '{"primary": "#0ea5e9", "background": "#0f172a", "surface": "#1e293b", "accent": "#38bdf8", "text": "#ffffff"}', false)
ON CONFLICT (id) DO NOTHING;

-- Comment for migration tracking
COMMENT ON SCHEMA public IS 'GymSignal Creator Platform - Migration 001: Core schema with creators, products, orders, and analytics';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;