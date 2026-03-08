CREATE TABLE IF NOT EXISTS creator_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  code_text TEXT NOT NULL,
  discount_description TEXT,
  store_url TEXT,
  category TEXT DEFAULT 'other',
  is_featured BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creator_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creators can manage own codes" ON creator_codes
  FOR ALL USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

CREATE POLICY "public can read codes" ON creator_codes
  FOR SELECT USING (true);

CREATE INDEX idx_creator_codes_creator ON creator_codes(creator_id);