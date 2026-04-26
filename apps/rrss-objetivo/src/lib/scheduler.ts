import { supabaseAdmin } from './supabase-admin';
import { deleteFromSupabase, realizeMediaUrls, uploadToSupabase } from './storage';
import { logger } from './logger';
import fetch from 'node-fetch';
import { processImageFromUrl } from './image-utils';

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL!;
const MAKE_WEBHOOK_SECRET = process.env.MAKE_WEBHOOK_SECRET!;

// Tiempo máximo que un post puede estar en 'processing' antes de ser recuperado
const PROCESSING_TIMEOUT_MINUTES = 10;

// Número máximo de reintentos antes de marcar como 'failed'
const MAX_RETRIES = 2;

async function logDebug(message: string, severity: 'INFO' | 'ERROR' | 'WARNING' = 'INFO') {
  if (severity === 'ERROR') logger.error(`[Scheduler] ${message}`);
  else if (severity === 'WARNING') logger.warn(`[Scheduler] ${message}`);
  else logger.info(`[Scheduler] ${message}`);
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
 * PASO PRE-MAKE: Validación de aspect ratio para posts de Instagram.
 * La Graph API de Instagram rechaza imágenes fuera del rango 0.8–1.91 (Error 36003).
 * Este validador bloquea el envío ANTES de gastar operaciones de Make.
 *
 * @returns null si todo está OK, o un string con el mensaje de error si hay problema.
 */
async function validateInstagramAspectRatio(imageUrl: string): Promise<string | null> {
  const INSTAGRAM_RATIO_MIN = 0.8;   // 4:5 vertical
  const INSTAGRAM_RATIO_MAX = 1.91;  // 1.91:1 horizontal

  try {
    // Descargamos solo los primeros 128KB para extraer las dimensiones sin bajar la imagen completa
    const response = await fetch(imageUrl, {
      headers: { Range: 'bytes=0-131071' },
    });

    if (!response.ok) {
      return `No se pudo acceder a la imagen (HTTP ${response.status}). Verifica que la URL sea pública y accesible.`;
    }

    const buffer = await response.buffer();

    // Leer dimensiones desde los bytes del encabezado JPEG/PNG sin librerías extra
    let width = 0;
    let height = 0;

    const bytes = new Uint8Array(buffer);

    // JPEG: buscar marcadores SOF0 (0xFF 0xC0) o SOF2 (0xFF 0xC2)
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      let i = 2;
      while (i < bytes.length - 8) {
        if (bytes[i] !== 0xFF) break;
        const marker = bytes[i + 1];
        if (marker === 0xC0 || marker === 0xC2) {
          height = (bytes[i + 5] << 8) | bytes[i + 6];
          width  = (bytes[i + 7] << 8) | bytes[i + 8];
          break;
        }
        const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
        i += 2 + segLen;
      }
    }

    // PNG: ancho en bytes 16-19, alto en bytes 20-23
    if (bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      width  = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
      height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
    }

    if (!width || !height) {
      // No pudimos leer las dimensiones: dejamos pasar (Make reportará el error si lo hay)
      await logDebug(`⚠️ [AspectRatio] No se pudieron leer las dimensiones de: ${imageUrl}. Se omite la validación.`, 'WARNING');
      return null;
    }

    const ratio = width / height;

    if (ratio < INSTAGRAM_RATIO_MIN || ratio > INSTAGRAM_RATIO_MAX) {
      return `Instagram Error 36003: El aspect ratio de la imagen es ${ratio.toFixed(2)} (${width}x${height}px), fuera del rango permitido [0.8 (4:5) – 1.91 (1.91:1)]. Cambia o recorta la imagen antes de reprogramar este post.`;
    }

    await logDebug(`✅ [AspectRatio] Imagen válida para Instagram: ratio ${ratio.toFixed(2)} (${width}x${height}px)`);
    return null;

  } catch (err: any) {
    await logDebug(`⚠️ [AspectRatio] Error al validar la imagen ${imageUrl}: ${err.message}. Se omite la validación.`, 'WARNING');
    return null; // Si no podemos validar, dejamos pasar (fail-open) — Make reportará si hay error
  }
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
    // Solo loggear si realmente estamos en modo debug o producción
    if (process.env.NODE_ENV === 'production' || process.env.DEBUG_SCHEDULER) {
      await logDebug('😴 [Scheduler] No hay posts para publicar en este momento.', 'INFO');
    }
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
      
      // NUEVO: Autocorrección de ratio para Instagram si se solicitó vía metadata
      const metadata = post.metadata || {};
      const requestedFormat = (metadata as any)?.instagram_format;
      
      if (requestedFormat && post.platforms?.includes('instagram')) {
        const primaryImage = post.media_url;
        if (primaryImage && typeof primaryImage === 'string') {
           try {
             await logDebug(`🛠️ [Scheduler] Aplicando autocorrección ${requestedFormat} para post ${post.id}`);
             
             // La utilidad procesa la imagen y devuelve un Buffer
             const processedBuffer = await processImageFromUrl(primaryImage, requestedFormat as '1:1' | '4:5');
             const fileName = `corrected_${post.id}_${Date.now()}.jpg`;
             
             // La subimos a Supabase
             const newUrl = await uploadToSupabase(processedBuffer, fileName);
             
             // Actualizar el objeto local para que el resto del flujo use la nueva URL
             post.media_url = newUrl;
             if (post.media_urls && Array.isArray(post.media_urls)) {
               post.media_urls = post.media_urls.map((u: string) => u === primaryImage ? newUrl : u);
             }
             
             // Actualizar la DB para persistir el cambio
             await supabaseAdmin
               .from('social_posts')
               .update({ 
                 media_url: newUrl,
                 media_urls: post.media_urls 
               })
               .eq('id', post.id);
               
             await logDebug(`✅ [Scheduler] Imagen corregida y subida: ${newUrl}`);
           } catch (err: any) {
             await logDebug(`⚠️ [Scheduler] Falló la autocorrección: ${err.message}`, 'WARNING');
           }
        }
      }

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
      const isCarousel = mediaUrls.filter(m => m.is_image).length > 1;
      const postMediaCategory = isVideoPost ? 'video' : (isCarousel ? 'carousel' : (hasImage ? 'image' : 'link'));

      const payload = {
        api_secret: MAKE_WEBHOOK_SECRET,
        post_id: post.id,
        version: "v2-media-link-fixed-101", // Marca de versión para debug
        text: post.content_text,
        media_url: post.media_url || null,
        media_urls: mediaUrls,
        photo_urls: mediaUrls.filter(m => m.is_image).map(m => m.url),
        video_urls: mediaUrls.filter(m => m.is_video).map(m => m.url),
        facebook_photos: mediaUrls.filter(m => m.is_image).map(m => ({ 
          url: m.url, 
          source: m.url, 
          type: 'Photo',
          media_type: 'Photo'
        })),
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

      // PASO 3.5: Validación de Aspect Ratio para Instagram ANTES de gastar operaciones de Make
      // (Instagram Graph API Error 36003 — rango válido: 0.8 a 1.91)
      if (post.platforms?.includes('instagram')) {
        const imagesToCheck = mediaUrls.filter(m => m.is_image).map(m => m.url);
        for (const imgUrl of imagesToCheck) {
          const ratioError = await validateInstagramAspectRatio(imgUrl);
          if (ratioError) {
            await logDebug(`🚫 [Scheduler] Post ${post.id} bloqueado por ratio inválido: ${ratioError}`, 'ERROR');
            await supabaseAdmin
              .from('social_posts')
              .update({ status: 'failed', error_log: ratioError, updated_at: new Date().toISOString() })
              .eq('id', post.id);
            await notifyFailureViaWhatsApp(post.id, ratioError);
            continue; // Saltar este post, pasar al siguiente
          }
        }
      }

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
  const isPruebas = process.env.NODE_ENV === 'development'; // Solo en dev limpiamos agresivamente
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Si no es pruebas, solo limpiar a medianoche (00:00 a 00:10 por ejemplo)
  if (!isPruebas && (currentHour !== 0 || currentMinute > 10)) {
    return;
  }

  // En producción: Limpiamos posts de hace más de 7 días para auditoría.
  // En pruebas: Limpiamos posts de hace más de 1 hora.
  const offsetDays = isPruebas ? 0 : 7;
  const offsetMinutes = isPruebas ? 60 : 0;
  const cutoff = new Date(Date.now() - (offsetDays * 24 * 60 * 60 * 1000) - (offsetMinutes * 60 * 1000)).toISOString();

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
