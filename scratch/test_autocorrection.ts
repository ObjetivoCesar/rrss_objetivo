import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno ANTES de importar módulos que las usan
const envPath = path.resolve(process.cwd(), 'apps/rrss-objetivo/.env.local');
console.log(`🔍 Cargando env desde: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("❌ Error cargando .env.local:", result.error);
}

import { supabaseAdmin } from '../apps/rrss-objetivo/src/lib/supabase-admin';
import { processScheduledPosts } from '../apps/rrss-objetivo/src/lib/scheduler';

async function testAutocorrection() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Faltan variables de Supabase en el entorno.");
    console.log("Variables cargadas:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    return;
  }

  console.log("🧪 Iniciando prueba de autocorrección...");

  const testImage = "https://static.vecteezy.com/system/resources/thumbnails/007/951/005/small/globe-glass-on-grass-with-sunshine-environment-concept-free-photo.jpg";
  
  // 1. Crear un post de prueba con metadata de formato
  const { data: post, error } = await supabaseAdmin
    .from('social_posts')
    .insert({
      content_text: "Prueba de autocorrección de imagen horizontal a 1:1 con fondo difuminado #Test #DonnaAI",
      media_url: testImage,
      media_urls: [testImage],
      platforms: ['instagram'],
      status: 'pending',
      scheduled_for: new Date().toISOString(),
      category_id: 'educativo',
      metadata: {
        instagram_format: "1:1"
      }
    })
    .select()
    .single();

  if (error || !post) {
    console.error("❌ Error creando post de prueba:", error);
    return;
  }

  console.log(`✅ Post de prueba creado ID: ${post.id}`);
  console.log(`📸 Imagen original: ${testImage}`);
  console.log(`🎯 Formato solicitado: 1:1`);

  // 2. Ejecutar el scheduler
  console.log("\n🏃 Ejecutando Scheduler...");
  try {
    await processScheduledPosts();
  } catch (err: any) {
    console.error("💥 Error en processScheduledPosts:", err.message);
  }

  // 3. Verificar resultados
  const { data: updatedPost } = await supabaseAdmin
    .from('social_posts')
    .select('*')
    .eq('id', post.id)
    .single();

  if (updatedPost) {
    console.log("\n📊 RESULTADOS:");
    console.log(`- Status: ${updatedPost.status}`);
    console.log(`- Nueva Media URL: ${updatedPost.media_url}`);
    
    if (updatedPost.media_url !== testImage && updatedPost.media_url?.includes('corrected')) {
      console.log("✨ ¡AUTOCORRECCIÓN EXITOSA! La URL ha cambiado a una versión corregida.");
    } else if (updatedPost.status === 'failed') {
      console.log("❌ El post falló. Error log:", updatedPost.error_log);
    } else {
      console.log("❓ La URL no cambió o no tiene el prefijo 'corrected'.");
      console.log("URL actual:", updatedPost.media_url);
    }
  }
}

testAutocorrection().catch(console.error);
