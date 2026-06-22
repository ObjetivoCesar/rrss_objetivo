import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSessionsTable() {
  console.log('🚀 Iniciando creación de tabla antigravity_sessions...');
  
  // Como no podemos ejecutar SQL puro arbitrario desde el cliente de JS sin RPC,
  // verificamos primero si la tabla existe intentando un select.
  // Si la tabla no existe, el usuario deberá ejecutar el SQL que imprimiré.
  
  const { error } = await supabase
    .from('antigravity_sessions')
    .select('id')
    .limit(1);

  if (error && error.code === '42P01') {
    console.log('⚠️ La tabla no existe. César, por favor ejecuta este SQL en tu SQL Editor de Supabase:');
    console.log(`
    CREATE TABLE antigravity_sessions (
      id BIGSERIAL PRIMARY KEY,
      conversation_id UUID UNIQUE NOT NULL,
      session_title TEXT,
      summary TEXT,
      pending_tasks JSONB DEFAULT '[]'::jsonb,
      decisions JSONB DEFAULT '[]'::jsonb,
      dna_snapshot JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Habilitar RLS si es necesario, o dejarlo abierto para service_role
    ALTER TABLE antigravity_sessions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service Role Full Access" ON antigravity_sessions FOR ALL USING (auth.role() = 'service_role');
    `);
  } else if (error) {
    console.error('❌ Error desconocido:', error);
  } else {
    console.log('✅ La tabla antigravity_sessions ya existe.');
  }
}

createSessionsTable();
