-- ============================================================
-- MIGRACIÓN: Compositor Unificado — Columnas Nuevas
-- Revisar antes de ejecutar: todas usan IF NOT EXISTS (seguras de re-ejecutar)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Fecha: 2026-04-26
-- ============================================================

-- 1. Tipo de contenido — para enrutar el webhook correcto en Make.com
--    Valores válidos: 'image' | 'carousel' | 'video' | 'link' | 'text' | 'youtube'
ALTER TABLE social_posts 
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'image';

-- 2. URL del video — Bunny.net short/reel o URL de YouTube
ALTER TABLE social_posts 
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3. URL del link externo — artículo, blog, web
ALTER TABLE social_posts 
  ADD COLUMN IF NOT EXISTS link_url TEXT;

-- 4. Datos Open Graph cacheados — preview del link
--    Estructura: { "title": "...", "description": "...", "image": "...", "domain": "..." }
ALTER TABLE social_posts 
  ADD COLUMN IF NOT EXISTS link_preview JSONB;

-- 5. Flag Evergreen — posts que Donna puede sugerir reutilizar
ALTER TABLE social_posts 
  ADD COLUMN IF NOT EXISTS is_evergreen BOOLEAN DEFAULT false;

-- ============================================================
-- VERIFICACIÓN: Ejecutar esto al final para confirmar el resultado
-- ============================================================
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'social_posts' 
ORDER BY ordinal_position;
