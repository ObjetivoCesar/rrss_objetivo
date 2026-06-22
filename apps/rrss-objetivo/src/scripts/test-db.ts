import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkSchema() {
  console.log('🔍 Analizando tabla social_posts...');
  
  // Obtenemos un registro para ver las llaves (columnas)
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error accediendo a la tabla:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ Columnas detectadas en social_posts:');
    console.log(Object.keys(data[0]).join(', '));
  } else {
    // Si no hay datos, intentamos un insert fallido para ver el esquema en el error o mensaje
    console.log('⚠️ La tabla está vacía. No se pudo inferir el esquema por introspección de registros.');
    console.log('Intenta ejecutar el SQL de ALTER TABLE propuesto.');
  }
}

checkSchema();
