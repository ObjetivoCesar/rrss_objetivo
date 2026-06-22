-- Tabla para el Pipeline de Inteligencia de Competencia Viral
-- Ejecutar en: Supabase Dashboard → SQL Editor

create table if not exists viral_analyses (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  transcript text,
  hook text,
  hook_type text,
  psychological_pattern text,
  curiosity_gap text,
  narrative_structure jsonb,
  retention_mechanisms jsonb,
  psychological_triggers jsonb,
  viral_dna jsonb,
  viral_formula text,
  thumbnail_cover jsonb,
  cesar_adaptations jsonb,
  hook_variations jsonb,
  why_viral text,
  replication_score integer,
  model_used text default 'MiniMax-Text-01',
  created_at timestamp with time zone default now()
);

-- Índice para búsquedas por URL (evitar duplicados)
create index if not exists idx_viral_analyses_url on viral_analyses(url);

-- Índice por hook_type para filtrar por tipo de gancho
create index if not exists idx_viral_analyses_hook_type on viral_analyses(hook_type);

-- RLS: Solo el service role puede insertar/leer (pipeline backend)
alter table viral_analyses enable row level security;

create policy "service_role_only" on viral_analyses
  using (auth.role() = 'service_role');

-- MIGRACIÓN: Ejecutar si la tabla ya existe
alter table viral_analyses
add column if not exists viral_dna jsonb,
add column if not exists thumbnail_cover jsonb,
add column if not exists cesar_adaptations jsonb,
add column if not exists replication_score integer;
