-- ============================================================
-- MIGRACIÓN: Rediseño Columnar de quote_drafts
-- Fecha: 2026-04-13
-- Motor: Quoting Engine v2.0 — "Propuesta que Vale Oro"
-- Descripción: Cada campo del frontend tiene su propia columna.
--              Esto permite que Donna actualice campos individuales
--              y que el sistema haga analytics sin parsear JSON.
-- ============================================================

-- 1. Eliminar tabla legacy (si existe)
DROP TABLE IF EXISTS public.quote_drafts CASCADE;

-- 2. Crear tabla con arquitectura columnar completa
CREATE TABLE IF NOT EXISTS public.quote_drafts (

  -- == IDENTIFICADORES ==
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT UNIQUE NOT NULL,             -- URL del cliente (ej: cooperativa-podocarpus)
  objective_id            UUID,                             -- Marca destino (OBJETIVO siempre)
  current_step            TEXT DEFAULT 'slug',              -- Paso actual de la entrevista
  status                  TEXT DEFAULT 'draft',             -- draft | ready | published
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),

  -- == DATOS DEL CLIENTE (CRM Layer) ==
  client_name             TEXT NOT NULL,                    -- Nombre legal / razón social
  client_contact_name     TEXT,                             -- Nombre del contacto (Wilmer Jara)
  client_email            TEXT,                             -- Email para seguimiento
  client_phone            TEXT,                             -- Teléfono / WhatsApp
  client_sector           TEXT,                             -- Sector: Educación, Salud, Transporte...
  client_city             TEXT,                             -- Ciudad del cliente
  client_notes            TEXT,                             -- Notas internas (no aparece en la propuesta)
  url_live                TEXT,                             -- URL pública de la propuesta en vivo

  -- == PORTADA ==
  portada_etiqueta        TEXT,                             -- "Plataforma de Rentabilidad..."
  portada_titulo_bold     TEXT,                             -- Título principal (bold)
  portada_titulo_acento   TEXT,                             -- Título destacado (color acento)
  portada_subtitulo       TEXT,                             -- Subtítulo descriptivo
  portada_preparado_para  TEXT,                             -- "Wilmer Jara y el Consejo..."
  portada_fecha           TEXT,                             -- "Abril 2026"
  portada_url_banner      TEXT,                             -- URL de la imagen de fondo del banner
  portada_url_coordinador TEXT,                             -- URL foto del asesor (César)

  -- == CUERPO DE INTRODUCCIÓN ==
  intro_titulo            TEXT,                             -- Título interior
  intro_parrafos          TEXT[],                           -- Array de párrafos del cuerpo

  -- == ETAPAS / SERVICIOS (columnar híbrido) ==
  -- Usamos JSONB solo aquí porque el número de etapas es variable.
  -- Cada etapa tiene: titulo, eslogan, descripcion_operativa, nota_especial,
  -- costo_generico, subtitulo_corto, tiempo_estimado, numero_seo,
  -- entregables_clave[], detalles_legales[]
  etapas                  JSONB NOT NULL DEFAULT '[]'::jsonb,
  precio_total            NUMERIC(10,2),                    -- Suma calculada (para analytics)

  -- == CIERRE Y TÉRMINOS ==
  cierre_llamada_accion   TEXT,                             -- "Construyamos el futuro, ¿qué hay hoy?"
  cierre_titulo_propuesta TEXT,                             -- "El siguiente paso"
  cierre_cta_texto        TEXT,                             -- Texto del botón CTA
  cierre_cta_url          TEXT,                             -- Link de agendamiento (Calendly, etc.)
  cierre_vigencia         TEXT,                             -- "15 días laborables"
  cierre_forma_pago       TEXT,                             -- "50% anticipo, 50% contra entrega"
  cierre_tiempo_ejecucion TEXT,                             -- "18 días laborables"
  cierre_pie_texto        TEXT,                             -- Texto final de pie de propuesta

  -- == METADATA DONNA (Motor de Entrevista) ==
  interview_context       JSONB DEFAULT '{}'::jsonb         -- Contexto de la entrevista (ego points, objeciones detectadas, etc.)
);

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_quote_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quote_drafts_updated_at ON public.quote_drafts;

CREATE TRIGGER trigger_quote_drafts_updated_at
BEFORE UPDATE ON public.quote_drafts
FOR EACH ROW EXECUTE FUNCTION update_quote_drafts_updated_at();

-- 4. Índices para queries de CRM
CREATE INDEX IF NOT EXISTS idx_quote_drafts_status ON public.quote_drafts(status);
CREATE INDEX IF NOT EXISTS idx_quote_drafts_sector ON public.quote_drafts(client_sector);
CREATE INDEX IF NOT EXISTS idx_quote_drafts_precio ON public.quote_drafts(precio_total);
CREATE INDEX IF NOT EXISTS idx_quote_drafts_created ON public.quote_drafts(created_at);

-- 5. RLS
ALTER TABLE public.quote_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total servicio"
ON public.quote_drafts FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Lectura y escritura autenticada"
ON public.quote_drafts FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- ============================================================
-- COMENTARIOS / GUÍA DE USO
-- ============================================================
-- Views útiles después de esta migración:
--
-- Analytics rápido de pipeline:
-- SELECT client_name, client_sector, precio_total, status 
-- FROM quote_drafts ORDER BY created_at DESC;
--
-- Cuánto dinero hay en pipeline:
-- SELECT SUM(precio_total) FROM quote_drafts WHERE status != 'published';
--
-- Propuestas publicadas por sector:
-- SELECT client_sector, COUNT(*) FROM quote_drafts 
-- WHERE status = 'published' GROUP BY client_sector;
-- ============================================================
