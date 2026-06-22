import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/apps/rrss-objetivo/.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function insertAndWatch() {
  const now = new Date();
  // Programar para 2 minutos en el futuro
  const scheduledFor = new Date(now.getTime() + 2 * 60 * 1000);

  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║  PRUEBA FINAL — pg_cron Autónomo         ║`);
  console.log(`╚══════════════════════════════════════════╝`);
  console.log(`\n[Test] 🕒 Ahora:          ${now.toLocaleTimeString()}`);
  console.log(`[Test] 🎯 Publicar a las: ${scheduledFor.toLocaleTimeString()}`);
  console.log(`[Test] ⚙️  SIN acción manual — pg_cron + Vercel lo dispararán solos`);

  const { data: post, error } = await supabase
    .from('social_posts')
    .insert([{
      content_text: `🤖 PRUEBA AUTÓNOMA (pg_cron)\n\nEste post fue creado a las ${now.toLocaleTimeString()}. Nadie tocó un botón. pg_cron despertó a Vercel que disparó Make.com.\n\nFase 1 completada.`,
      media_url: 'https://img.freepik.com/foto-gratis/fondo-geometrico-abstracto-3d_1048-11325.jpg',
      media_urls: ['https://img.freepik.com/foto-gratis/fondo-geometrico-abstracto-3d_1048-11325.jpg'],
      status: 'pending',
      scheduled_for: scheduledFor.toISOString(),
      platforms: ['facebook'],
      category_id: 'educativo',
      objective_id: '5d9e7d2b-b341-4d94-870e-152a8da1345c',
    }])
    .select()
    .single();

  if (error) {
    console.error('[Test] ❌ Error insertando:', error.message);
    return;
  }

  console.log(`\n[Test] ✅ Post ID: ${post.id}`);
  console.log(`[Test] 📋 Status actual: ${post.status}`);
  console.log(`\n[Test] ⏳ Monitoreando el estado cada 30s...`);
  console.log(`[Test] (pg_cron + Vercel deberían procesarlo sin intervención)\n`);

  // Monitorear el post cada 30 segundos hasta que cambie de estado
  let attempts = 0;
  const maxAttempts = 10; // 5 minutos máximo

  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 30000));
    attempts++;

    const { data: updated } = await supabase
      .from('social_posts')
      .select('status, error_log, updated_at')
      .eq('id', post.id)
      .single();

    const elapsed = Math.round((Date.now() - now.getTime()) / 1000);
    console.log(`[${elapsed}s] Status: ${updated?.status} | updated_at: ${new Date(updated?.updated_at).toLocaleTimeString()}`);

    if (updated?.status === 'published') {
      console.log(`\n🎉 ¡ÉXITO TOTAL! Post publicado automáticamente en ${elapsed}s`);
      console.log(`   pg_cron → Vercel → Scheduler → Make.com → Facebook ✅`);
      break;
    }

    if (updated?.status === 'failed') {
      console.log(`\n❌ El post falló. Error: ${updated?.error_log}`);
      break;
    }
  }
}

insertAndWatch();
