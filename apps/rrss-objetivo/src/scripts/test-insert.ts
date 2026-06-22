import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testInsert() {
  console.log('🧪 Probando inserción real en social_posts...');
  const { data, error } = await supabase
    .from('social_posts')
    .insert([{ 
      content_text: 'Test de conexión - Donna está verificando la base de datos.', 
      platforms: ['instagram'],
      topic: 'Test de Sistema'
    }])
    .select();

  if (error) {
    console.error('❌ Error en la prueba de inserción:', error.message);
    console.log('\n💡 Sugerencia: Revisa si la columna es "content" o "content_text" en tu DB.');
  } else {
    console.log('✅ ¡PRUEBA EXITOSA!');
    console.log('ID del post creado:', data[0].id);
    console.log('Esquema verificado para: content_text, platforms, topic.');
  }
}

testInsert();
