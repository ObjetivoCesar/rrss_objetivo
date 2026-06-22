/**
 * Facebook Publisher — Motor de Publicación Directa
 *
 * Cubre los casos de uso de publicación en páginas de Facebook:
 *   - Foto individual
 *   - Video (Reel de Facebook)
 *   - Post de texto puro
 *   - Post con link (article preview)
 *
 * Documentación de referencia:
 * https://developers.facebook.com/docs/pages/publishing
 */

import { MetaApiClient, getSocialAccount } from './client';

// ─── Tipos ────────────────────────────────────────────────

export type FacebookPostType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK';

export interface FacebookPublishOptions {
  brandName: string;
  message: string;
  postType: FacebookPostType;
  mediaUrl?: string;         // URL del video o imagen (BunnyNet)
  linkUrl?: string;          // Para posts de tipo LINK (artículo, YouTube)
  scheduledPublishTime?: number; // Unix timestamp para programar
}

export interface FacebookPublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

// ─── Publisher ────────────────────────────────────────────

export class FacebookPublisher {
  /**
   * Punto de entrada principal.
   */
  static async publish(options: FacebookPublishOptions): Promise<FacebookPublishResult> {
    const { brandName, postType } = options;

    // Obtener credenciales de Supabase
    const account = await getSocialAccount(brandName, 'facebook');
    const client = new MetaApiClient(account.access_token);
    const pageId = account.page_id!;

    if (!pageId) {
      return {
        success: false,
        error: `No hay Facebook Page ID configurado para la marca "${brandName}".`,
      };
    }

    switch (postType) {
      case 'IMAGE':
        return this.publishPhoto(client, pageId, options);
      case 'VIDEO':
        return this.publishVideo(client, pageId, options);
      case 'LINK':
        return this.publishLink(client, pageId, options);
      case 'TEXT':
      default:
        return this.publishText(client, pageId, options);
    }
  }

  // ─── Post de Texto ────────────────────────────────────

  private static async publishText(
    client: MetaApiClient,
    pageId: string,
    options: FacebookPublishOptions
  ): Promise<FacebookPublishResult> {
    const body: Record<string, any> = {
      message: options.message,
    };

    if (options.scheduledPublishTime) {
      body.scheduled_publish_time = options.scheduledPublishTime;
      body.published = false;
    }

    const result = await client.post(`/${pageId}/feed`, body);
    return { success: true, postId: result.id };
  }

  // ─── Post con Link ────────────────────────────────────

  private static async publishLink(
    client: MetaApiClient,
    pageId: string,
    options: FacebookPublishOptions
  ): Promise<FacebookPublishResult> {
    const body: Record<string, any> = {
      message: options.message,
      link: options.linkUrl,
    };

    if (options.scheduledPublishTime) {
      body.scheduled_publish_time = options.scheduledPublishTime;
      body.published = false;
    }

    const result = await client.post(`/${pageId}/feed`, body);
    return { success: true, postId: result.id };
  }

  // ─── Post de Foto ─────────────────────────────────────

  private static async publishPhoto(
    client: MetaApiClient,
    pageId: string,
    options: FacebookPublishOptions
  ): Promise<FacebookPublishResult> {
    if (!options.mediaUrl) {
      return { success: false, error: 'Se requiere mediaUrl para publicar una foto en Facebook.' };
    }

    const body: Record<string, any> = {
      url: options.mediaUrl,
      caption: options.message,
    };

    if (options.scheduledPublishTime) {
      body.scheduled_publish_time = options.scheduledPublishTime;
      body.published = false;
    }

    const result = await client.post(`/${pageId}/photos`, body);
    return { success: true, postId: result.id };
  }

  // ─── Post de Video (Reel de Facebook) ────────────────

  /**
   * Facebook usa un endpoint diferente para videos.
   * El video se sube por URL (similar a Instagram).
   * Estado: META puede tardar en procesarlo — se marca como 'pending' en FB.
   */
  private static async publishVideo(
    client: MetaApiClient,
    pageId: string,
    options: FacebookPublishOptions
  ): Promise<FacebookPublishResult> {
    if (!options.mediaUrl) {
      return { success: false, error: 'Se requiere mediaUrl para publicar un video en Facebook.' };
    }

    const body: Record<string, any> = {
      file_url: options.mediaUrl,
      description: options.message,
      // Para Reels de Facebook
      video_state: 'PUBLISHED',
    };

    if (options.scheduledPublishTime) {
      body.scheduled_publish_time = options.scheduledPublishTime;
      body.video_state = 'SCHEDULED';
    }

    const result = await client.post(`/${pageId}/videos`, body);
    return { success: true, postId: result.id };
  }
}
