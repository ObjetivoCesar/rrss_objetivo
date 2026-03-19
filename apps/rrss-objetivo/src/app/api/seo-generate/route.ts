import { z } from 'zod';
import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

function getAvailableKeys() {
  const keys = [
    process.env.GOOGLE_AI_API_KEY,
    process.env.GOOGLE_AI_API_KEY_2,
    process.env.GOOGLE_AI_API_KEY_3,
    process.env.GOOGLE_AI_API_KEY_4,
    process.env.GOOGLE_AI_API_KEY_5,
  ].filter(Boolean) as string[];

  if (keys.length === 0) throw new Error('No GOOGLE_AI_API_KEY configured');
  return keys;
}

// Randomizer para no empezar siempre por la misma key
function shuffleArray(array: string[]) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export async function POST(req: Request) {
  try {
    const { keyword, rawContext, analysis, humanExperience, wordCount } = await req.json();

    if (!keyword || !analysis) {
      return NextResponse.json({ error: 'Faltan datos de investigación para generar el artículo.' }, { status: 400 });
    }

    console.log(`[SEO Lab] Generando artículo SEO (JSON) para: "${keyword}" (Longitud: ${wordCount || 'Default'})...`);

    const promptText = `
Actúa como un redactor experto en SEO, posicionamiento orgánico y engagement B2B/B2C.

Tu objetivo principal es escribir el MEJOR artículo en internet sobre: "${keyword}".
IMPORTANTE: Inyecta la EXPERIENCIA HUMANA para cumplir con E-E-A-T.

--- DATOS ---
${rawContext ? `Contexto Crudo Top 5:\n${rawContext.substring(0, 10000)}\n\n` : ''}

Análisis Previo:
${JSON.stringify(analysis, null, 2)}

--- ✨ EXPERIENCIA HUMANA ---
"${humanExperience || 'Asume un tono de experto basado en los datos.'}"

--- CATEGORÍAS PERMITIDAS ---
Debes elegir EXACTAMENTE UNA de estas categorías: automatizacion, diseno-web, marketing-digital, asesoria, desarrollo-web, posicionamiento-marca.

--- INSTRUCCIONES DEL MARKDOWN ---
El campo "markdown" debe contener el artículo COMPLETO.
1. Empieza con un H1 SEO optimizado.
2. Contenido conversacional pero profesional.
3. LONGITUD: ${wordCount || 'Media (~1000 palabras)'}. Desarrolla cada sección.
`;

    const keys = shuffleArray(getAvailableKeys());
    let objectPayload = null;
    let lastError = null;

    for (const key of keys) {
      try {
        const gemini = createGoogleGenerativeAI({ apiKey: key });
        const { object } = await generateObject({
          model: gemini('gemini-2.5-flash'),
          schema: z.object({
            title: z.string().describe("Título SEO Optimizado (H1)"),
            category: z.enum(['automatizacion', 'diseno-web', 'marketing-digital', 'asesoria', 'desarrollo-web', 'posicionamiento-marca']).describe("Categoría permitida más afín al tema"),
            excerpt: z.string().describe("Resumen muy corto y persuasivo (1-2 oraciones)"),
            metaDescription: z.string().describe("Meta descripción SEO (máx. 155 caracteres)"),
            imagePrompt: z.string().describe("Sugerencia de prompt ultra-fotorrealista detallado (para Midjourney o Dall-E) que describa una imagen de portada ideal para este artículo"),
            markdown: z.string().describe("El contenido COMPLETO del artículo en Markdown, incluyendo el H1 al principio, h2, h3, listas, etc.")
          }),
          prompt: promptText,
        });

        objectPayload = object;
        console.log(`[SEO Lab] ✅ Artículo generado exitosamente usando API Key terminada en ...${key.slice(-4)}`);
        break; // Éxito! Salimos del loop.
      } catch (error: any) {
        console.warn(`[SEO Lab] ⚠️ API Key terminada en ...${key.slice(-4)} falló:`, error.message);
        lastError = error;
      }
    }

    if (!objectPayload) {
      throw new Error(`Todas las API keys fallaron. Último error: ${lastError?.message}`);
    }

    return NextResponse.json({
      success: true,
      articleData: objectPayload
    });

  } catch (error: any) {
    console.error('Error generando artículo SEO estructurado:', error);
    return NextResponse.json({ error: error.message || 'Error processing generation' }, { status: 500 });
  }
}

