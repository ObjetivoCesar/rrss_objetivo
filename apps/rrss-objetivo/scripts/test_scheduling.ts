import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde la app
dotenv.config({ path: path.join('c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/apps/rrss-objetivo/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Faltan variables de entorno en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testScheduling() {
  const now = new Date();
  const scheduledFor = new Date(now.getTime() + 2 * 60 * 1000); // +2 minutos
  
  console.log(`[Test] Hora actual: ${now.toISOString()}`);
  console.log(`[Test] Programando para: ${scheduledFor.toISOString()}`);

  const { data, error } = await supabase
    .from('social_posts')
    .insert([
      {
        content_text: `🚀 Prueba de programación automática (Donna AI). Si ves esto, el protocolo de Fase 1 está funcionando al 100%. Hora: ${scheduledFor.toLocaleTimeString()}`,
        media_url: 'https://img.freepik.com/foto-gratis/fondo-geometrico-abstracto-3d_1048-11325.jpg',
        media_urls: ['https://img.freepik.com/foto-gratis/fondo-geometrico-abstracto-3d_1048-11325.jpg'],
        status: 'scheduled',
        scheduled_for: scheduledFor.toISOString(),
        platforms: ['facebook'],
        category_id: 'educativo',
        brand_id: '5d9e7d2b-b341-4d94-870e-152a8da1345c' // ID de OBJETIVO
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('[Test] Error al insertar post:', error);
    return;
  }

  console.log('[Test] ✅ Post insertado con éxito. ID:', data.id);
  console.log('[Test] Esperando 2 minutos para que el scheduler lo recoja...');
}

testScheduling();
