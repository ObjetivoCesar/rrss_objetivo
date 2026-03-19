import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Nota: Ejecutar desde la raíz del proyecto o asegurar que .env esté cargado
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const posts = [
    {
      content_text: `📡 ¿Regalas el WiFi en tu local? Estás perdiendo el 90% de tu potencial de fidelización.

No dés la clave gratis. Pon un QR de ActivaQR: el cliente se conecta, y en el proceso guarda tu contacto y descarga tu Tarjeta Digital. 

🚀 BONO EXTRA: Tus clientes pueden instalar tu tarjeta como una App Web en su teléfono. Sin Play Store, sin complicaciones. Siempre visible.

#MarketingGastronomico #WiFiMarketing #ActivaQR #PymesEcuador`,
      platforms: ["instagram", "facebook"],
      status: "draft_ai",
      scheduled_for: "2026-03-13T10:00:00-05:00", // Viernes
      media_urls: ["https://objetivomarketing.b-cdn.net/blog_menu_qr_experience_1773286919161.png"],
    },
    {
      content_text: `⚠️ Deja de enviar tu portafolio en PDF. Es un archivo muerto.

Cuando envías un PDF, el cliente lo mira y lo olvida. Cuando usas ActivaQR, el cliente te guarda como un contacto real con logo y foto.

📱 Ventaja Ganadora: ActivaQR funciona como una Web App. Con un solo clic, tu negocio queda anclado a la pantalla de inicio de tu cliente.

Deja de ser un archivo en descargas y conviértete en un activo en su agenda. 

#VentasB2B #Digitalizacion #ActivaQR #EstrategiaDigital`,
      platforms: ["linkedin"],
      status: "draft_ai",
      scheduled_for: "2026-03-14T09:00:00-05:00", // Sábado
      media_urls: ["https://objetivomarketing.b-cdn.net/blog_presencia_real_vs_redes_1773286809817.png"]
    },
    {
      content_text: `La Memoria Imperfecta es el enemigo de tu negocio. 🧠❌

¿Cuántas veces te han dicho "te voy a recomendar" y luego no se acuerdan de tu nombre o tu número? 

ActivaQR soluciona esto instalándote en el único lugar que la gente no olvida: la agenda de su celular.

Instalable. Reconocible. Compartible en 1 segundo.

#MarketingDigital #EcuadorNegocios #Fidelización #WhatsAppMarketing`,
      platforms: ["instagram", "facebook"],
      status: "draft_ai",
      scheduled_for: "2026-03-15T11:00:00-05:00", // Domingo
      media_urls: ["https://objetivomarketing.b-cdn.net/blog_restaurante_visible_maps_1773286881739.png"]
    }
  ];

  console.log("Inyectando posts para el fin de semana...");
  for (const post of posts) {
    const { error } = await supabase.from('social_posts').insert(post);
    if (error) {
      console.error("Error al inyectar post:", error.message);
    } else {
      console.log(`Post para ${post.scheduled_for} inyectado!`);
    }
  }
}

run();
