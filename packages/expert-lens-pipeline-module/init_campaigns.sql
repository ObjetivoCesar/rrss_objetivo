-- Objetivos de posicionamiento
CREATE TABLE IF NOT EXISTS objectives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  color text DEFAULT '#6366f1',
  emoji text DEFAULT '🎯',
  created_at timestamptz DEFAULT now()
);

-- Asegurar RLS en objectives
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all" ON objectives;
CREATE POLICY "allow_all" ON objectives FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- Campañas vinculadas a un objetivo
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id uuid REFERENCES objectives(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active','paused','completed')),
  created_at timestamptz DEFAULT now()
);

-- Asegurar RLS en campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all" ON campaigns;
CREATE POLICY "allow_all" ON campaigns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- Vincular posts existentes a campañas
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL;
