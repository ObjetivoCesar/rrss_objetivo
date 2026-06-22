import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { cliente, sector, contexto, servicios } = await req.json();

    const prompt = `
      Eres el "Córtex Comercial" de César Reyes Jaramillo (Ingeniero de Eficiencia Humanista). 
      Tu misión es transformar datos técnicos en un "Plan de Modernización y Control" de alto impacto.

      CONTEXTO DEL CLIENTE:
      - Nombre/Empresa: ${cliente}
      - Sector: ${sector}
      - Problema a resolver: ${contexto}
      - Servicios clave: ${servicios?.join(', ') || 'Optimización Digital'}

      REGLAS DE ORO (DNA CÉSAR REYES):
      1. TONO SITUACIONAL: 
         - Si el cliente es una Cooperativa, Institución o Gran Empresa (ej: ${cliente}): TRATO FORMAL MÁXIMO (Usted). Usa "Señor Presidente", "Gerencia", "Impacto Institucional".
         - Si es marca personal o startup creativa: Tono profesional pero cercano (Tú).
         - PROHIBIDO: Mezclar "tú" y "usted". Elige uno basado en el cargo.
      2. ADN HUMANIZER:
         - Elimina toda la "paja" de IA: No uses "En el competitivo mercado de hoy", "Potencia tu marca", "Descubre un mundo de posibilidades".
         - Sé directo y agresivamente útil. Habla de "Control", "Evidencia Técnica", "Eliminar la Invisibilidad", "Blindaje Operativo".
         - Frase de cabecera opcional: "La tecnología de mañana, bajo el liderazgo de hoy".
      3. ESTRUCTURA ESTRATÉGICA (Obligatoria en 3 etapas):
         - Etapa 01: Alcance y Autoridad (Presencia digital, dejar de ser invisible).
         - Etapa 02: Control y Ejecución (Sistema de campo, QRs, trazabilidad, datos reales).
         - Etapa 03: Blindaje y Automatización (Alertas WhatsApp, Chatbots, Rentabilidad por Sponsors).

      SCHEMA JSON EXIGIDO (Validación Estricta):
      {
        "id": "slug-unico-basado-en-cliente-y-año",
        "portada": { 
          "etiqueta": "Plan de Modernización Tecnológica", 
          "titulo_principal": "Título de autoridad (Ej: Diseño y Ejecución del Sistema de Control)", 
          "titulo_destacado": "Usa <span> para resaltar el nombre del cliente", 
          "subtitulo": "Resumen potente de 1 frase", 
          "imagen_url": "URL_AQUÍ", 
          "preparado_para": "Nombre Completo y Cargo del Decisor", 
          "preparado_por": "Ing. César Augusto Reyes Jaramillo", 
          "fecha": "Mes Año" 
        },
        "introduccion": { "titulo": "Título de impacto (Ej: El crecimiento nace del control)", "parrafos": ["Párrafo orientado a la visión del líder", "Párrafo orientado al activo que factura"] },
        "etapas": [ { "numero": "01", "etiqueta_tiempo": "...", "nombre": "...", "eslogan": "...", "precio": "$...", "precio_subtitulo": "...", "descripcion": "...", "entregables": [], "nota_especial": "...", "detalles_pie": [] } ],
        "cierre": { "titulo": "...", "texto": "Resumen de por qué esto es una inversión y no un gasto", "frase_final": "Cierre potente con <span>" }
      }

      IMPORTANTE: Usa el campo 'imagen_url' para la URL de la imagen de fondo de la portada. No inventes la URL si no la tienes, pon "PENDIENTE_CARGA".
      SOLO devuelve el objeto JSON, sin markdown, listo para ser parseado.
    `;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: prompt,
    });

    return new Response(text, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error en generación IA:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
