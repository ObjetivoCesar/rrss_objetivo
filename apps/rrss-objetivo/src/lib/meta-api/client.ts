/**
 * Meta Graph API — Cliente Base
 *
 * Responsabilidades:
 * - Centralizar todas las llamadas a graph.facebook.com
 * - Manejar errores de Meta (códigos, subcódigos, mensajes)
 * - Rate limiting básico
 * - Logging consistente
 */

const META_API_VERSION = 'v19.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// ─── Tipos ────────────────────────────────────────────────

export interface MetaApiError {
  message: string;
  type: string;
  code: number;
  fbtrace_id: string;
}

export interface MetaApiResponse<T = any> {
  data?: T;
  error?: MetaApiError;
  id?: string;
}

// ─── Cliente ──────────────────────────────────────────────

export class MetaApiClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * GET a la Meta Graph API
   */
  async get<T = any>(path: string, params: Record<string, string> = {}): Promise<MetaApiResponse<T>> {
    const url = new URL(`${META_BASE_URL}${path}`);
    url.searchParams.set('access_token', this.accessToken);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString());
    const json = await response.json() as MetaApiResponse<T>;

    if (json.error) {
      throw new MetaPublisherError(json.error);
    }

    return json;
  }

  /**
   * POST a la Meta Graph API
   */
  async post<T = any>(path: string, body: Record<string, any>): Promise<MetaApiResponse<T>> {
    const url = `${META_BASE_URL}${path}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        access_token: this.accessToken,
      }),
    });

    const json = await response.json() as MetaApiResponse<T>;

    if (json.error) {
      throw new MetaPublisherError(json.error);
    }

    return json;
  }
}

// ─── Error tipado de Meta ─────────────────────────────────

export class MetaPublisherError extends Error {
  code: number;
  type: string;
  fbtrace_id: string;

  constructor(apiError: MetaApiError) {
    super(`Meta API Error ${apiError.code}: ${apiError.message}`);
    this.name = 'MetaPublisherError';
    this.code = apiError.code;
    this.type = apiError.type;
    this.fbtrace_id = apiError.fbtrace_id;
  }

  /**
   * Errores de token — requieren re-autorización
   */
  isAuthError(): boolean {
    return [190, 102, 2500].includes(this.code);
  }

  /**
   * Errores de rate limit — esperar y reintentar
   */
  isRateLimitError(): boolean {
    return [4, 17, 32, 613].includes(this.code);
  }

  /**
   * Errores de contenido — no reintentar (imagen inválida, texto prohibido, etc.)
   */
  isContentError(): boolean {
    return [36000, 36003, 36004, 100].includes(this.code);
  }
}

// ─── Helper: Obtener credenciales de Supabase ─────────────

import { supabaseAdmin } from '@/lib/supabase-admin';

export interface SocialAccount {
  page_id: string | null;
  ig_user_id: string | null;
  access_token: string;
}

/**
 * Obtiene las credenciales de una marca y plataforma desde Supabase.
 * Si no existen, lanza un error claro.
 */
export async function getSocialAccount(
  brandName: string,
  platform: 'facebook' | 'instagram'
): Promise<SocialAccount> {
  const { data, error } = await supabaseAdmin
    .from('brand_social_accounts')
    .select('page_id, ig_user_id, access_token')
    .eq('brand_name', brandName)
    .eq('platform', platform)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error(
      `No se encontraron credenciales activas para la marca "${brandName}" en la plataforma "${platform}". ` +
      `Ejecuta la migración 08_social_accounts.sql y completa los tokens en la tabla brand_social_accounts.`
    );
  }

  if (!data.access_token) {
    throw new Error(
      `La cuenta de "${brandName}" en "${platform}" no tiene access_token configurado. ` +
      `Añade un Page Access Token de larga duración en la tabla brand_social_accounts.`
    );
  }

  return data as SocialAccount;
}
