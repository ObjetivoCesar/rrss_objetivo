import dotenv from 'dotenv';
import path from 'path';

// 1. CARGAR DOTENV ANTES QUE NADA
dotenv.config({ path: path.join('c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/apps/rrss-objetivo/.env.local') });

// 2. CONFIGURAR VARIABLES DE ENTORNO PARA EL SCHEDULER
process.env.NODE_ENV = 'production'; 
process.env.DEBUG_SCHEDULER = 'true';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Faltan variables de entorno en .env.local (NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fullCycleTest() {
  // Import dinámico para asegurar que las env vars ya existen
  const { processScheduledPosts } = await import('../src/lib/scheduler');

  const now = new Date();
  const scheduledFor = new Date(now.getTime() + 1 * 60 * 1000); // +1 minuto
  
  console.log(`\n[Test] 🕒 Hora actual: ${now.toLocaleTimeString()}`);
  console.log(`[Test] ⏱️ Programando post para: ${scheduledFor.toLocaleTimeString()}`);

  const { data: post, error } = await supabase
    .from('social_posts')
    .insert([
      {
        content_text: `🚀 PRUEBA DE PROGRAMACIÓN (Donna AI)\n\nEste post fue programado a las ${now.toLocaleTimeString()} para salir a las ${scheduledFor.toLocaleTimeString()}.\n\nSi lees esto, el scheduler detectó el tiempo correctamente y disparó el webhook de Make.com.`,
        media_url: 'https://img.freepik.com/foto-gratis/fondo-geometrico-abstracto-3d_1048-11325.jpg',
        media_urls: ['https://img.freepik.com/foto-gratis/fondo-geometrico-abstracto-3d_1048-11325.jpg'],
        status: 'pending',
        scheduled_for: scheduledFor.toISOString(),
        platforms: ['facebook'],
        category_id: 'educativo',
        objective_id: '5d9e7d2b-b341-4d94-870e-152a8da1345c' // ID de OBJETIVO
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('[Test] ❌ Error al insertar post:', error);
    return;
  }

  console.log(`[Test] ✅ Post ID ${post.id} creado en estado 'pending'.`);
  console.log(`[Test] ⏳ Esperando 70 segundos para asegurar que el tiempo de programación se cumpla...`);

  await new Promise(resolve => setTimeout(resolve, 70000));

  console.log(`\n[Test] ⚡️ Disparando el motor del Scheduler manualmente...`);
  
  try {
    await processScheduledPosts();
    console.log(`\n[Test] 🏁 Ciclo completado. Revisa la base de datos o Facebook.`);
  } catch (err: any) {
    console.error(`[Test] 💥 Error ejecutando el scheduler:`, err.message);
  }
}

fullCycleTest();
