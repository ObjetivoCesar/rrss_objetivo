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

    const serpContext = rawContext ? `--- DATOS DE INVESTIGACIÓN ---\nContexto SERP (Top 5):\n${rawContext.substring(0, 10000)}\n\n` : '';
    const gapAnalysis = `Análisis de Brechas:\n${JSON.stringify(analysis, null, 2)}\n\n`;
    const expertExperience = `--- ✨ EXPERIENCIA HUMANA / STORYTELLING ---\n"${humanExperience || 'Usa un tono de experto pragmático basado en los datos.'}"\n\n`;

    const promptText = `
Actúa como un estratega de contenido y redactor experto en **Direct Response Copywriting**. 
Tu objetivo no es solo posicionar en Google, sino **convertir extraños en clientes** mediante autoridad y persuasión.

Tu meta: Escribir el artículo definitivo sobre: "${keyword}".

--- 🧬 ADN DE DONNA (PROTOCOLO ESTRATÉGICO) ---
1. **ESTRUCTURA P.A.S.A.B.**: 
   - **P**roblema: Identifica el punto de dolor real.
   - **A**gitación: Haz que sientan las consecuencias de no resolverlo.
   - **S**olución: Introduce el servicio/producto de forma natural.
   - **A**utoridad/Beneficios: Por qué tú/tu empresa. Qué ganan ellos.
   - **B**eneficio Final + CTA: Cierre fuerte con llamado a la acción.
2. **TONO**: Directo, provocador, experto. Cero relleno corporativo ("En el mundo actual...", "Desbloquea tu potencial...").
3. **E-E-A-T**: Usa la "Experiencia Humana" proporcionada para darle alma al texto.
4. **FORMATO VISUAL**: Intercala el texto con etiquetas de sugerencia: 
   - [SUGERENCIA_IMAGEN: Descripción del visual que apoye este punto]
   - [SUGERENCIA_VIDEO: Tema para un video explicativo o demostración aquí]
   (Aparecerán unas 2 o 3 veces por artículo).

--- 🎨 MOTOR VISUAL EXPERTO (ANÁLISIS DEL COMITÉ) ---
Para generar los campos de imagen (\`imagePrompt\`, \`imagePromptInternal1\`, \`imagePromptInternal2\`), NO inventes imágenes genéricas. Sigue este proceso para los 3 visuales:

1. PSICÓLOGO: ¿Cuál es el DOLOR INVISIBLE del artículo o del punto específico? No el error visible, sino la emoción oculta (miedo, incertidumbre, pérdida silenciosa). El lector debe sentirse entendido, no juzgado.
2. COPYWRITER: ¿Cuál es la SITUACIÓN COTIDIANA que encapsula ese dolor en 0.3 segundos? Usa escenas de la vida real que cualquier adulto reconozca instantáneamente.
3. CLOSER (SIN JUZGAR): La imagen debe mostrar el contraste entre el estado actual y el potencial perdido, sin buscar culpables.
4. DIRECTOR DE ARTE: 
   - Los colores los DICTA LA ESCENA (sin paletas fijas).
   - Incluye identidad ecuatoriana ORGÁNICA (calles locales, arquitectura, volcanes, gastronomía) solo si surge naturalmente de la situación.
   - El logotipo "Objetivo" debe aparecer como Mockup fotorrealista integrado (grabado, tallado, proyectado).
   - Máximo realismo cinematográfico. Sin lila/morado por defecto.

--- CATEGORÍAS (SILOS) PERMITIDAS ---
Debes elegir EXACTAMENTE UNA: marketing-para-pymes, automatizacion-de-ventas, posicionamiento-en-google, activaqr-gastronomia, activaqr-networking.

--- INSTRUCCIONES FORMALES ---
- Longitud: ${wordCount || 'Media (~1200 palabras)'}.
- Formato: Markdown limpio con H1, H2, H3.
- NO menciones que eres una IA.
- El artículo debe empezar directamente con el H1.
`;

    const keys = shuffleArray(getAvailableKeys());
    let objectPayload = null;
    let lastError = null;

    for (const key of keys) {
      try {
        const gemini = createGoogleGenerativeAI({ apiKey: key });
        const { object } = await generateObject({
          model: gemini('gemini-2.0-flash'),
          schema: z.object({
            title: z.string().describe("Título SEO Optimizado (H1)"),
            slug: z.string().describe("Slug corto optimizado para SEO (ej: 'agencia-marketing-quito'). Todo en minúsculas, solo usa letras y guiones, sin tildes ni caracteres especiales, máximo 2 a 4 palabras."),
            category: z.enum([
              'marketing-para-pymes', 
              'automatizacion-de-ventas', 
              'posicionamiento-en-google',
              'activaqr-gastronomia',
              'activaqr-networking'
            ]).describe("Categoría (Silo) oficial del sistema"),
            excerpt: z.string().describe("Resumen muy corto y persuasivo (1-2 oraciones)"),
            metaDescription: z.string().describe("Meta descripción SEO (máx. 155 caracteres)"),
            imagePrompt: z.string().describe("Prompt maestro para la IMAGEN DE PORTADA (16:9). Debe seguir la metodología de los 4 expertos y el protocolo de branding/identidad."),
            imagePromptInternal1: z.string().describe("Prompt para la primera imagen interna de apoyo (misma línea visual que la portada)."),
            imagePromptInternal2: z.string().describe("Prompt para la segunda imagen interna de apoyo (misma línea visual que la portada)."),
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

