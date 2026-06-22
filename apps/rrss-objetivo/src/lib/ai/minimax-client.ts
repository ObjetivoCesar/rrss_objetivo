/**
 * MiniMax Client — Wrapper para API de MiniMax (Token Plan)
 * Solo incluye búsqueda web (search). Otros módulos (image, video, speech, music) pendientes de upgrade.
 * 
 * Uso: import { minimaxSearch } from './minimax-client';
 *      const results = await minimaxSearch("query de búsqueda");
 */

import { ImageProvider } from "../types";

// ============================================================
// TIPOS COMPARTIDOS
// ============================================================

export interface MinimaxSearchResult {
  title: string;
  url: string;
  date?: string;
  description?: string;
}

export interface MinimaxSearchResponse {
  organic_results: MinimaxSearchResult[];
  related_searches?: string[];
  raw?: unknown;
}

// ============================================================
// CONFIGURACIÓN
// ============================================================

const MINIMAX_API_HOST = process.env.MINIMAX_API_HOST || "https://api.minimax.io";
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || process.env.NEXT_PUBLIC_MINIMAX_API_KEY;

// ============================================================
// FUNCIONES DE BAÚSQUEDA (Lo que podemos usar ahora mismo)
// ============================================================

/**
 * Búsqueda web programática usando MiniMax M2.7
 * Esta es la función que Donna usa para investigar en tiempo real.
 * 
 * @param query - Query de búsqueda
 * @param numResults - Número de resultados (default 10)
 * @returns Resultados estructurados
 */
export async function minimaxSearch(
  query: string,
  numResults: number = 10
): Promise<MinimaxSearchResponse> {
  if (!MINIMAX_API_KEY) {
    throw new Error("[MiniMax] API Key no configurada. Revisa MINIMAX_API_KEY en .env");
  }

  const url = `${MINIMAX_API_HOST}/v1/text/chatcompletion_pro`;

  const payload = {
    model: "MiniMax-M2.7",
    messages: [
      {
        role: "system",
        content: `Eres un investigador de mercado especializado en negocios locales latinoamericanos. Busca información precisa y returnsarla en formato JSON estructurado.`
      },
      {
        role: "user",
        content: `Busca en la web información sobre: "${query}". 
        
Devuelve SOLO un objeto JSON con esta estructura exacta, sin texto adicional:
{
  "organic_results": [
    {
      "title": "título del resultado",
      "url": "url completa",
      "date": "fecha de publicación si está disponible",
      "description": "breve descripción del contenido"
    }
  ],
  "related_searches": ["búsqueda relacionada 1", "búsqueda relacionada 2"]
}

Si no hay resultados, devuelve {"organic_results": [], "related_searches": []}.`
      }
    ],
    temperature: 0.3,
    max_tokens: 2000
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[MiniMax] Search error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parsear el JSON de la respuesta
    try {
      // El modelo a veces envuelve el JSON en backticks
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      return parsed as MinimaxSearchResponse;
    } catch {
      // Si no puede parsear, devolver estructura vacía
      console.warn("[MiniMax] No se pudo parsear la respuesta como JSON:", content.substring(0, 200));
      return { organic_results: [], related_searches: [] };
    }
  } catch (error) {
    console.error("[MiniMax] Error en search:", error);
    throw error;
  }
}

// ============================================================
// FUNCIONES PENDIENTES (Para cuando tengas Plus/Max)
// ============================================================

/**
 * @deprecated Pendiente de upgrade a plan Plus ($40/mes)
 * Generates images using MiniMax image-01 model.
 */
export async function minimaxImageGenerate(
  prompt: string,
  options: {
    aspectRatio?: "1:1" | "16:9" | "9:16";
    n?: number;
  } = {}
): Promise<string[]> {
  throw new Error(
    "[MiniMax] Image generation requires Plus plan ($40/mes). " +
    "Upgrade para activar: https://platform.minimax.io/subscribe/token-plan"
  );
}

/**
 * @deprecated Pendiente de upgrade a plan Plus ($40/mes)
 * Generates speech/audio using MiniMax Speech 2.8 model.
 */
export async function minimaxSpeechSynthesize(
  text: string,
  options: {
    voiceId?: string;
    speed?: number;
  } = {}
): Promise<Buffer> {
  throw new Error(
    "[MiniMax] Speech synthesis requires Plus plan ($40/mes). " +
    "Upgrade para activar: https://platform.minimax.io/subscribe/token-plan"
  );
}

/**
 * @deprecated Pendiente de upgrade a plan Max ($100/mes)
 * Generates video using MiniMax Hailuo 2.3 model.
 */
export async function minimaxVideoGenerate(
  prompt: string,
  options: {
    duration?: 6;
    resolution?: "768P" | "1080P";
  } = {}
): Promise<{ taskId: string }> {
  throw new Error(
    "[MiniMax] Video generation requires Max plan ($100/mes). " +
    "Upgrade para activar: https://platform.minimax.io/subscribe/token-plan"
  );
}

/**
 * @deprecated Disponible en todos los planes (100 songs/día, ≤5min each)
 * Generates music using MiniMax Music 2.6 model.
 */
export async function minimaxMusicGenerate(
  prompt: string,
  options: {
    lyrics?: string;
    instrumental?: boolean;
  } = {}
): Promise<string> {
  throw new Error(
    "[MiniMax] Music generation - CLI no disponible aún en este wrapper. " +
    "Usa: npx mmx music generate --prompt \"...\""
  );
}

// ============================================================
// PLACEHOLDER para ImageProvider (compatibilidad con arquitectura)
// ============================================================

export class MiniMaxProvider implements ImageProvider {
  name = "minimax";

  async generate(prompt: string): Promise<Buffer> {
    // Por ahora solo un placeholder que falla indicando que está pendiente
    throw new Error(
      "[MiniMax] Image generation pending. Upgrade to Plus plan ($40/mes)"
    );
  }
}