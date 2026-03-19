-- 1. Re-habilitar RLS para quitar la advertencia de Supabase
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- 2. Crear Política para que nuestro Backend (Service Role) tenga control total
-- Nota: La service_role_key que usamos en .env salta el RLS por defecto en Supabase, 
-- pero esta política es buena práctica para asegurar que nadie más acceda.
CREATE POLICY "Full access to service role" 
ON social_posts 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
