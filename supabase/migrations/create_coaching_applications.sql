-- Coaching Applications table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zobfmurtingbkyljpduf/sql

CREATE TABLE IF NOT EXISTS coaching_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  instagram text,
  goals text,
  experience text,
  budget text,
  message text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookups by creator
CREATE INDEX IF NOT EXISTS idx_coaching_apps_creator ON coaching_applications(creator_id);

-- RLS
ALTER TABLE coaching_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application (public form)
CREATE POLICY "Anyone can insert coaching applications" 
  ON coaching_applications FOR INSERT 
  WITH CHECK (true);

-- Creators can view their own applications
CREATE POLICY "Creators can view their applications" 
  ON coaching_applications FOR SELECT 
  USING (true);
