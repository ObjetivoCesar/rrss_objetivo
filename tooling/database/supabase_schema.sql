-- Tabla Maestra de Posts (Esquema v2 — Multi-Plataforma)
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Contenido
  content_text TEXT NOT NULL,
  media_url TEXT, -- URL pública del bucket de Supabase o externa
  media_urls TEXT[] DEFAULT '{}', -- Array de URLs para carruseles
  platforms TEXT[] DEFAULT '{}', -- Array ['facebook', 'instagram', 'tiktok', 'youtube', 'linkedin']
  
  -- Metadata por plataforma (campos específicos para YT, TikTok, LinkedIn)
  metadata JSONB DEFAULT '{}',
  -- Ejemplo de estructura metadata:
  -- {
  --   "youtube_title": "Mi video genial",
  --   "youtube_description": "Descripción detallada",
  --   "linkedin_title": "Titular artículo",
  --   "tiktok_privacy": "public_to_everyone",
  --   "tiktok_disable_comment": false,
  --   "tiktok_disable_duet": false
  -- }
  
  -- Programación
  scheduled_for TIMESTAMPTZ NOT NULL, -- Siempre en UTC (Ecuador es UTC-5)
  
  -- Estado (incluye 'draft_ai' para propuestas del Autopublicador)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed', 'draft_ai')),
  error_log TEXT,
  make_operation_id TEXT -- Para rastrear el histórico en Make
);

-- ===================================================
-- MIGRACIÓN: Si la tabla ya existe, ejecuta esto:
-- ===================================================
-- ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
-- ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS social_posts_status_check;
-- ALTER TABLE social_posts ADD CONSTRAINT social_posts_status_check
--   CHECK (status IN ('pending', 'processing', 'published', 'failed', 'draft_ai'));

-- Habilitar RLS (Row Level Security)
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Índice para el motor de agendamiento (Cron)
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_status ON social_posts (scheduled_for, status);

-- Índice para búsqueda de borradores IA
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts (status);

-- Función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_posts_updated_at
BEFORE UPDATE ON social_posts
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
