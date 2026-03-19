-- ==============================================================================
-- MIGRACIÓN DE ECOSISTEMA DE CONTENIDO (Content Strategy & SEO Cannibalization)
-- ==============================================================================

-- 1. PILARES DE CONTENIDO (Objetivos Estratégicos)
CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  emoji TEXT DEFAULT '🎯',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CAMPAÑAS (Iniciativas o Topic Clusters)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ARTÍCULOS DE BLOG (Contenido Ancla SEO)
-- Para medir canibalización y trazar el origen de los posts
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url_slug TEXT NOT NULL UNIQUE,
  target_keyword TEXT,
  published TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ACTUALIZAR TABLA DE SOCIAL POSTS
-- Añadimos las llaves foráneas para darles trazabilidad estratégica
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS source_article_id UUID REFERENCES blog_articles(id) ON DELETE SET NULL;

-- 5. RLS (Row Level Security) - Deshabilitado por ahora para uso interno o configurar según necesidad
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para admin interno (Asumiendo que toda lectura/escritura es autenticada o servicio)
CREATE POLICY "Allow all operations for objectives" ON objectives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for campaigns" ON campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for blog_articles" ON blog_articles FOR ALL USING (true) WITH CHECK (true);
