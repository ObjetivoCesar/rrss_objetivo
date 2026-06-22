/**
 * MiniMax Research — Motor de investigación limpia para Donna
 * 
 * Este módulo recibe queries crudas de MiniMax y las transforma en
 * materia prima estructurada para la bóveda de ganchos y las skills.
 * 
 * USO: import { research } from './minimax-research';
 *      const data = await research("tendencias negocios locales ecuador mayo 2026");
 */

import { minimaxSearch, type MinimaxSearchResponse, type MinimaxSearchResult } from "./minimax-client";

// ============================================================
// TIPOS PARA LA BÓVEDA DE GANCHOS
// ============================================================

export interface GanchoEstructurado {
  tipo: "confesion" | "contradiccion" | "golpe_directo" | "promesa_resultado" | "validacion_dolor";
  titular: string;
  gancho_original: string;
  fuente_url: string;
  fecha_extraccion: string;
  nicho: string;
  plataforma?: "youtube" | "instagram" | "tiktok" | "linkedin" | "facebook";
}

export interface ResearchResult {
  query_original: string;
  fecha: string;
  num_resultados: number;
  ganchos: GanchoEstructurado[];
  datos_mercado: string[];
  temas_relacionados: string[];
  raw_results: MinimaxSearchResponse;
}

// ============================================================
// MAPA DE TIPOS DE GANCHO (basado en tu investigación Hormozi+Vilma)
// ============================================================

const PATRONES_GANCHO = {
  confesion: [
    "how i", "lo que nadie dice", "la verdad que nadie dice",
    " esto es lo que", "what nobody tells", "el secreto de",
    "how I made", "lo que aprendí"
  ],
  contradiccion: [
    "you're wasting", "estás perdiendo", "por qué no",
    "el error de", "el problema no es", "everyone thinks",
    "creen que", "en realidad", "pero la verdad"
  ],
  golpe_directo: [
    "stop being", "deja de", "no deberías", "haz esto",
    "the problem with", "el problema con", "si haces esto",
    "stop doing", "nunca"
  ],
  promesa_resultado: [
    "in 7 days", "en 30 días", "sin effort", "resultados",
    "$100,000", "cómo ganar", "duplica", "x result",
    "recupera", "sin costo"
  ],
  validacion_dolor: [
    "i don't know what to do", "no sé qué hacer",
    "estoy frustrado", "is so hard", "it's exhausting",
    "me da igual", "no entiendo", "por qué a mí"
  ]
};

// ============================================================
// CLASIFICACIÓN DE GANCHO
// ============================================================

function clasificarGancho(titulo: string, descripcion: string): GanchoEstructurado["tipo"] | null {
  const texto = `${titulo} ${descripcion}`.toLowerCase();

  for (const [tipo, patrones] of Object.entries(PATRONES_GANCHO)) {
    for (const patron of patrones) {
      if (texto.includes(patron.toLowerCase())) {
        return tipo as GanchoEstructurado["tipo"];
      }
    }
  }

  return null; // No clasificado
}

// ============================================================
// DETERMINAR PLATAFORMA POR URL/CONTEXTO
// ============================================================

function detectarPlataforma(url: string, titulo: string): GanchoEstructurado["plataforma"] {
  const texto = `${url} ${titulo}`.toLowerCase();

  if (texto.includes("youtube.com") || texto.includes("youtu.be")) return "youtube";
  if (texto.includes("instagram.com") || texto.includes("instag")) return "instagram";
  if (texto.includes("tiktok.com") || texto.includes("vm.tiktok")) return "tiktok";
  if (texto.includes("linkedin.com")) return "linkedin";
  if (texto.includes("facebook.com")) return "facebook";

  return "youtube"; // default
}

// ============================================================
// FUNCIÓN PRINCIPAL DE INVESTIGACIÓN
// ============================================================

/**
 * Investiga un tema y retorna ganchos estructurados + datos de mercado.
 * Esta es la función que Donna调用 cuando necesita materia prima fresca.
 * 
 * @param query - Query de investigación (ej: "tendencias negocios locales ecuador mayo 2026")
 * @param numResultados - Cuántos resultados web buscar (default 10)
 * @returns ResearchResult con ganchos clasificados y datos extraídos
 */
export async function research(
  query: string,
  numResultados: number = 10
): Promise<ResearchResult> {
  console.log(`[MiniMax Research] 🔍 Investigando: "${query}"`);

  const fecha = new Date().toISOString().split("T")[0];

  try {
    // 1. Ejecutar búsqueda
    const rawResults = await minimaxSearch(query, numResultados);

    // 2. Procesar y clasificar ganchos
    const ganchos: GanchoEstructurado[] = [];
    const datos_mercado: string[] = [];
    const temas_relacionados: string[] = rawResults.related_searches || [];

    for (const result of rawResults.organic_results) {
      // Clasificar el tipo de gancho
      const tipoGancho = clasificarGancho(result.title, result.description || "");

      // Extraer datos de mercado (números, estadísticas, porcentajes)
      const tieneEstadistica = /[\d]+%|[\d]+k|[\d]+\.[\d]+%|\$\d+|mil|million|billion/i.test(
        `${result.title} ${result.description}`
      );

      if (tipoGancho) {
        ganchos.push({
          tipo: tipoGancho,
          titular: result.title,
          gancho_original: result.description || result.title,
          fuente_url: result.url,
          fecha_extraccion: fecha,
          nicho: query,
          plataforma: detectarPlataforma(result.url, result.title)
        });
      }

      if (tieneEstadistica && datos_mercado.length < 5) {
        // Limpiar y guardar dato de mercado
        const datoLimpio = `${result.title} — ${result.description || ""}`.substring(0, 200);
        if (!datos_mercado.includes(datoLimpio)) {
          datos_mercado.push(datoLimpio);
        }
      }
    }

    // 3. Construir resultado final
    const resultado: ResearchResult = {
      query_original: query,
      fecha,
      num_resultados: rawResults.organic_results.length,
      ganchos,
      datos_mercado,
      temas_relacionados,
      raw_results: rawResults
    };

    console.log(
      `[MiniMax Research] ✅ ${resultado.num_resultados} resultados, ` +
      `${ganchos.length} ganchos detectados, ${datos_mercado.length} datos extraídos`
    );

    return resultado;

  } catch (error) {
    console.error("[MiniMax Research] ❌ Error:", error);
    throw error;
  }
}

// ============================================================
// FUNCIONES AUXILIARES (Para uso específico de Donna)
// ============================================================

/**
 * Busca ganchos virales específicos para el nicho de César.
 * Se enfoca en el nicho de negocios locales Ecuador/Latinoamérica.
 */
export async function researchGanchosNegocioLocal(
  tema: string = "negocios locales"
): Promise<ResearchResult> {
  return research(`${tema} ecuador 2026 negocio local viral`, 10);
}

/**
 * Investiga qué está funcionando en un nicho específico para un tipo de contenido.
 */
export async function researchContenido(
  tipo: "post" | "reel" | "carousel",
  nicho: string
): Promise<ResearchResult> {
  const queries: Record<string, string> = {
    post: `contenido viral ${nicho} post redes sociales 2026`,
    reel: `reel viral ${nicho} instagram tiktok 2026 gancho`,
    carousel: `carrusel viral ${nicho} linkedin instagram 2026`
  };

  return research(queries[tipo] || queries.post, 10);
}

/**
 * Investiga a un creador de contenido específico para ingeniería inversa.
 * Retorna patrón de contenido, tipos de ganchos, frecuencia, etc.
 */
export async function researchCreador(
  nombreCreador: string
): Promise<ResearchResult> {
  return research(
    `${nombreCreador} contenido marca personal branding negocios 2026`,
    15
  );
}