import { NextResponse } from "next/server";
import { buildSystemPrompt, PLATFORM_PROMPTS, POST_TYPES } from "@/lib/ai/prompts";
import { getCarouselImageMasterPrompt, buildCarouselNarrative } from "@/lib/ai/carousel-protocol";
import { ImageStyle } from "@/lib/ai/images/styles";
import { rateLimit } from "@/lib/rate-limiter";

// Each item in mixItems represents one post to generate
export interface MixItem {
  categoryId: string;
  platform: string;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    if (!rateLimit.check(ip, 5, 60000)) {
      return NextResponse.json({ error: "Demasiadas peticiones. Intenta de nuevo en un minuto." }, { status: 429 });
    }

    const { message, targetMonth, topic, style, mixItems, objectiveContext, campaignStrategy, carouselSlides } = await req.json();
    const slideCount = typeof carouselSlides === 'number' && carouselSlides >= 2 ? carouselSlides : 6;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

    if (!apiKey) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY no configurada" }, { status: 500 });
    }

    if (!mixItems || !Array.isArray(mixItems) || mixItems.length === 0) {
      return NextResponse.json({ error: "No hay posts definidos en el mix" }, { status: 400 });
    }

    const visualStyle: ImageStyle = style;

    // Build the list of posts to generate with their platform context
    const postRequests = mixItems.map((item: MixItem, idx: number) => {
      const categoryDef = POST_TYPES.find(t => t.id === item.categoryId);
      const platformRule = PLATFORM_PROMPTS[item.platform] || PLATFORM_PROMPTS['instagram'];

      // For carousels: inject the full Carousel Engine 2026 Protocol of Gold
      // The narrative structure scales dynamically to the exact slide count chosen by the user.
      let categoryPrompt = categoryDef?.prompt || '';
      if (item.categoryId === 'carrusel') {
        categoryPrompt = buildCarouselNarrative(slideCount);
      }

      return `POST ${idx + 1}:
- Categoría: ${categoryDef?.name || item.categoryId}
- Instrucción de categoría: ${categoryPrompt}
- Plataforma objetivo: ${item.platform.toUpperCase()}
${platformRule}`;
    }).join("\n\n---\n\n");

    const systemPrompt = `
      ${buildSystemPrompt("Multiplataforma", parseInt(targetMonth as string) || 3, undefined, objectiveContext, campaignStrategy)}
      NICHO SELECCIONADO: ${topic || "Negocios Locales Ecuador"}
      ESTILO VISUAL SOLICITADO PARA IMÁGENES: ${visualStyle?.name || "Fotorealista"} (${visualStyle?.promptSuffix || "high quality, professional"})
      
      IMPORTANTE: SI EL ESTILO ES "Sin Imagen", NO GENERES UN imagePrompt descriptivo. En su lugar, devuelve un string vacío "" para "imagePrompt".

      INSTRUCCIÓN CRÍTICA — GENERACIÓN POR PLATAFORMA:
      Cada post tiene una plataforma asignada. Las reglas de esa plataforma SON INELUDIBLES.
      Un post de LinkedIn NO puede parecerse a uno de TikTok. No son intercambiables.
      El copy de cada plataforma debe sentirse nativo.

      ${mixItems.some((m: MixItem) => m.categoryId === 'carrusel') ? `
      REGLA MAESTRA DE IMAGEN PARA CARRUSEL (MOTOR MANUS):
      ${getCarouselImageMasterPrompt(slideCount, visualStyle?.promptSuffix || "high quality, professional photography, realistic lighting")}
      
      ATENCIÓN: Para los posts "carrusel", DEBES incluir una propiedad adicional "carouselSlides" dentro del JSON post.
      Cada slide de "carouselSlides" debe tener: "slideNumber", "copy" (breve guion o idea de esta lámina), y "imagePrompt".
      
      EL "imagePrompt" DE CADA LÁMINA DEL CARRUSEL DEBE ESTAR EN ESPAÑOL Y SEGUIR EXTRICTAMENTE ESTA ESTRUCTURA DE 4 LÍNEAS (SIN EXCEPCIONES):
      Metáfora Visual: [Describe la escena, iluminación y acción detallada de forma hiper-realista]
      Texto a incluir (Grande): "[Frase corta y de impacto]"
      Texto Secundario: "[Frase complementaria]"
      Regla Logo: [Dónde y cómo integrar el logo sutilmente en la escena]
      
      Además, el "content" principal del post carrusel DEBE ser EXTREMADAMENTE CORTO (máximo 3 o 4 líneas directas tipo teaser instigando a deslizar las láminas). ¡Prohibido hacer captions largos para los carruseles!
      ` : `
      REGLA DE IMAGEN (para TODOS los posts NO carrusel):
      Además del copy, redacta un PROMPT DE IMAGEN en INGLÉS súper descriptivo, ideal para Midjourney o Flux.
      - Describe LITERALMENTE la escena: sujetos, objetos, entorno, iluminación, sentimiento.
      - Máximo 4-5 oraciones.
      - FÍSICA REALISTA: personas que interactúan naturalmente con objetos.
      - BRANDING NATURAL: si integras el logo 'Objetivo', que sea como mockup.
      - Finaliza SIEMPRE con: ${visualStyle?.promptSuffix || "high quality, professional photography, realistic lighting"}.
      `}

      FORMATO DE SALIDA ESTRICTO (SOLO JSON ARRAY):
      Devuelve un array JSON puro. Sin markdown de código. Sin texto fuera del JSON.
      [
        {
          "platform": "instagram",
          "categoryId": "educativo",
          "content": "Para carruseles: SOLO 3 líneas cortas y directas (Teaser + CTA). Para otros: El copy completo...",
          "imagePrompt": "A highly detailed photography of... (solo si no es carrusel)",
          "carouselSlides": [
            {
              "slideNumber": 1,
              "copy": "Explicación interna de la lámina",
              "imagePrompt": "Metáfora Visual: ...\\nTexto a incluir (Grande): ...\\nTexto Secundario: ...\\nRegla Logo: ..."
            }
          ]
        }
      ]
    `;

    const userMessage = `IDEA CENTRAL: ${message}

POSTS A GENERAR (${mixItems.length} en total):
${postRequests}

Genera cada post con el copy y el imagePrompt. Devuelve SOLO el JSON array.`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.75,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("DeepSeek Error:", data);
      return NextResponse.json({ error: "Error en la API de DeepSeek", details: data }, { status: response.status });
    }

    const rawContent = data.choices[0].message.content;

    let jsonArray = [];
    try {
      const jsonStart = rawContent.indexOf('[');
      const jsonEnd = rawContent.lastIndexOf(']') + 1;
      if (jsonStart === -1 || jsonEnd === 0) throw new Error("No JSON array found");
      const jsonString = rawContent.substring(jsonStart, jsonEnd);
      jsonArray = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON array from DeepSeek output:", e, rawContent);
      return NextResponse.json({ error: "La IA no devolvió un formato JSON válido" }, { status: 500 });
    }

    return NextResponse.json({ posts: jsonArray });
  } catch (error) {
    console.error("API Error generate-bulk:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
