import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const slug = 'cooperativa-podocarpus';
  console.log(`[Quoting Engine] Publicando ${slug}...`);

  const { data: row, error: fetchError } = await supabase.from('quote_drafts').select('*').eq('slug', slug).single();
  
  if (fetchError || !row) {
    console.error("❌ No se encontró el registro para publicar.");
    return;
  }

  const quoteData = {
    id: row.slug,
    portada: {
      etiqueta: row.portada_etiqueta || "Propuesta Comercial",
      titulo_principal: row.portada_titulo_bold || "",
      titulo_destacado: row.portada_titulo_acento || "",
      subtitulo: row.portada_subtitulo || "",
      preparado_para: row.portada_preparado_para || row.client_name,
      preparado_por: "Ing. César Augusto Reyes Jaramillo",
      fecha: row.portada_fecha || "Abril 2026",
      url_fondo: row.portada_url_banner || "",
      url_logo_cliente: row.portada_url_logo || ""
    },
    introduccion: {
      titulo: row.intro_titulo || "Transformando la visión en resultados.",
      parrafos: row.intro_parrafos || []
    },
    etapas: row.etapas || [],
    precio_total: row.precio_total || 0,
    cierre: {
      titulo: row.cierre_titulo_propuesta || "El Siguiente Paso",
      llamada_accion: row.cierre_llamada_accion || "",
      cta_texto: row.cierre_cta_texto || "Aprobar Propuesta",
      vigencia: row.cierre_vigencia || "15 días",
      forma_pago: row.cierre_forma_pago || "50/50",
      tiempo_ejecucion: row.cierre_tiempo_ejecucion || "N/A",
      frase_final: row.cierre_pie_texto || "Construyamos el futuro."
    }
  };

  console.log("📤 Enviando datos al sitio web...");
  
  // Usar el webhook directamente para asegurar el disparo
  const webhookUrl = process.env.WEBHOOK_SITE_URL || 'https://cesarreyesjaramillo.com/api/webhooks/cotizaciones';
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer CesarQuotes2026`
    },
    body: JSON.stringify(quoteData)
  });

  const resText = await response.text();
  if (response.ok) {
    console.log("✅ PUBLICADO EXITOSAMENTE en el sitio web.");
    console.log("Respuesta:", resText);
  } else {
    console.error("❌ Error en la publicación:", response.status, resText);
  }

  // Marcar como publicado en DB
  await supabase.from('quote_drafts').update({ status: 'published' }).eq('slug', slug);
}
run();
