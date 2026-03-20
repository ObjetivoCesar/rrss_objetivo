-- Migración: Memoria Relacional para Donna AI
-- Añade columnas para vincular notas estratégicas con Objetivos y Campañas

ALTER TABLE donna_memory 
ADD COLUMN IF NOT EXISTS objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;

-- Comentario para documentación
COMMENT ON COLUMN donna_memory.objective_id IS 'ID del objetivo estratégico relacionado con esta nota';
COMMENT ON COLUMN donna_memory.campaign_id IS 'ID de la campaña relacionada con esta nota';
