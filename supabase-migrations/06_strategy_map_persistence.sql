-- =====================================================================
-- Migración 06: Persistencia del Cerebro Estratégico (Strategy Map)
-- =====================================================================
-- PROBLEMA: El Mapa de Estrategia solo vive en memoria del browser.
-- Al recargar la página, todo lo que el usuario creó manualmente
-- (ideas, bloques de contenido) desaparece.
--
-- SOLUCIÓN: Dos tablas que persisten el estado visual y semántico del mapa.
--
-- Tabla 1: `map_ideas`
--   Guarda cada nodo personalizado creado por César: ideas, bloques de estructura, etc.
--   Es el "cuaderno de bocetos" de la estrategia.
--
-- Tabla 2: `map_node_positions`
--   Guarda la posición XY de TODOS los nodos (incluidos los generados
--   automáticamente de Supabase) para que el layout personalizado se recuerde.
-- =====================================================================

-- ── Tabla 1: Ideas y bloques del mapa ────────────────────────────────
CREATE TABLE IF NOT EXISTS map_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo de nodo
    node_type TEXT NOT NULL DEFAULT 'idea',
    -- 'idea'         → 💡 Idea estratégica libre
    -- 'h1'           → Título principal de artículo
    -- 'h2'           → Subtítulo de artículo
    -- 'paragraph'    → Bloque de texto
    -- 'cta'          → Llamado a la acción

    -- Contenido del nodo
    label TEXT NOT NULL DEFAULT 'Nueva Idea',
    description TEXT,                        -- Cuerpo/notas adicionales

    -- Vínculos al ecosistema estratégico (opcionales)
    parent_id TEXT,                          -- ID del nodo padre en el mapa (puede ser obj-, camp-, art-)
    objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL,
    campaign_id  UUID REFERENCES campaigns(id)  ON DELETE SET NULL,

    -- Posición manual en el canvas (si el usuario la mueve)
    pos_x FLOAT DEFAULT 0,
    pos_y FLOAT DEFAULT 0,

    -- Control
    archived_at TIMESTAMP WITH TIME ZONE,    -- Soft delete
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_map_ideas_objective ON map_ideas(objective_id);
CREATE INDEX IF NOT EXISTS idx_map_ideas_campaign  ON map_ideas(campaign_id);
CREATE INDEX IF NOT EXISTS idx_map_ideas_type      ON map_ideas(node_type);

-- ── Tabla 2: Posiciones persistentes de nodos del mapa ───────────────
-- Guarda la posición XY para cualquier nodo, usando su ID string como PK.
-- Separa la lógica visual de la lógica de datos.
CREATE TABLE IF NOT EXISTS map_node_positions (
    node_id     TEXT PRIMARY KEY,            -- Ej: 'obj-uuid', 'camp-uuid', 'art-123', 'idea-uuid'
    pos_x       FLOAT NOT NULL DEFAULT 0,
    pos_y       FLOAT NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── RLS (permisivo para MVP) ──────────────────────────────────────────
ALTER TABLE map_ideas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_node_positions  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on map_ideas"
    ON map_ideas FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on map_node_positions"
    ON map_node_positions FOR ALL USING (true) WITH CHECK (true);

-- ── Comentarios de documentación ─────────────────────────────────────
COMMENT ON TABLE map_ideas IS
    'Nodos personalizados del Cerebro Estratégico: ideas libres y bloques de estructura de contenido (H1, H2, párrafo, CTA). César los crea arrastrando desde la paleta o con el botón Añadir Idea.';

COMMENT ON TABLE map_node_positions IS
    'Posiciones XY persistentes de todos los nodos del mapa (estratégicos y personalizados). Permite que el lay-out manual de César se conserve entre sesiones.';
