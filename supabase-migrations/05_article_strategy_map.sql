-- =====================================================================
-- Migración 05: Puente Estratégico — Artículos (MySQL) ↔ Objetivos (Supabase)
-- =====================================================================
-- PROBLEMA: Los artículos publicados viven en MySQL y los objetivos/campañas
-- viven en Supabase. No hay relación entre ellos. Donna no puede saber
-- qué artículos apoyan qué pilar estratégico.
--
-- SOLUCIÓN: Tabla puente en Supabase que mapea IDs de MySQL a UUIDs de Supabase.
-- Soporta MANY-TO-MANY: un artículo puede servir a múltiples objetivos.
-- =====================================================================

CREATE TABLE IF NOT EXISTS article_strategy_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Referencia al artículo en MySQL (no es FK real, es cross-database)
    mysql_article_id INT NOT NULL,
    article_title TEXT NOT NULL,          -- Cache del título para queries rápidas sin ir a MySQL
    article_slug TEXT,                    -- Cache del slug para construir URLs

    -- Referencia al ecosistema estratégico en Supabase
    objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

    -- Metadata estratégica
    role TEXT DEFAULT 'support',          -- 'pillar' | 'support' | 'backlink_target' | 'lead_magnet'
    strategic_notes TEXT,                 -- Por qué este artículo sirve a este objetivo
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Un artículo no puede estar mapeado dos veces al mismo objetivo+campaña
    UNIQUE(mysql_article_id, objective_id, campaign_id)
);

-- Índices para queries frecuentes de Donna
CREATE INDEX IF NOT EXISTS idx_asm_objective ON article_strategy_map(objective_id);
CREATE INDEX IF NOT EXISTS idx_asm_campaign ON article_strategy_map(campaign_id);
CREATE INDEX IF NOT EXISTS idx_asm_mysql_id ON article_strategy_map(mysql_article_id);

-- RLS (mismo patrón permisivo que el resto de tablas para MVP)
ALTER TABLE article_strategy_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" 
ON article_strategy_map FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" 
ON article_strategy_map FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON article_strategy_map FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" 
ON article_strategy_map FOR DELETE USING (true);

-- Comentarios para documentación
COMMENT ON TABLE article_strategy_map IS 'Puente cross-database: vincula artículos de MySQL con el ecosistema estratégico de Supabase';
COMMENT ON COLUMN article_strategy_map.role IS 'Rol del artículo: pillar (contenido pilar), support (refuerzo), backlink_target (para enlace interno), lead_magnet (captura)';
