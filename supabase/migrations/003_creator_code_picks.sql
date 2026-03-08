CREATE TABLE IF NOT EXISTS creator_code_picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID REFERENCES creator_codes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  product_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creator_code_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creators can manage own picks" ON creator_code_picks
  FOR ALL USING (code_id IN (
    SELECT cc.id FROM creator_codes cc 
    JOIN creators c ON cc.creator_id = c.id 
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "public can read picks" ON creator_code_picks
  FOR SELECT USING (true);

CREATE INDEX idx_code_picks_code ON creator_code_picks(code_id);
