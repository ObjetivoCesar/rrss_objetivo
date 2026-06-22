import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno locales ANTES de los imports de los módulos
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Importaciones estáticas pero después de que dotenv actuó.
// Si fallara por el escaneo de import de ES6, TSX podría izarlo. Por seguridad usamos dynamic require.
const { supabaseAdmin } = require('./src/lib/supabase-admin');
const { processScheduledPosts } = require('./src/lib/scheduler');

async function verifyWebhook() {
  console.log('🔄 Iniciando test manual del webhook para Instagram...');

  try {
    // 1. Crear un post falso simulando lo que hace Donna para Instagram
    console.log('📝 Creando registro de prueba forzado a Instagram...');
    const postDate = new Date().toISOString();
    
    // Obtenemos los attachments del pipeline de prueba (puedes cambiar esta URL por cualquiera de tu storage)
    const testMediaUrl = 'https://fcfsexddgupnvbvntgyz.supabase.co/storage/v1/object/public/assets/donna-chat/1776205973099-Los%20contactos.png';

    const { data: post, error } = await supabaseAdmin
      .from('social_posts')
      .insert([{
        content_text: '¡Prueba manual definitiva del Webhook! 🚀 Si Make.com recibe este post, significa que la tubería técnica está intacta. #Test #RRSS_objetivo',
        platforms: ['instagram'],
        status: 'pending', // Listo para que el scheduler lo recoja AHORA
        scheduled_for: postDate,
        media_url: testMediaUrl,
        media_urls: [testMediaUrl],
        topic: 'Test de Webhook de Emergencia'
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

    // 2. Ejecutar el orquestador
    await processScheduledPosts();

    console.log('🏁 Proceso finalizado. Por favor, revisa el escenario de Make.com y mira si llegó este post diciendo "Prueba manual definitiva" y si vino con el array Platforms = ["instagram"].');

  } catch (err: any) {
    console.error('❌ Error crudo en el script:', err.message);
  }
}

verifyWebhook();
