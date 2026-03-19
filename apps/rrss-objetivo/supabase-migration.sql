-- 1. Crear la tabla de logs del sistema
CREATE TABLE public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    service TEXT NOT NULL,      -- Ej: 'scheduler', 'ai_generator', 'api'
    severity TEXT NOT NULL,     -- 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb -- Para guardar error traces o datos extra
);

-- Habilitar RLS pero permitir todo al Service Role (que es el que usamos en backend)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- 2. Agregar columna archived_at para Soft Delete en las tablas principales
ALTER TABLE public.objectives 
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public.campaigns 
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public.social_posts 
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. (OPCIONAL PERO RECOMENDADO) Índice para búsquedas rápidas excluyendo archivados
CREATE INDEX idx_objectives_not_archived ON public.objectives(created_at) WHERE archived_at IS NULL;
CREATE INDEX idx_campaigns_not_archived ON public.campaigns(created_at) WHERE archived_at IS NULL;
CREATE INDEX idx_social_posts_not_archived ON public.social_posts(created_at) WHERE archived_at IS NULL;
