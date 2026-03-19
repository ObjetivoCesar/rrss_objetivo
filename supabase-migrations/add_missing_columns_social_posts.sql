-- ============================================================
-- FIX: Agregar columnas faltantes a social_posts
-- Error: "Could not find the 'target_month' column of 'social_posts'"
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- Columnas que el código usa pero que no existen en la tabla:
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS target_month TEXT;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id);
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS objective_id UUID REFERENCES objectives(id);
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS error_log TEXT;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Verificación: muestra las columnas de la tabla
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'social_posts' ORDER BY ordinal_position;
