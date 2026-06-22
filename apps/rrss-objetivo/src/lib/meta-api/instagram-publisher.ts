/**
 * Instagram Publisher — Motor de Publicación Directa
 *
 * Implementa el flujo de 2 pasos de la Instagram Graph API:
 *   1. Crear un Contenedor (media container)
 *   2. Publicar el Contenedor (media_publish)
 *
 * Para videos (Reels), el paso intermedio de polling verifica
 * que Meta haya procesado el video antes de publicar.
 *
 * Documentación de referencia:
 * https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 */

import { MetaApiClient, MetaPublisherError, getSocialAccount } from './client';

// ─── Tipos ────────────────────────────────────────────────

export interface InstagramPublishOptions {
  brandName: string;              // 'cesar-reyes' | 'objetivo' | 'activaqr'
  caption: string;                // Texto del post (max 2200 chars)
  mediaUrl: string;               // URL pública del video o imagen (BunnyNet)
  mediaType: 'IMAGE' | 'REEL';    // Tipo de contenido
  scheduledPublishTime?: number;  // Unix timestamp (opcional para programar)
  thumbOffset?: number;           // Offset en ms para thumbnail del Reel
  sourcePostId?: string;          // ID del post en Supabase para QStash
}

export interface InstagramPublishResult {
  success: boolean;
  postId?: string;                // IG Media ID del post publicado
  containerId?: string;           // Para debug
  error?: string;
}

// ─── Constantes ───────────────────────────────────────────

const MAX_POLLING_ATTEMPTS = 15;   // 15 intentos × 5s = 75s máximo de espera
const POLLING_INTERVAL_MS  = 5000; // 5 segundos entre cada check

// ─── Publisher ────────────────────────────────────────────

export class InstagramPublisher {
  /**
   * Punto de entrada principal.
   * Detecta el tipo de media y usa el flujo correcto.
   */
  static async publish(options: InstagramPublishOptions): Promise<InstagramPublishResult> {
    const { brandName, mediaType } = options;

    // Obtener credenciales de Supabase
    const account = await getSocialAccount(brandName, 'instagram');
    const client = new MetaApiClient(account.access_token);
    const igUserId = account.ig_user_id!;

    if (!igUserId) {
      return {
        success: false,
        error: `No hay Instagram User ID configurado para la marca "${brandName}".`,
      };
    }

    if (mediaType === 'REEL') {
      return this.publishReel(client, igUserId, options);
    } else {
      return this.publishImage(client, igUserId, options);
    }
  }

  // ─── Flujo de Imagen ──────────────────────────────────

  private static async publishImage(
    client: MetaApiClient,
    igUserId: string,
    options: InstagramPublishOptions
  ): Promise<InstagramPublishResult> {
    const { caption, mediaUrl, scheduledPublishTime } = options;

    // Paso 1: Crear contenedor de imagen
    const containerBody: Record<string, any> = {
      image_url: mediaUrl,
      caption,
    };

    if (scheduledPublishTime) {
      // La API requiere un mínimo de 10 min y máximo de 75 días
      containerBody.scheduled_publish_time = scheduledPublishTime;
      containerBody.published = false;
    }

    const { id: containerId } = await client.post(`/${igUserId}/media`, containerBody);

    if (!containerId) {
      return { success: false, error: 'Meta no devolvió un container_id para la imagen.' };
    }

    // Paso 2: Publicar
    const { id: postId } = await client.post(`/${igUserId}/media_publish`, {
      creation_id: containerId,
    });

    return { success: true, postId, containerId };
  }

  // ─── Flujo de Reel (QStash - Opción A) ────────────────────

  private static async publishReel(
    client: MetaApiClient,
    igUserId: string,
    options: InstagramPublishOptions
  ): Promise<InstagramPublishResult> {
    const { caption, mediaUrl, scheduledPublishTime, thumbOffset } = options;

    // Paso 1: Crear contenedor del Reel (entrega la URL del video a Meta)
    const containerBody: Record<string, any> = {
      media_type: 'REELS',
      video_url: mediaUrl,
      caption,
      share_to_feed: true, // Aparece también en el feed principal
    };

    if (thumbOffset !== undefined) {
      containerBody.thumb_offset = thumbOffset;
    }

    if (scheduledPublishTime) {
      containerBody.scheduled_publish_time = scheduledPublishTime;
      containerBody.published = false;
    }

    const { id: containerId } = await client.post(`/${igUserId}/media`, containerBody);

    if (!containerId) {
      return { success: false, error: 'Meta no devolvió un container_id para el Reel.' };
    }

    // Paso 2: Enviar a QStash para que gestione el segundo paso asíncrono
    const qstashToken = process.env.QSTASH_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tu-dominio.com';

    if (!qstashToken) {
      console.warn('⚠️ No se encontró QSTASH_TOKEN. Haciendo fallback a publicación inmediata (puede fallar si Meta no procesó rápido).');
      // Fallback síncrono muy simple
      try {
        await new Promise(r => setTimeout(r, 10000)); // Esperar 10s
        const { id: postId } = await client.post(`/${igUserId}/media_publish`, { creation_id: containerId });
        return { success: true, postId, containerId };
      } catch (err: any) {
        return { success: false, containerId, error: err.message };
      }
    }

    // Publicar en QStash con 60 segundos de retraso
    try {
      const qstashRes = await fetch(`https://qstash.upstash.io/v2/publish/${appUrl}/api/qstash/instagram`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${qstashToken}`,
          'Content-Type': 'application/json',
          'Upstash-Delay': '60s'
        },
        body: JSON.stringify({
          containerId,
          igUserId,
          brandName: options.brandName,
          sourcePostId: options.sourcePostId
        })
      });

      if (!qstashRes.ok) {
        throw new Error(`Error de QStash: ${await qstashRes.text()}`);
      }

      // Retornamos success true indicando que está EN PROCESO
      return { 
        success: true, 
        containerId, 
        postId: 'pending_qstash', 
        error: 'Video subido. QStash publicará en 60s.' 
      };
    } catch (error: any) {
      return { success: false, containerId, error: `Fallo al encolar en QStash: ${error.message}` };
    }
  }
}
