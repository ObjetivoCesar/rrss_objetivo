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
    const response = await fetch(imageUrl, {
      headers: { Range: 'bytes=0-131071' },
    });

    if (!response.ok) {
      return `No se pudo acceder a la imagen (HTTP ${response.status}). Verifica que la URL sea pública y accesible.`;
    }

    const buffer = await response.buffer();
    let width = 0;
    let height = 0;
    const bytes = new Uint8Array(buffer);

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

    if (bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      width  = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
      height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
    }

    if (!width || !height) {
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
    return null;
  }
}

async function notifyFailureViaWhatsApp(postId: string, errorMessage: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;
  const evolutionInstance = process.env.EVOLUTION_INSTANCE;
  const notifyPhone = process.env.EVOLUTION_NOTIFY_PHONE || process.env.NOTIFY_WHATSAPP_NUMBER;

  if (!evolutionUrl || !evolutionKey || !evolutionInstance || !notifyPhone) return;

  try {
    const message = `⚠️ *RRSS Scheduler*\n\nFalló un post después de ${MAX_RETRIES} intentos.\n\n*Post ID:* ${postId}\n*Error:* ${errorMessage.slice(0, 200)}\n\nRevisa el Dashboard → Publicaciones.`;
    await fetch(`${evolutionUrl}/message/sendText/${evolutionInstance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': evolutionKey },
      body: JSON.stringify({ number: notifyPhone, text: message }),
    });
    await logDebug(`📱 [Alert] Notificación WhatsApp enviada para post ${postId}`, 'INFO');
  } catch (err: any) {
    await logDebug(`⚠️ [Alert] No se pudo enviar alerta WhatsApp: ${err.message}`, 'WARNING');
  }
}

export async function processPendingPosts() {
  await logDebug('🕒 [Scheduler] Iniciando ciclo de publicación...');
  await recoverStuckPosts();

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

  if (!pendingPosts || pendingPosts.length === 0) return;

  for (const post of pendingPosts) {
    try {
      await logDebug(`📦 [Scheduler] Preparando post: ${post.id}`);

      const { error: updateError } = await supabaseAdmin
        .from('social_posts')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', post.id)
        .eq('status', 'pending');

      if (updateError) continue;

      const metadata = post.metadata || {};
      const requestedFormat = (metadata as any)?.instagram_format;
      
      if (requestedFormat && post.platforms?.includes('instagram')) {
        const primaryImage = post.media_url;
        if (primaryImage && typeof primaryImage === 'string') {
           try {
             const processedBuffer = await processImageFromUrl(primaryImage, requestedFormat as '1:1' | '4:5');
             const fileName = `corrected_${post.id}_${Date.now()}.jpg`;
             const newUrl = await uploadToSupabase(processedBuffer, fileName);
             post.media_url = newUrl;
             if (post.media_urls && Array.isArray(post.media_urls)) {
               post.media_urls = post.media_urls.map((u: string) => u === primaryImage ? newUrl : u);
             }
             await supabaseAdmin
               .from('social_posts')
               .update({ media_url: newUrl, media_urls: post.media_urls })
               .eq('id', post.id);
           } catch (err: any) {
             await logDebug(`⚠️ [Scheduler] Falló la autocorrección: ${err.message}`, 'WARNING');
           }
        }
      }

      const cleanedUrls = await realizeMediaUrls(post.media_urls || [], post.category_id || 'educativo');
      
      if (JSON.stringify(cleanedUrls) !== JSON.stringify(post.media_urls)) {
        await supabaseAdmin
          .from('social_posts')
          .update({ media_urls: cleanedUrls, media_url: cleanedUrls[0] || null })
          .eq('id', post.id);
      }

      const mediaUrls = Array.isArray(cleanedUrls)
        ? cleanedUrls
            .filter((url: string | null) => url && typeof url === 'string')
            .map((url: string) => {
              const lowerUrl = url.toLowerCase();
              const isVideo = lowerUrl.endsWith('.mp4');
              const isImage = lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.webp') || url.includes('image-proxy');
              return {
                media_type: isVideo ? 'VIDEO' : (isImage ? 'IMAGE' : 'LINK'),
                url,
                is_image: isImage,
                is_video: isVideo
              };
            })
        : [];

      const payload = {
        api_secret: MAKE_WEBHOOK_SECRET,
        post_id: post.id,
        text: post.content_text,
        media_urls: mediaUrls,
        platforms: post.platforms || [],
        metadata: {
          youtube_title: metadata.youtube_title || '',
          youtube_description: metadata.youtube_description || '',
        },
      };

      if (post.platforms?.includes('instagram')) {
        for (const m of mediaUrls.filter(m => m.is_image)) {
          const ratioError = await validateInstagramAspectRatio(m.url);
          if (ratioError) {
            await supabaseAdmin
              .from('social_posts')
              .update({ status: 'failed', error_log: ratioError, updated_at: new Date().toISOString() })
              .eq('id', post.id);
            await notifyFailureViaWhatsApp(post.id, ratioError);
            throw new Error(ratioError);
          }
        }
      }

      const success = await sendToMakeWithRetry(payload, post.id);

      if (success) {
        await supabaseAdmin
          .from('social_posts')
          .update({ status: 'published', updated_at: new Date().toISOString() })
          .eq('id', post.id);
        await logDebug(`✅ [Scheduler] Post ${post.id} publicado.`);
      } else {
        const errorMessage = `Agotó ${MAX_RETRIES} intentos de envío a Make.com`;
        await supabaseAdmin
          .from('social_posts')
          .update({ status: 'failed', error_log: errorMessage, updated_at: new Date().toISOString() })
          .eq('id', post.id);
        await notifyFailureViaWhatsApp(post.id, errorMessage);
      }
    } catch (err: any) {
      await logDebug(`💥 [Scheduler] Error en post ${post.id}: ${err.message}`, 'ERROR');
    }
  }

  await cleanupPublishedMedia();
}

async function cleanupPublishedMedia() {
  const isPruebas = process.env.NODE_ENV === 'development';
  const cutoff = new Date(Date.now() - (isPruebas ? 3600000 : 604800000)).toISOString();

  const { data: postsToCleanup } = await supabaseAdmin
    .from('social_posts')
    .select('id, media_urls')
    .eq('status', 'published')
    .lt('updated_at', cutoff)
    .not('media_urls', 'is', null);

  if (!postsToCleanup) return;

  for (const post of postsToCleanup) {
    if (post.media_urls && Array.isArray(post.media_urls)) {
      for (const url of post.media_urls) {
        if (url.includes('/storage/v1/object/public/')) {
          const fileName = url.split('/').pop();
          if (fileName) await deleteFromSupabase(fileName);
        }
      }
      await supabaseAdmin
        .from('social_posts')
        .update({ media_url: null, media_urls: [] })
        .eq('id', post.id);
    }
  }
}

export const processScheduledPosts = processPendingPosts;