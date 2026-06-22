-- =========================================================
-- Migración 08: Cuentas Sociales por Marca (Motor Meta API)
-- Ejecutar en: Supabase SQL Editor
-- Propósito: Almacena credenciales de Meta (FB + IG) por marca
--            para publicación directa sin Make.com.
-- =========================================================

CREATE TABLE IF NOT EXISTS brand_social_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name      TEXT NOT NULL,                    -- 'cesar-reyes' | 'objetivo' | 'activaqr'
  platform        TEXT NOT NULL,                    -- 'facebook' | 'instagram' | 'linkedin'

  -- Identificadores de la cuenta en Meta
  page_id         TEXT,                             -- Facebook Page ID (ej: '123456789012345')
  ig_user_id      TEXT,                             -- Instagram Business Account ID
  linkedin_org_id TEXT,                             -- LinkedIn Organization ID (opcional)

  -- Tokens de acceso (guardados en texto plano — proteger vía RLS + env)
  -- En producción real se recomienda encriptar con pgcrypto.
  access_token     TEXT,                             -- Page Access Token (larga duración, ~60 días)
  token_expires_at TIMESTAMPTZ,                      -- Cuándo vence el token

  -- Metadata
  account_name    TEXT,                             -- Nombre legible (ej: 'Agencia OBJETIVO')
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Restricción: una combinación brand+platform es única
  UNIQUE (brand_name, platform)
);

-- Comentario explicativo en la tabla
COMMENT ON TABLE brand_social_accounts IS 
  'Credenciales de Meta Graph API por marca. Una fila por marca x plataforma.';

-- RLS: solo el rol service_role puede leer tokens (nunca el cliente público)
ALTER TABLE brand_social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo service_role puede leer cuentas sociales"
  ON brand_social_accounts
  FOR ALL
  USING (auth.role() = 'service_role');

-- Índice para búsquedas frecuentes por marca
CREATE INDEX IF NOT EXISTS idx_social_accounts_brand 
  ON brand_social_accounts (brand_name, platform);

-- =========================================================
-- Datos iniciales de referencia (completar con tokens reales)
-- Descomenta y completa con tus IDs reales antes de insertar.
-- =========================================================

/*
INSERT INTO brand_social_accounts (brand_name, platform, page_id, ig_user_id, account_name)
VALUES
  ('objetivo',     'facebook',  'TU_PAGE_ID_OBJETIVO',    NULL,                     'Agencia OBJETIVO'),
  ('objetivo',     'instagram', NULL,                      'TU_IG_USER_ID_OBJETIVO', 'OBJETIVO Instagram'),
  ('cesar-reyes',  'facebook',  'TU_PAGE_ID_CESAR',       NULL,                     'César Reyes Jaramillo'),
  ('cesar-reyes',  'instagram', NULL,                      'TU_IG_USER_ID_CESAR',    'César Reyes IG'),
  ('activaqr',     'facebook',  'TU_PAGE_ID_ACTIVAQR',    NULL,                     'ActivaQR'),
  ('activaqr',     'instagram', NULL,                      'TU_IG_USER_ID_ACTIVAQR', 'ActivaQR Instagram')
ON CONFLICT (brand_name, platform) DO NOTHING;
*/
