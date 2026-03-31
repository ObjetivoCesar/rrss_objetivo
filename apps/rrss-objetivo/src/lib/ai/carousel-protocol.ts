/**
 * CAROUSEL ENGINE 2026 — ARCHIVO MAESTRO (PROTOCOLO DE ORO)
 * ⚠️  ESTE ARCHIVO ES EL ESTÁNDAR DE ORO. MODIFICAR CON PRECAUCIÓN.
 * 
 * Este archivo centraliza la lógica de persuasión y diseño para carruseles,
 * asegurando que el "Director de Arte" de la skill se aplique consistentemente.
 */

/**
 * 🎨 EL PROMPT MAESTRO (LA MATRIZ)
 * Este bloque es INTOCABLE. Solo se reemplaza el número de láminas dinámicamente.
 */
export function getCarouselImageMasterPrompt(slideCount: number, visualStyleSuffix: string = "high-end corporate dark"): string {
  return `
Actúa como un Director de Arte de élite y Diseñador experto en carruseles corporativos.

Te estoy adjuntando el logotipo transparente (PNG) de la marca "Objetivo". Tu misión es generar una secuencia de ${slideCount} láminas de carrusel que funcionen como **un único documento visual**. Es CRÍTICO que la coherencia estética sea del 100% entre todas las imágenes.

### 🎨 REGLAS DE DISEÑO (ESTRICTAMENTE OBLIGATORIAS):
1. **Estilo Visual Inquebrantable**: Estética "High-End Corporate Dark". Fondos oscuros fluidos (azul medianoche a negro carbón) con sutiles destellos de luz volumétrica y líneas topográficas o de código.
2. **Coherencia Absoluta**: NO cambies la iluminación, el estilo de renderizado 3D (hiperrealista) ni el esquema de colores (Negro + Acentos Neón/Dorado/Azul) a lo largo de las ${slideCount} láminas.
3. **Branding Subliminal (Mockup)**: DEBES integrar el logotipo de "Objetivo" que te acabo de adjuntar de forma NATURAL y FOTORREALISTA en cada una de las ${slideCount} láminas. No lo pongas simplemente pegado en una esquina. Haz que parezca parte del escenario (grabado en cristal, reflejado en un smartphone, bordado, letrero de neón sutil).
4. **Tipografía y Legibilidad**: Usa siempre fuentes sans-serif gruesas y modernas. El texto debe ser EXTREMADAMENTE LEGIBLE, con alto contraste.
5. **Layout Consistente**: Todo slide debe tener espacio limpio (negative space) para superponer textos fácilmente. No satures los bordes.
6. **FORMATO Y RATIO (CRÍTICO)**: Las imágenes DEBEN generarse OBLIGATORIAMENTE en formato Retrato/Vertical (Aspect Ratio 4:5 o 9:16) o Cuadrado (1:1). ESTÁ ESTRICTAMENTE PROHIBIDO generar imágenes horizontales (Landscape 16:9). ¡Las publicaremos en Instagram/LinkedIn!

### ✍️ REGLAS DE TEXTO (CERO ALUCINACIONES Y CERO OMISIONES):
1. **NO ME ENTREGUES IMÁGENES VACÍAS MUDAS**: Está ESTRICTAMENTE PROHIBIDO entregar las imágenes "vacías de texto" o usar la excusa de "dejar espacio negativo para añadir el texto luego". TU DEBER ES RENDERIZAR EL TEXTO DIRECTAMENTE SOBRE LAS IMÁGENES.
2. DEBES renderizar el "Texto a incluir (Grande)" y el "Texto Secundario" indicados en CADA LÁMINA, encajándolos estéticamente.
3. No inventes texto adicional ni modifiques las frases. Renderiza los píxeles exactos de las palabras proporcionadas.

Estética final para la fusión gráfica: ${visualStyleSuffix}.
`.trim();
}

/**
 * ✍️ ESTRUCTURA NARRATIVA DINÁMICA
 * Define qué láminas se incluyen según el conteo solicitado.
 */
export function buildCarouselNarrative(slideCount: number): string {
  const allMiddleSteps = [
    {
      name: 'DOLOR (The Pain)',
      desc: 'Visualiza el problema sangrante que el cliente vive HOY. Sin solución visible aún. Hazlo sentir visto y comprendido.',
    },
    {
      name: 'AGITACIÓN (The Cost)',
      desc: 'Las consecuencias de NO actuar: dinero quemado, clientes perdiéndose, competencia avanzando. Crea urgencia real.',
    },
    {
      name: 'SOLUCIÓN (The Hero)',
      desc: 'Presenta el sistema/servicio ActivaQR como el héroe. Arquitectura visual del cambio. Introduce la propuesta de valor.',
    },
    {
      name: 'BENEFICIO 1 (Speed)',
      desc: 'Primer desglose del sistema. Rapidez de instalación, 30 segundos, ahorro de tiempo masivo.',
    },
    {
      name: 'BENEFICIO 2 (Retention)',
      desc: 'Core de la intervención. Muestra cómo vivir en la agenda del cliente aumenta la recomendación y recordación.',
    },
    {
      name: 'TRANSFORMACIÓN (The Future)',
      desc: 'La vida del negocio DESPUÉS. Escalabilidad, crecimiento, tranquilidad. Bóveda de oro.',
    },
  ];

  const middleCount = Math.max(0, slideCount - 2);
  const selectedMiddle = allMiddleSteps.slice(0, Math.min(middleCount, allMiddleSteps.length));

  const slideDefinitions = [
    `LÁMINA 1 — HOOK DISRUPTIVO:\n   Máx. 7 palabras. Ataca una creencia o dolor. Genera curiosidad INMEDIATA.\n   Metáfora visual impactante.`,
    ...selectedMiddle.map((s, i) => `LÁMINA ${i + 2} — ${s.name}:\n   ${s.desc}`),
    `LÁMINA ${slideCount} — CTA CLARO:\n   Instrucción de respuesta directa (Comenta, Link en Bio, WhatsApp).\n   Sin ambigüedad.`,
  ];

  return `═══ PROTOCOLO DE PERSUASIÓN PSICOLÓGICA ═══

Genera EXACTAMENTE ${slideCount} láminas siguiendo esta estructura:

${slideDefinitions.join('\n\n')}

REGLAS DE COPY:
- Hook y CTA: máx. 10 palabras.
- Láminas intermedias: 2-3 líneas máximo. Copy accionable y concreto.
- Voz activa. Cero clichés corporativos.
- Numera cada lámina como: "Lámina X:".`.trim();
}
