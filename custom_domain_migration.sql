-- Custom Domain Migration
-- Run this SQL in the Supabase SQL Editor

-- Add custom domain columns to creators table
ALTER TABLE creators 
ADD COLUMN IF NOT EXISTS custom_domain text,
ADD COLUMN IF NOT EXISTS domain_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';

-- Migrate existing tier data to subscription_tier if it exists
UPDATE creators 
SET subscription_tier = tier 
WHERE subscription_tier = 'free' AND tier IS NOT NULL;

-- Create index for custom domain lookups
CREATE INDEX IF NOT EXISTS idx_creators_custom_domain ON creators(custom_domain) 
WHERE custom_domain IS NOT NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'creators' 
  AND column_name IN ('custom_domain', 'domain_verified', 'subscription_tier');