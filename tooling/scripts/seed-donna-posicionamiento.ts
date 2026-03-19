/**
 * seed-donna-posicionamiento.ts
 * 
 * Inyecta la Estrategia Maestra de Posicionamiento 2026 en la memoria
 * permanente de Donna AI (tabla: donna_memory en Supabase).
 *
 * Ejecutar: npx tsx tooling/scripts/seed-donna-posicionamiento.ts
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fcfsexddgupnvbvntgyz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTc5MDksImV4cCI6MjA3NjczMzkwOX0.lPj2Q984Mc62ZqEEWyVNZxMHNzpX_DeknFjSgVFGSb4";

const supabase = createClient(supabaseUrl, supabaseKey);

const memoryItems = [
  {
    topic: "🚨 REGLA MAESTRA: Identidad de Marca César Reyes 2026",
    content: `César Reyes Jaramillo es un ESTRATEGA DE NEGOCIOS Y SISTEMAS (no agencia, no freelancer) con 25 años de experiencia en Ecuador.
FRASE DE POSICIONAMIENTO INAMOVIBLE: "El estratega que elimina esas actividades repetitivas de las PYMES ecuatorianas para que vendan más sin trabajar más horas."
AVATAR: Dueños de negocio con facturación validada (médicos, abogados, ferreteros). NO son buscadores de tutoriales gratis.
ACTIVAQR: Es marca hermana independiente en activaqr.com. NO es un servicio de cesarreyesjaramillo.com. Se menciona como producto de entrada del ecosistema de marca.`,
    added_by: 'seed-script',
    is_active: true
  },
  {
    topic: "🏗️ REGLA MAESTRA: Arquitectura Web (Inamovible hasta Oct 2026)",
    content: `DOMINIO PRINCIPAL: cesarreyesjaramillo.com
LOS 3 HUBS DE SERVICIO (Landing Pages de venta):
  1. /posicionamiento → Visibilidad en Google y diagnóstico web
  2. /desarrollo-web → Sistemas de automatización y venta digital  
  3. /analisis-estrategico → Consultoría de alto valor (sin precio público)

LOS 3 SILOS DEL BLOG (Categorías fijas — NO crear nuevas por 180 días):
  1. /blog/marketing-para-pymes → Alimenta /posicionamiento y /analisis-estrategico
  2. /blog/automatizacion-de-ventas → Alimenta /desarrollo-web
  3. /blog/posicionamiento-en-google → Alimenta /posicionamiento/auditoria-seo-rediseno

REGLA DE URL: cesarreyesjaramillo.com/blog/[silo]/titulo-articulo (NUNCA plano /blog/titulo)`,
    added_by: 'seed-script',
    is_active: true
  },
  {
    topic: "📜 REGLA MAESTRA: Creación de contenido (Donna aplica SIEMPRE)",
    content: `REGLA 1: Un artículo = Una URL de destino. Todo artículo enlaza a UNA SOLA página de servicio.
REGLA 2: El primer párrafo nombra el dolor del cliente. El último párrafo ofrece la puerta de salida (con enlace al servicio).
REGLA 3: Títulos en lenguaje de la calle. El cliente busca "como salir en Google", no "posicionamiento orgánico local". SIN TÉRMINOS EN INGLÉS SIN TRADUCCIÓN.
REGLA 4: 80% explica el QUÉ y POR QUÉ (gratis). El CÓMO exacto en su caso es el servicio pagado.
REGLA 5: Cada artículo contiene enlace de retorno hacia su categoría Hub en el primer párrafo.
PROHIBIDO: Crear artículos sin asignarlos a un silo. Crear nuevas categorías. Mencionar a ActivaQR como servicio de cesarreyesjaramillo.com.`,
    added_by: 'seed-script',
    is_active: true
  },
  {
    topic: "🔗 ESTRATEGIA: Ecosistema de 2 dominios (César + ActivaQR)",
    content: `activaqr.com/blog → Posiciona artículos de producto físico: "tarjeta NFC Ecuador", "código QR negocios".
cesarreyesjaramillo.com/blog → Posiciona artículos de estrategia: "cómo verse profesional", "captar leads sin WhatsApp".
FLUJO DE TRÁFICO: Cliente busca "tarjeta digital" → Entra activaqr.com → Lee artículo → Ve enlace "estrategia completa" → Llega a cesarreyesjaramillo.com/analisis-estrategico.
ActivaQR es el captador de leads de $20 que alimenta el embudo de alto valor de la marca personal.`,
    added_by: 'seed-script',
    is_active: true
  }
];

async function seedPositioningMemory() {
  console.log("🚀 Inyectando Estrategia de Posicionamiento en la Memoria de Donna...\n");

  for (const item of memoryItems) {
    const { error } = await supabase.from('donna_memory').insert(item);
    if (error) {
      console.error(`❌ Error inyectando: "${item.topic}"`, error.message);
    } else {
      console.log(`✅ Inyectado: "${item.topic}"`);
    }
  }

  console.log("\n🎯 COMPLETADO. Donna ahora tiene la estrategia de posicionamiento 2026 en su memoria permanente.");
  console.log("📚 Para ver la estrategia completa, consultar:");
  console.log("   - docs/estrategia-posicionamiento/PLAN_MAESTRO_IMPLEMENTACION_2026.md");
  console.log("   - docs/estrategia-posicionamiento/matriz_maestra_donna_ai.md");
}

seedPositioningMemory();
