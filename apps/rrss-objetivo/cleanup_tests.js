import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  console.log('🧹 Limpiando posts de prueba...');

  const { data, error } = await supabase
    .from('social_posts')
    .delete()
    .or('content_text.ilike.%TEST%,content_text.ilike.%Lámina%');

  if (error) {
    console.error('❌ Error al limpiar:', error);
  } else {
    console.log('✅ Base de datos limpia de pruebas.');
  }

  // También limpiar archivos huérfanos del bucket si quedara alguno (opcional)
  // El scheduler ya limpia al publicar, pero por si acaso.
}

cleanup();
