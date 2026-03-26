import fs from 'fs';
import { parse } from 'csv-parse/sync';

async function main() {
  const csvPath = 'BLOG_ESTRATEGICO_2026.csv';
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true, relax_quotes: true });

  const batch1Data = [
    {
      slug: 'ia-ecuador-casos-reales',
      FB: "🇪🇨 El futuro no es 'usar IA', es saber DÓNDE aplicarla para no perder dinero. Mira este caso real de cómo una empresa en Loja automatizó sus ventas. ¿Tú ya tienes un bot o sigues respondiendo manual?",
      TikTokHook: "La IA en Ecuador no es ciencia ficción, es ahorro real. 🤖💰",
      Script: "Gancho: Lo que nadie te dice de la IA en Ecuador. [Corte a pantalla] Si sigues respondiendo mensajes uno a uno, estás perdiendo el 40% de tus ventas. Caso real: Una Pyme en Loja activó un puente de datos y hoy vende mientras el dueño duerme. No necesitas ser programador, solo necesitas una arquitectura de conversión. Lee la guía completa en mi blog.",
      Story: "Encuesta: ¿Cuánto tiempo al día pierdes respondiendo lo mismo por WhatsApp? > Sticker al Artículo IA."
    },
    {
      slug: 'error-marketing-familiar-pymes',
      FB: "⚠️ Alerta PYME: Delegar tus redes al 'sobrino' que sabe subir fotos es el error más costoso de 2026. El marketing no es visual, es ESTRUCTURAL. Lee por qué estás tirando tu presupuesto a la basura.",
      TikTokHook: "Tu sobrino NO sabe de marketing digital. 🛑",
      Script: "Gancho: El error que está quebrando a las Pymes en Ecuador. [Gesto de dinero volando] Dejar tu marca en manos de alguien 'porque usa mucho TikTok' es un suicidio comercial. Saber usar la app no es saber vender. Tu marketing necesita una base de datos, no solo likes. Te explico el porqué en mi último post.",
      Story: "Q&A: ¿Cuál es el mayor miedo de delegar tus redes sociales? > Respuesta con enlace al artículo."
    },
    {
      slug: 'guia-definitiva-seo-local',
      FB: "📍 Si no apareces en Google Maps cuando alguien busca 'tu servicio + tu ciudad', simplemente no existes para el cliente que tiene el dinero en la mano. Guía definitiva de SEO Local para Ecuador.",
      TikTokHook: "¿Eres invisible en tu propia ciudad? 📍🔍",
      Script: "Gancho: Cómo aparecer primero en Google sin pagar anuncios. [Mostrar Google Maps] El 80% de las ventas locales ocurren en el 'Local Pack' de Google. Si tu ficha está muerta, tus clientes se van a la competencia. Optimiza fotos, señales y keywords locas. Te doy el paso a paso en mi blog.",
      Story: "Slider: ¿Qué tan fácil es encontrar tu negocio en Google Maps hoy?"
    },
    {
      slug: 'crm-whatsapp-ia-ecuador',
      FB: "🚀 WhatsApp no es un chat, es tu máquina de cierre 24/7. Pero si no tienes un CRM con IA, eres esclavo de tu teléfono. Descubre cómo armar tu clon de ventas hoy mismo.",
      TikTokHook: "Deja de ser esclavo de tu WhatsApp. 🤖📱",
      Script: "Gancho: El secreto de las empresas que venden 24/7 sin quemar a su equipo. [Pantalla de chat fluyendo] Usar WhatsApp sin CRM es como correr un maratón con pesas. La IA puede calificar, responder y agendar por ti. No más leads perdidos por 'el síndrome de la madrugada'. Guía táctica en el link.",
      Story: "Poll: ¿Usas WhatsApp Business o el normal? > Sticker a la Guía CRM."
    },
    {
      slug: 'catalogos-digitales-ecommerce-2026',
      FB: "🗑️ Tira el catálogo en PDF a la basura. En 2026, el cliente quiere comprar en 3 clics, no descargar un archivo pesado. Pásate al e-commerce interactivo y observa cómo sube tu ticket promedio.",
      TikTokHook: "El PDF ha muerto. Vende de verdad. 📑❌",
      Script: "Gancho: Por qué tus clientes te dejan en visto cuando envías el catálogo. [Corte a PDF cargando lento] Nadie quiere descargar 20MB de fotos. Quieren elegir, pagar y listo. Los catálogos inteligentes con ActivaQR son el estándar actual. Aprende a convertir tu lista de precios en una caja registradora.",
      Story: "Imagen interactiva: ¿Prefieres PDF o una tienda rápida en WhatsApp?"
    }
  ];

  const headers = Object.keys(records[0]);
  let csvOutput = headers.join(',') + '\n';

  for (const row of records) {
    const match = batch1Data.find(b => b.slug === row.Slug);
    if (match) {
      row.Post_FB = match.FB;
      row.Hook_TikTok = match.TikTokHook;
      row.Script_Video = match.Script;
      row.Story_Idea = match.Story;
    }

    const line = headers.map(h => {
      let val = row[h] || '';
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
    csvOutput += line + '\n';
  }

  fs.writeFileSync(csvPath, csvOutput);
  console.log("🚀 Batch 1 de Rediseño Multinivel inyectado en el CSV.");
}

main().catch(console.error);
