import { supabaseAdmin } from './supabase-admin';
import { deleteFromSupabase, realizeMediaUrls } from './storage';
import { logSystem } from './logger';

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL!;
const MAKE_WEBHOOK_SECRET = process.env.MAKE_WEBHOOK_SECRET!;

// Tiempo máximo que un post puede estar en 'processing' antes de ser recuperado
const PROCESSING_TIMEOUT_MINUTES = 10;

// Número máximo de reintentos antes de marcar como 'failed'
const MAX_RETRIES = 2;

async function logDebug(message: string, severity: 'INFO' | 'ERROR' | 'WARNING' = 'INFO') {
  console.log(`[${severity}] ${message}`);
  await logSystem('scheduler', severity, message);
}

/**
 * PASO 0: Recovery de posts colgados en 'processing'
 * Si un post lleva más de PROCESSING_TIMEOUT_MINUTES en ese estado,
 * significa que el servidor crasheó durante el envío. Lo regresamos a 'pending'.
 */
async function recoverStuckPosts() {
  const cutoff = new Date(Date.now() - PROCESSING_TIMEOUT_MINUTES * 60 * 1000).toISOString();

  const { data: stuckPosts, error } = await supabaseAdmin
    .from('social_posts')
    .select('id, updated_at')
    .eq('status', 'processing')
    .lt('updated_at', cutoff);

  if (error) {
    await logDebug(`❌ [Recovery] Error buscando posts colgados: ${error.message}`, 'ERROR');
    return;
  }

  if (!stuckPosts || stuckPosts.length === 0) return;

  await logDebug(`🔄 [Recovery] Recuperando ${stuckPosts.length} post(s) colgados en 'processing'`, 'WARNING');

  for (const post of stuckPosts) {
    await supabaseAdmin
      .from('social_posts')
      .update({ status: 'pending' })
      .eq('id', post.id);

    await logDebug(`↩️ [Recovery] Post ${post.id} regresado a 'pending'`, 'WARNING');
  }
}

/**
 * Envía el post a Make.com con reintentos automáticos.
 * Retorna true si tuvo éxito, false si agotó los reintentos.
 */
async function sendToMakeWithRetry(payload: any, postId: string): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await logDebug(`📤 [Scheduler] Intento ${attempt}/${MAX_RETRIES} — Post ${postId}`);

      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return true;
      }

      const errorText = await response.text();
      await logDebug(
        `⚠️ [Scheduler] Make respondió ${response.status} en intento ${attempt}: ${errorText}`,
        'WARNING'
      );
    } catch (err: any) {
      await logDebug(`⚠️ [Scheduler] Error de red en intento ${attempt}: ${err.message}`, 'WARNING');
    }

    // Backoff exponencial: 5s, 10s antes del último intento
    if (attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, attempt * 5000));
    }
  }

  return false;
}

/**
 * Hook para Evolution API: notifica al propietario por WhatsApp cuando un post falla.
 * Se activa solo si EVOLUTION_API_URL y EVOLUTION_PHONE están configurados.
 */
async function notifyFailureViaWhatsApp(postId: string, errorMessage: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;
  const evolutionInstance = process.env.EVOLUTION_INSTANCE;
  const notifyPhone = process.env.EVOLUTION_NOTIFY_PHONE || process.env.NOTIFY_WHATSAPP_NUMBER || process.env.WHATSAPP_NOTIFICATION_NUMBER; // ej: "593XXXXXXXXX"

  if (!evolutionUrl || !evolutionKey || !evolutionInstance || !notifyPhone) {
    // Evolution API no configurada — ignorar silenciosamente
    return;
  }

  try {
    const message = `⚠️ *RRSS Scheduler*\n\nFalló un post después de ${MAX_RETRIES} intentos.\n\n*Post ID:* ${postId}\n*Error:* ${errorMessage.slice(0, 200)}\n\nRevisa el Dashboard → Publicaciones.`;

    await fetch(`${evolutionUrl}/message/sendText/${evolutionInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionKey,
      },
      body: JSON.stringify({
        number: notifyPhone,
        text: message,
      }),
    });

    await logDebug(`📱 [Alert] Notificación WhatsApp enviada para post ${postId}`, 'INFO');
  } catch (err: any) {
    // Nunca dejar que el sistema de alertas rompa el proceso principal
    await logDebug(`⚠️ [Alert] No se pudo enviar alerta WhatsApp: ${err.message}`, 'WARNING');
  }
}

export async function processScheduledPosts() {
  await logDebug('🕒 [Scheduler] Iniciando ciclo de publicación...');

  // PASO 0: Recuperar posts colgados en 'processing'
  await recoverStuckPosts();

  // PASO 1: Obtener posts pendientes con fecha pasada o presente
  const { data: pendingPosts, error } = await supabaseAdmin
    .from('social_posts')
    .select('*')
    .eq('status', 'pending')
    .is('archived_at', null)
    .lte('scheduled_for', new Date().toISOString())
    .limit(20);

  if (error) {
    await logDebug('❌ [Scheduler] Error obteniendo posts: ' + error.message, 'ERROR');
    return;
  }

  if (!pendingPosts || pendingPosts.length === 0) {
    await logDebug('😴 [Scheduler] No hay posts para publicar en este momento.', 'INFO');
    return;
  }

  await logDebug(`🚀 [Scheduler] Procesando ${pendingPosts.length} post(s)...`);

  for (const post of pendingPosts) {
    try {
      await logDebug(`📦 [Scheduler] Preparando post: ${post.id}`);

      // PASO 2: Marcar como 'processing' (con updated_at para el timeout recovery)
      const { error: updateError } = await supabaseAdmin
        .from('social_posts')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', post.id)
        .eq('status', 'pending'); // Optimistic lock: solo si aún está en pending

      if (updateError) {
        await logDebug(`❌ [Scheduler] Error marcando 'processing' ${post.id}: ${updateError.message}`, 'ERROR');
        continue;
      }

      // PASO 3: Construir payload universal para Make
      // 🌉 SEGURIDAD: Asegurar que no enviamos URLs de proxy a Make.com
      const cleanedUrls = await realizeMediaUrls(post.media_urls || [], post.category_id || 'educativo');
      
      // Si hubo cambios (se realizaron imágenes), actualizar la DB para que no se repita el proceso
      if (JSON.stringify(cleanedUrls) !== JSON.stringify(post.media_urls)) {
        await logDebug(`[Scheduler] 🔄 URLs de proxy realizadas para post ${post.id}. Actualizando DB.`);
        await supabaseAdmin
          .from('social_posts')
          .update({ 
            media_urls: cleanedUrls,
            media_url: cleanedUrls[0] || null 
          })
          .eq('id', post.id);
      }

      const mediaUrls = Array.isArray(cleanedUrls)
        ? cleanedUrls
            .filter((url: string | null) => url && typeof url === 'string' && url.trim().length > 0)
            .map((url: string) => {
              const lowerUrl = url.toLowerCase();
              const isVideo = lowerUrl.endsWith('.mp4');
              const isImage = lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.gif') || url.includes('image-proxy');
              
              let mediaType = 'LINK';
              if (isVideo) mediaType = 'VIDEO';
              else if (isImage) mediaType = 'IMAGE';

              return {
                media_type: mediaType,
                url,
                image_url: isImage ? url : null,
                video_url: isVideo ? url : null,
                type: isVideo ? 'video' : (isImage ? 'image' : 'link'),
                is_link: !isImage && !isVideo,
                is_image: isImage,
                is_video: isVideo
              };
            })
        : [];

      // Determinar categoría principal del post para filtrado fácil en Make
      const hasImage = mediaUrls.some(m => m.is_image);
      const isVideoPost = mediaUrls.some(m => m.is_video);
      const postMediaCategory = isVideoPost ? 'video' : (hasImage ? 'image' : 'link');

      const metadata = post.metadata || {};

      const payload = {
        api_secret: MAKE_WEBHOOK_SECRET,
        post_id: post.id,
        version: "v2-media-link-fixed-101", // Marca de versión para debug
        text: post.content_text,
        media_url: post.media_url || null,
        media_urls: mediaUrls,
        post_media_category: postMediaCategory, // 'image', 'video', o 'link'
        platforms: post.platforms || [],
        metadata: {
          youtube_title: metadata.youtube_title || post.content_text?.slice(0, 100) || '',
          youtube_description: metadata.youtube_description || post.content_text || '',
          linkedin_title: metadata.linkedin_title || '',
          tiktok_privacy: metadata.tiktok_privacy || 'public_to_everyone',
          tiktok_disable_comment: metadata.tiktok_disable_comment || false,
          tiktok_disable_duet: metadata.tiktok_disable_duet || false,
        },
      };

      // PASO 4: Enviar a Make con reintentos automáticos
      const success = await sendToMakeWithRetry(payload, post.id);

      if (success) {
        // PASO 5a: Publicado exitosamente
        await supabaseAdmin
          .from('social_posts')
          .update({ 
            status: 'published', 
            updated_at: new Date().toISOString() 
          })
          .eq('id', post.id);

        await logDebug(`✅ [Scheduler] Post ${post.id} publicado correctamente.`);
        // Nota: La limpieza se realiza en cleanupPublishedMedia()
      } else {
        // PASO 5b: Agotó reintentos → marcar como failed y alertar
        const errorMessage = `Agotó ${MAX_RETRIES} intentos de envío a Make.com`;

        await supabaseAdmin
          .from('social_posts')
          .update({ status: 'failed', error_log: errorMessage, updated_at: new Date().toISOString() })
          .eq('id', post.id);

        await logDebug(`❌ [Scheduler] Post ${post.id} FALLIDO tras ${MAX_RETRIES} intentos.`, 'ERROR');

        // Notificación WhatsApp al propietario (Evolution API)
        await notifyFailureViaWhatsApp(post.id, errorMessage);
      }
    } catch (err: any) {
      // Error inesperado (no de Make, sino del código mismo)
      await logDebug(`💥 [Scheduler] Error crítico inesperado en post ${post.id}: ${err.message}`, 'ERROR');

      await supabaseAdmin
        .from('social_posts')
        .update({ status: 'failed', error_log: err.message, updated_at: new Date().toISOString() })
        .eq('id', post.id);

      await notifyFailureViaWhatsApp(post.id, err.message);
    }
  }

  // PASO 6: Ejecutar limpieza programada
  await cleanupPublishedMedia();

  await logDebug('🏁 [Scheduler] Ciclo completado.');
}

/**
 * Limpia las imágenes de Supabase Storage para posts ya publicados.
 * En producción: Limpia a las 00:00.
 * En pruebas (actual): Limpia tras 2 minutos de la publicación.
 */
async function cleanupPublishedMedia() {
  const isPruebas = true; // Cambiar a false para producción (limpieza 00:00)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Si no es pruebas, solo limpiar a medianoche (00:00 a 00:10 por ejemplo)
  if (!isPruebas && (currentHour !== 0 || currentMinute > 10)) {
    return;
  }

  // Si es pruebas, limpiar posts publicados hace más de 2 minutos
  const offsetMinutes = isPruebas ? 2 : 0; 
  const cutoff = new Date(Date.now() - offsetMinutes * 60 * 1000).toISOString();

  await logDebug(`🧹 [Cleanup] Buscando media para limpiar (Publicados antes de: ${cutoff})...`);

  const { data: postsToCleanup, error } = await supabaseAdmin
    .from('social_posts')
    .select('id, media_urls')
    .eq('status', 'published')
    .is('archived_at', null)
    .lt('updated_at', cutoff)
    .not('media_urls', 'is', null);

  if (error || !postsToCleanup || postsToCleanup.length === 0) {
    if (error) await logDebug(`❌ [Cleanup] Error: ${error.message}`, 'ERROR');
    return;
  }

  for (const post of postsToCleanup) {
    if (post.media_urls && Array.isArray(post.media_urls)) {
      for (const url of post.media_urls) {
        if (url.includes('/storage/v1/object/public/social-posts/') || url.includes('/storage/v1/object/public/posts-assets/')) {
          const fileName = url.split('/').pop();
          if (fileName) {
            const success = await deleteFromSupabase(fileName);
            if (success) {
              await logDebug(`🗑️ [Cleanup] Imagen eliminada: ${fileName} (Post ${post.id})`);
            }
          }
        }
      }
      
      // Opcional: Limpiar los campos de la DB para ahorrar espacio también en las filas
      await supabaseAdmin
        .from('social_posts')
        .update({ media_url: null, media_urls: [] })
        .eq('id', post.id);
    }
  }
}
