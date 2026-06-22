import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testFinal() {
  console.log('🧪 Iniciando TEST FINAL de base de datos...');
  
  const testData = { 
    content_text: 'Test Final - Esquema verificado por Donna AI.', 
    platforms: ['instagram', 'facebook'],
    topic: 'Verificación de Sistema',
    scheduled_for: new Date().toISOString(),
    external_links: ['https://rrss.objetivo.ai/test'] // Probando la columna que acabas de crear
  };

  const { data, error } = await supabase
    .from('social_posts')
    .insert([testData])
    .select();

  if (error) {
    console.error('❌ El test falló:', error.message);
    if (error.message.includes('external_links')) {
      console.log('💡 Parece que la columna external_links sigue dando problemas.');
    }
  } else {
    console.log('✅ ¡SISTEMA 100% OPERATIVO!');
    console.log('ID del registro de prueba:', data[0].id);
    console.log('Campos confirmados: content_text, platforms, scheduled_for, external_links.');
  }
}

testFinal();
