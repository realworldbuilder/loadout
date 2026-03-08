-- Standalone picks (product recommendations), optionally linked to a code
CREATE TABLE IF NOT EXISTS creator_picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
  code_id UUID REFERENCES creator_codes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  product_url TEXT NOT NULL,
  collection TEXT,
  sort_order INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creator_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creators can manage own picks" ON creator_picks
  FOR ALL USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

CREATE POLICY "public can read picks" ON creator_picks
  FOR SELECT USING (true);

CREATE INDEX idx_picks_creator ON creator_picks(creator_id);
CREATE INDEX idx_picks_code ON creator_picks(code_id);
