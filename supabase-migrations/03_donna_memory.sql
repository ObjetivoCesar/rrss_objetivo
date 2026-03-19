-- Script para crear la memoria a largo plazo (Auto-Mejora y Persistencia) de Donna

-- Primero agregamos la tabla donde guardaremos notas/acuerdos que descubra durante las conversaciones

CREATE TABLE IF NOT EXISTS donna_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL, -- ej: "Estrategia", "Seo", "Canibalización", "Regla General"
    content TEXT NOT NULL, -- "César dice que nunca hagamos posts consecutivos sobre el mismo pilar..."
    is_active BOOLEAN DEFAULT true,
    added_by TEXT DEFAULT 'user', -- 'user' o 'donna'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar RLS (Row Level Security)
ALTER TABLE donna_memory ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (como lo hace el resto de las tablas para facilitar la extracción en Next.js por ahora)
CREATE POLICY "Enable read access for all users" 
ON donna_memory FOR SELECT 
USING (true);

-- Permitir update/insert desde backend (Service Role pass RLS by default, pero lo habilitamos porsiacaso también en local)
CREATE POLICY "Enable insert for all users" 
ON donna_memory FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON donna_memory FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Agregar un par de memorias semilla
INSERT INTO donna_memory (topic, content, added_by) VALUES
('Arquitectura de Contenido', 'Los objetivos (objectives) nunca deben ser borrados físicamente. Todo usa Soft Delete (archived_at).', 'system'),
('Estrategia de Nicho', 'Las Orquídeas es una marca formal, pero en RRSS buscamos comunicación más casual y de tú a tú.', 'user');
