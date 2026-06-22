import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno locales
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testPrueba3() {
  console.log('🔄 Iniciando PRUEBA 3: Imagen 1:1 generada por Antigravity...');

  try {
    const localImagePath = 'C:\\Users\\Cesar\\.gemini\\antigravity\\brain\\db08176d-b8b7-4ebd-99d1-cc41cdec8b31\\test_instagram_square_1777224967282.png';
    const fileName = `test_p3_${Date.now()}.png`;

    console.log('📤 Subiendo imagen generada a Supabase...');
    const fileBuffer = fs.readFileSync(localImagePath);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('posts-assets')
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Error subiendo imagen:', uploadError.message);
      return;
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('posts-assets')
      .getPublicUrl(fileName);

    console.log(`✅ Imagen subida: ${publicUrl}`);

    // 2. Crear el post
    console.log('📝 Creando post para Instagram (Prueba 3)...');
    const { data: post, error: postError } = await supabaseAdmin
      .from('social_posts')
      .insert([{
        content_text: '¡Prueba 3: Éxito total! 🚀 Imagen 1:1 generada y validada. Si lees esto en Instagram, el sistema está listo para producción. #Antigravity #RRSS_objetivo',
        platforms: ['instagram'],
        status: 'pending',
        scheduled_for: new Date().toISOString(),
        media_url: publicUrl,
        media_urls: [publicUrl],
        topic: 'Test 3 - Square Format'
      }])
      .select()
      .single();

    if (postError) {
      console.error('❌ Error creando post:', postError.message);
      return;
    }

    console.log(`✅ Post creado con ID: ${post.id}`);
    console.log('⚙️ Disparando scheduler...');

    const { processScheduledPosts } = require('./src/lib/scheduler');
    await processScheduledPosts();

    // 3. Verificar
    const { data: finalPost } = await supabaseAdmin
      .from('social_posts')
      .select('*')
      .eq('id', post.id)
      .single();

    console.log('\n📊 RESULTADO FINAL PRUEBA 3:');
    console.log(`   - Status: ${finalPost.status}`);
    if (finalPost.status === 'published') {
      console.log('   🎉 ¡PRUEBA 3 EXITOSA! Publicado en Instagram.');
    } else {
      console.log(`   ❌ FALLÓ: ${finalPost.error_log}`);
    }

  } catch (err: any) {
    console.error('💥 Error crítico:', err.message);
  }
}

testPrueba3();
