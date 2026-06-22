/**
 * MetaPublisher — Orquestador Central de Publicación
 *
 * Este es el punto de entrada único que el scheduler llama.
 * Analiza el post de Supabase, detecta plataformas y tipo de media,
 * y delega a InstagramPublisher o FacebookPublisher.
 *
 * REEMPLAZA a sendToMakeWithRetry() en scheduler.ts.
 */

import { InstagramPublisher } from './instagram-publisher';
import { FacebookPublisher, FacebookPostType } from './facebook-publisher';

// ─── Tipos ────────────────────────────────────────────────

export interface PublishResult {
  success: boolean;
  platform: string;
  postId?: string;
  error?: string;
}

export interface PublishSummary {
  allSucceeded: boolean;
  results: PublishResult[];
  errorLog?: string;
}

// ─── Orquestador ──────────────────────────────────────────

export class MetaPublisher {
  /**
   * Procesa un post de la tabla social_posts y lo publica
   * en todas las plataformas de Meta que tenga configuradas.
   *
   * @param post - Registro completo de la tabla social_posts
   * @returns Resumen con éxito/fallo por plataforma
   */
  static async publish(post: any): Promise<PublishSummary> {
    const platforms: string[] = post.platforms || [];
    const results: PublishResult[] = [];

    // Detectar tipo de media desde la URL
    const mediaUrl = post.media_url as string | null;
    const isVideo = mediaUrl
      ? mediaUrl.toLowerCase().includes('.mp4') || 
        mediaUrl.toLowerCase().includes('/play/')
      : false;
    const isImage = mediaUrl
      ? mediaUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp)/) !== null ||
        mediaUrl.includes('image-proxy')
      : false;
    const isLink = !isVideo && !isImage && (post.link_url || post.video_url);

    // Calcular timestamp programado si aplica
    // scheduled_for está en UTC en Supabase
    let scheduledPublishTime: number | undefined;
    if (post.scheduled_for) {
      const scheduledDate = new Date(post.scheduled_for);
      const now = new Date();
      const diffMinutes = (scheduledDate.getTime() - now.getTime()) / 60000;

      // Solo usar programación nativa de Meta si es más de 10 min en el futuro
      if (diffMinutes >= 10) {
        scheduledPublishTime = Math.floor(scheduledDate.getTime() / 1000);
      }
    }

    // ─── Instagram ────────────────────────────────────────
    if (platforms.includes('instagram') && mediaUrl) {
      try {
        const igResult = await InstagramPublisher.publish({
          brandName: post.brand_name || 'objetivo',
          caption: post.content_text || '',
          mediaUrl,
          mediaType: isVideo ? 'REEL' : 'IMAGE',
          scheduledPublishTime,
          sourcePostId: post.id,
        });

        results.push({
          success: igResult.success,
          platform: 'instagram',
          postId: igResult.postId,
          error: igResult.error,
        });
      } catch (err: any) {
        results.push({
          success: false,
          platform: 'instagram',
          error: err.message,
        });
      }
    }

    // ─── Facebook ─────────────────────────────────────────
    if (platforms.includes('facebook')) {
      try {
        let postType: FacebookPostType = 'TEXT';
        if (isVideo) postType = 'VIDEO';
        else if (isImage) postType = 'IMAGE';
        else if (isLink) postType = 'LINK';

        const fbResult = await FacebookPublisher.publish({
          brandName: post.brand_name || 'objetivo',
          message: post.content_text || '',
          postType,
          mediaUrl: mediaUrl || undefined,
          linkUrl: post.link_url || post.video_url || undefined,
          scheduledPublishTime,
        });

        results.push({
          success: fbResult.success,
          platform: 'facebook',
          postId: fbResult.postId,
          error: fbResult.error,
        });
      } catch (err: any) {
        results.push({
          success: false,
          platform: 'facebook',
          error: err.message,
        });
      }
    }

    // ─── Calcular resultado global ─────────────────────────
    const allSucceeded = results.length > 0 && results.every(r => r.success);
    const failedResults = results.filter(r => !r.success);

    let errorLog: string | undefined;
    if (failedResults.length > 0) {
      errorLog = failedResults
        .map(r => `[${r.platform.toUpperCase()}] ${r.error}`)
        .join(' | ');
    }

    return { allSucceeded, results, errorLog };
  }
}
