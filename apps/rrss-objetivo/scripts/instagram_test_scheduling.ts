import dotenv from 'dotenv';
import path from 'path';

// 1. CARGAR DOTENV
dotenv.config({ path: path.join('c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/apps/rrss-objetivo/.env.local') });

process.env.NODE_ENV = 'production'; 
process.env.DEBUG_SCHEDULER = 'true';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function instagramSchedulingTest() {
  const { processScheduledPosts } = await import('../src/lib/scheduler');

  // Programar exactamente para las 14:40:00
  const scheduledFor = new Date('2026-04-26T14:40:00-05:00');
  const now = new Date();
  
  console.log(`\n[Instagram Test] 🕒 Hora actual: ${now.toLocaleTimeString()}`);
  console.log(`[Instagram Test] ⏱️ Programando para: ${scheduledFor.toLocaleTimeString()}`);

  const { data: post, error } = await supabase
    .from('social_posts')
    .insert([
      {
        content_text: `🎨 PRUEBA INSTAGRAM (Donna AI)\n\nProgramado a las ${now.toLocaleTimeString()} para las 14:40.\n\nEste post usa AUTOCORRECCIÓN 1:1 para asegurar que el ratio sea perfecto.`,
        media_url: 'https://img.freepik.com/foto-gratis/fondo-geometrico-abstracto-3d_1048-11325.jpg',
        media_urls: ['https://img.freepik.com/foto-gratis/fondo-geometrico-abstracto-3d_1048-11325.jpg'],
        status: 'pending',
        scheduled_for: scheduledFor.toISOString(),
        platforms: ['instagram'],
        category_id: 'educativo',
        objective_id: '5d9e7d2b-b341-4d94-870e-152a8da1345c',
        metadata: {
            instagram_format: '1:1' // Esto disparará la lógica de Sharp en el scheduler
        }
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('[Instagram Test] ❌ Error:', error);
    return;
  }

  console.log(`[Instagram Test] ✅ Post ID ${post.id} creado.`);
  
  // Calcular espera
  const waitMs = scheduledFor.getTime() - Date.now() + 5000; // +5s de seguridad
  console.log(`[Instagram Test] ⏳ Esperando ${(waitMs/1000).toFixed(0)} segundos hasta las 14:40:05...`);

  await new Promise(resolve => setTimeout(resolve, Math.max(0, waitMs)));

  console.log(`\n[Instagram Test] ⚡️ Disparando el motor...`);
  
  try {
    await processScheduledPosts();
    console.log(`\n[Instagram Test] 🏁 Ciclo completado. Revisa Instagram.`);
  } catch (err: any) {
    console.error(`[Instagram Test] 💥 Error:`, err.message);
  }
}

instagramSchedulingTest();
