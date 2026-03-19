import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { generateObject } from 'ai';
// ✅ Use createGoogleGenerativeAI to pass our custom GOOGLE_AI_API_KEY (not GOOGLE_GENERATIVE_AI_API_KEY)
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

// ✅ Top-level require so it doesn't shadow any import inside the function
const googlethis = require('googlethis');

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
    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Palabra clave requerida' }, { status: 400 });
    }

    // ── STEP 1: SERP — get top URLs via googlethis ──────────────────────────────
    let links: string[] = [];
    try {
      console.log(`[SEO Lab] Searching SERP for: "${keyword}"`);
      const searchResults = await googlethis.search(keyword, {
        page: 0,
        safe: false,
        parse_ads: false,
        additional_params: { hl: 'es' },
      });

      links = (searchResults.results as any[])
        .filter((r) => r.url && !r.url.includes('google.com') && !r.url.includes('youtube.com'))
        .map((r) => r.url as string)
        .slice(0, 5);

      console.log(`[SEO Lab] Found ${links.length} organic results:`, links);
    } catch (searchErr: any) {
      console.error('[SEO Lab] SERP search error:', searchErr.message);
    }

    // ── STEP 2: If SERP failed, gracefully degrade: analyze keyword directly ────
    // We won't 404 — we'll let Gemini synthesize based on keyword alone if needed
    let validContents: { url: string; title: string; text: string }[] = [];
    let combinedContent = '';

    if (links.length > 0) {
      const scrapedContents = await Promise.all(
        links.map(async (url) => {
          try {
            const res = await axios.get(url, {
              timeout: 10000,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                Accept:
                  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
              },
            });
            const $$ = cheerio.load(res.data);
            $$('script, style, nav, footer, header, aside, form, svg, iframe, .ads, #ads, noscript').remove();
            const title = $$('title').text() || $$('h1').first().text() || url;
            const text = $$('body').text().replace(/\s+/g, ' ').trim().substring(0, 12000);
            return { url, title, text };
          } catch (e: any) {
            console.warn(`[SEO Lab] Could not scrape ${url}: ${e.message}`);
            return null;
          }
        })
      );

      validContents = scrapedContents.filter((c): c is NonNullable<typeof c> => c !== null);
      combinedContent = validContents
        .map((c, i) => `--- ARTÍCULO ${i + 1}: ${c.title} (${c.url}) ---\n${c.text}`)
        .join('\n\n');
    }

    const hasContent = validContents.length > 0;
    console.log(`[SEO Lab] Scraped content from ${validContents.length} pages. Proceeding to Gemini analysis...`);

    // ── STEP 3: Gemini 2.5 Flash structured analysis ─────────────────────────────
    const analysisPrompt = hasContent
      ? `Analiza los siguientes artículos posicionados en Google para la palabra clave: "${keyword}".\n\n${combinedContent}`
      : `No se pudieron obtener artículos del SERP. Analiza la palabra clave "${keyword}" como un experto SEO para generar un brief igualmente útil.`;

    const geminiSchema = z.object({
      patterns: z.object({
        commonThemes: z.array(z.string()),
        keyConcepts: z.array(z.string()),
        dominantAngle: z.string(),
        structureFormat: z.string(),
      }),
      searchIntent: z.object({
        primaryIntent: z.string(),
        userProblem: z.string(),
        journeyStage: z.enum(['Conciencia', 'Consideración', 'Decisión']),
        explanation: z.string(),
      }),
      contentGaps: z.object({
        missingTopics: z.array(z.string()),
        unansweredQuestions: z.array(z.string()),
        opportunities: z.array(z.string()),
      }),
      seoClusterBrief: z.object({
        suggestedPillarTitle: z.string(),
        suggestedSatelliteTopics: z
          .array(z.string())
          .describe('Tópicos para artículos satélite basados en el clustering temático.'),
      }),
    });

    const keys = shuffleArray(getAvailableKeys());
    let analysisPayload = null;
    let lastError = null;

    for (const key of keys) {
      try {
        const gemini = createGoogleGenerativeAI({ apiKey: key });
        const { object } = await generateObject({
          model: gemini('gemini-2.5-flash'),
          schema: geminiSchema,
          prompt: `Actúa como analista SEO avanzado y estratega de contenidos.\n\n${analysisPrompt}\n\nDevuelve patrones, intención de búsqueda, vacíos de contenido y cluster SEO recomendado.`,
        });

        analysisPayload = object;
        console.log(`[SEO Lab] ✅ Research generado exitosamente usando API Key terminada en ...${key.slice(-4)}`);
        break; // Éxito
      } catch (error: any) {
        console.warn(`[SEO Lab] ⚠️ API Key terminada en ...${key.slice(-4)} falló:`, error.message);
        lastError = error;
      }
    }

    if (!analysisPayload) {
      throw new Error(`Todas las API keys fallaron. Último error: ${lastError?.message}`);
    }

    return NextResponse.json({
      success: true,
      analyzedUrls: validContents.map((c) => c.url),
      hasScrapedContent: hasContent,
      analysis: analysisPayload,
      rawContext: combinedContent,
    });
  } catch (error: any) {
    console.error('[SEO Lab] Fatal error in /api/seo-research:', error);
    return NextResponse.json({ error: error.message || 'Error processing research' }, { status: 500 });
  }
}
