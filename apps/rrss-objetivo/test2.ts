import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno locales ANTES de los imports de los módulos
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Importaciones estáticas pero después de que dotenv actuó.
const { supabaseAdmin } = require('./src/lib/supabase-admin');
const { processScheduledPosts } = require('./src/lib/scheduler');

async function testSinglePostWithImage() {
  console.log('🔄 Iniciando Prueba 2: Post con imagen válida...');

  try {
    console.log('📝 Creando registro de prueba forzado a Instagram con imagen válida...');
    const postDate = new Date().toISOString();
    
    // Usamos la URL proporcionada por el usuario
    const testMediaUrl = 'https://static.vecteezy.com/system/resources/thumbnails/007/951/005/small/globe-glass-on-grass-with-sunshine-environment-concept-free-photo.jpg';

    const { data: post, error } = await supabaseAdmin
      .from('social_posts')
      .insert([{
        content_text: '¡Prueba 2 del Webhook con imagen válida! 🌍 Si ves esto, Make.com y la imagen están funcionando perfecto. #Test2 #RRSS_objetivo',
        platforms: ['instagram'],
        status: 'pending',
        scheduled_for: postDate,
        media_url: testMediaUrl,
        media_urls: [testMediaUrl],
        topic: 'Test Webhook Imagen Válida'
      }])
      .select('id, platforms, status')
      .single();

    if (error) {
      console.error('❌ Error creando el post en BD:', error);
      return;
    }

    console.log(`✅ Post de prueba creado en BD: ${post.id}`);
    console.log(`📊 Plataformas en BD:`, post.platforms);
    console.log(`⚙️ Disparando scheduler interno forzado...`);

    // Ejecutar el orquestador
    await processScheduledPosts();

    // Verificar resultado
    const { data: updatedPost, error: fetchError } = await supabaseAdmin
      .from('social_posts')
      .select('*')
      .eq('id', post.id)
      .single();

    if (fetchError) {
      console.error('❌ Error verificando post:', fetchError.message);
      return;
    }

    console.log('\\n📊 RESULTADO DE LA PRUEBA 2:');
    console.log(`   - Status Final: ${updatedPost.status}`);
    if (updatedPost.status === 'failed') {
      console.log(`   - Error Log: ${updatedPost.error_log}`);
    } else if (updatedPost.status === 'published') {
      console.log('   🎉 ¡ÉXITO! El post fue procesado y enviado a Make.com sin errores.');
    }

  } catch (err: any) {
    console.error('❌ Error en el script:', err.message);
  }
}

testSinglePostWithImage();
