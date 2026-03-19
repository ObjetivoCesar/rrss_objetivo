/**
 * Sistema de Lentes Expertos — Extraído del expert-lens-pipeline
 * Cada lente representa un experto especializado que audita y refina
 * el contenido generado por Donna desde un ángulo específico.
 */

export type LensId =
  | 'lens_clarity'
  | 'lens_neuro'
  | 'lens_ad_copy'
  | 'lens_pricing'
  | 'lens_closer'
  | 'lens_seo'
  | 'lens_content';

export interface Lens {
  id: LensId;
  name: string;
  emoji: string;
  description: string;
  systemAddition: string; // Instrucción extra que se añade al system prompt al aplicar este lente
}

export const LENSES: Lens[] = [
  {
    id: 'lens_clarity',
    name: 'Claridad',
    emoji: '🧒',
    description: 'Simplifica el mensaje para que un niño de 10 años lo entienda. Sin fricción.',
    systemAddition: `
      Eres ahora el Lente de Claridad. Tu tarea es reescribir el copy para que:
      - Un niño de 10 años lo entienda sin dificultad.
      - No haya jerga técnica sin explicación.
      - Cada oración tenga un solo propósito.
      - El gancho de apertura sea irresistible en 3 segundos.
    `,
  },
  {
    id: 'lens_neuro',
    name: 'Neuroventas',
    emoji: '🧠',
    description: 'Activa triggers emocionales de dolor/placer para aumentar la persuasión.',
    systemAddition: `
      Eres ahora el Lente de Neuroventas. Tu tarea es:
      - Identificar el dolor principal del nicho y amplificarlo.
      - Convertir el beneficio en imágenes mentales específicas (visuales, no abstractas).
      - Usar el sesgo de pérdida: "Si no haces esto, pierdes X" vs "Si haces esto, ganas X".
      - El placer al final, el dolor al inicio.
    `,
  },
  {
    id: 'lens_ad_copy',
    name: 'Ad-Copywriter',
    emoji: '✍️',
    description: 'Crea hooks irresistibles que detienen el scroll en los primeros 3 segundos.',
    systemAddition: `
      Eres ahora el Lente de Ad-Copywriter. Tu tarea es:
      - Reescribir la primera línea del post para ser un "pattern interrupt" absoluto.
      - Aplicar la fórmula: PROBLEMA SPECIFIC + PREGUNTA RETÓRICA + PROMESA BOLD.
      - El CTA (llamado a la acción) debe ser uno solo y muy específico.
      - Remover todo lo que no sea esencial para la conversión.
    `,
  },
  {
    id: 'lens_pricing',
    name: 'Estratega de Precios',
    emoji: '💰',
    description: 'Compara el valor de ActivaQR vs el costo de perder clientes.',
    systemAddition: `
      Eres ahora el Lente de Estrategia de Precios. Tu tarea es:
      - Incluir una comparación de valor: ¿cuánto cuesta perder UN cliente vs $20/año?
      - Usar anclaje de precios: precio de referencia más alto antes de revelar el precio real.
      - Mencionar el ROI de manera concreta (sin inventar números, usando el sentido común del lector).
      - El precio es barato, el costo de NO tenerlo es caro.
    `,
  },
  {
    id: 'lens_closer',
    name: 'El Closer',
    emoji: '🤝',
    description: 'Diseña un cierre poderoso que mueve a la acción inmediata.',
    systemAddition: `
      Eres ahora el Lente del Closer. Tu tarea es:
      - Hacer que el CTA sea casi imposible de ignorar.
      - Añadir un elemento de urgencia o escasez genuina (no falsa).
      - El lector debe saber EXACTAMENTE qué hacer en los próximos 60 segundos.
      - El cierre debe resolver la última objeción implícita del lector.
    `,
  },
  {
    id: 'lens_seo',
    name: 'Auditor SEO',
    emoji: '🔍',
    description: 'Optimiza keywords y presencia de marca para visibilidad orgánica.',
    systemAddition: `
      Eres ahora el Lente SEO & Branding. Tu tarea es:
      - Incluir 1-2 keywords de alto volumen de forma natural (no forzada).
      - Asegurarte de que el nombre "ActivaQR" aparezca al menos una vez.
      - Los hashtags deben ser estratégicos: 1 niche, 1 community, 1 product.
      - El texto debe ser "quotable" — una frase memorable que la gente guarde.
    `,
  },
  {
    id: 'lens_content',
    name: 'Estratega de Contenido',
    emoji: '📱',
    description: 'Hace el contenido altamente compartible y memorable.',
    systemAddition: `
      Eres ahora el Lente de Estrategia de Contenido. Tu tarea es:
      - Hacer que el contenido sea "share-worthy": alguien lo enviaría a un amigo?
      - Añadir un elemento sorpresa o dato contraintuitivo que genere comentarios.
      - El post debe invitar a la conversación (pregunta al final, encuesta, o "etiqueta a alguien").
      - El formato debe ser escaneable: emojis como bullets o separadores visuales.
    `,
  },
];

/**
 * Construye el system prompt adicional al aplicar uno o más lentes
 */
export function applyLenses(baseSysPrompt: string, lensIds: LensId[]): string {
  const lensInstructions = lensIds
    .map(id => LENSES.find(l => l.id === id))
    .filter(Boolean)
    .map(l => l!.systemAddition)
    .join('\n\n---\n\n');

  return `${baseSysPrompt}\n\n## LENTES EXPERTOS ACTIVOS:\n${lensInstructions}`;
}
