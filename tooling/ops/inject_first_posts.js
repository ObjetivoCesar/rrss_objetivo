import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const posts = [
    {
      content_text: `🚀 ¿Tus clientes vienen una vez y no regresan? El problema no es tu comida, es que no tienes cómo contactarlos de nuevo.

Con ActivaQR transformamos la experiencia de tu restaurante: no solo escanean el menú, ¡se registran para obtener beneficios y tú te quedas con sus datos! 

Empieza a enviarles promos directo a su WhatsApp y conviértelos en clientes frecuentes. 👉 Link en la bio.

#RestaurantesEcuador #MarketingGastronomico #ActivaQR #Fidelizacion`,
      platforms: ["instagram", "facebook"],
      status: "draft_ai",
      scheduled_for: "2026-03-04T12:00:00-05:00",
      media_urls: ["https://objetivomarketing.b-cdn.net/blog_menu_qr_experience_1773286919161.png"],
    },
    {
      content_text: `Pymes vs. Grandes Marcas: La batalla por la atención 🥊

Si eres una Pyme B2B en Ecuador, enviar correos fríos ya no es suficiente. Tienes que estar en LinkedIn aportando valor real, educando a tu cliente antes de que necesite comprarte.

En Grupo Empresarial Reyes diseñamos embudos B2B que combinan contenido estratégico en LinkedIn con cierres automatizados en WhatsApp. 

¿Listo para dejar de perseguir clientes y hacer que ellos te busquen? Hablemos. 📩

#MarketingB2B #PymesEcuador #VentasB2B #EstrategiaDigital`,
      platforms: ["linkedin"],
      status: "draft_ai",
      scheduled_for: "2026-03-09T10:00:00-05:00",
      media_urls: ["https://objetivomarketing.b-cdn.net/blog_presencia_real_vs_redes_1773286809817.png"]
    },
    {
      content_text: `⚠️ Si tu clínica dental no usa WhatsApp de forma inteligente, estás perdiendo el 40% de tus pacientes por "olvidos".

Implementa un bot de WhatsApp con ActivaQR que:
✅ Recuerde las citas 24h antes.
✅ Ofrezca reagendar automáticamente.
✅ Pida una reseña en Google después de salir de consulta.

El servicio al cliente en 2026 es 100% conversacional. Escríbeme al DM y te enseño cómo configurarlo en 1 tarde. 👇

#DoctoresEcuador #MarketingMedico #ClinicaDental #WhatsAppBusiness`,
      platforms: ["instagram", "tiktok", "facebook"],
      status: "draft_ai",
      scheduled_for: "2026-03-12T18:00:00-05:00",
      media_urls: ["https://objetivomarketing.b-cdn.net/blog_doctor_fidelizacion_qr_1773286932615.png"]
    }
  ];

  for (const post of posts) {
    const { error } = await supabase.from('social_posts').insert(post);
    if (error) {
      console.error("Error inserting:", error);
    } else {
      console.log("Post inserted!");
    }
  }
}

run();
