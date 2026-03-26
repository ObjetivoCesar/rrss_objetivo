const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Cargar variables de entorno
function getSupabase() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const env = fs.readFileSync(envPath, 'utf8');
        env.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
    
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

const supabase = getSupabase();

// 2. Aquí iría el JSON / objeto inmenso con las publicaciones de la Biblia
// Se poblará en el siguiente paso cuando César nos confirme las imágenes.
const postsToInject = [
    // DÍA 1: 25/03/2026
    {
        content_text: "La IA no va a reemplazar tu negocio, pero un competidor que use IA sí lo hará. 🤖 🇪🇨\nEn este carrusel te cuento cómo una Pyme en Loja pasó de la fricción manual a vender mientras el dueño dormía. No es magia, es arquitectura de conversión. Lee la guía completa aquí: https://cesarreyesjaramillo.com/blog/automatizacion-de-ventas/ia-ecuador-casos-reales",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "IA en Ecuador",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/portada_ia_ecuador_casos_reales_1774375909375.png"],
        scheduled_for: "2026-03-25T12:30:00.000Z", // 07:30 AM EC
        status: "pending"
    },
    {
        content_text: "¿Duermes? Tu competencia no. 🤖 La IA en Ecuador no es ciencia ficción, es ahorro real. Descubre cómo una Pyme automatizó sus ventas y hoy vende 24/7.",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "IA en Ecuador",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/portada_ia_ecuador_casos_reales_1774375909375.png"],
        scheduled_for: "2026-03-26T01:00:00.000Z", // 20:00 PM EC
        status: "draft_ai"
    },
    // DÍA 2: 26/03/2026
    {
        content_text: "¿Delegarías la contabilidad de tu empresa a tu sobrino porque 'usa mucho la calculadora'? 🤔\nEntonces, ¿por qué le delegas el marketing porque 'usa mucho TikTok'? El marketing digital es infraestructura de ventas, no solo subir fotos bonitas. Descubre el error que está quebrando a las PYMEs: https://cesarreyesjaramillo.com/blog/marketing-para-pymes/error-marketing-familiar-pymes",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "Estrategia Digital",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/portada_error_marketing_familiar_2026_1774378705260.png"],
        scheduled_for: "2026-03-26T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "Tu sobrino sabe subir fotos, pero ¿sabe construir una base de datos de clientes? 📉\nTira el marketing de 'likes' a la basura y empieza a construir una máquina de ventas real. Link en la bio. #PymeEcuador #EstrategiaDigital",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Estrategia Digital",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/portada_error_marketing_familiar_2026_1774378705260.png"],
        scheduled_for: "2026-03-27T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 3: 27/03/2026
    {
        content_text: "¿Eres invisible en tu propia ciudad? 📍 Si no apareces en el 'Local Pack' de Google Maps, estás regalando el 80% de tus ventas locales a la competencia. En este carrusel te enseño a dominar el mapa: https://cesarreyesjaramillo.com/blog/posicionamiento-en-google/guia-definitiva-seo-local",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "SEO Local",
        category_id: "posicionamiento-en-google",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/portada_seo_local_maps_2026_v2_1774379800627.png"],
        scheduled_for: "2026-03-27T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "¿Buscas un negocio y sale tu competencia pero tú no? 📍🔍 El 80% de las ventas locales ocurren en Google Maps. Si tu ficha está muerta, tus clientes se van. Link en la bio.",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "SEO Local",
        category_id: "posicionamiento-en-google",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/portada_seo_local_maps_2026_v2_1774379800627.png"],
        scheduled_for: "2026-03-28T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 4: 28/03/2026
    {
        content_text: "Tu clon de ventas 24/7. 🤖 WhatsApp ya no es solo para chatear, es tu CRM automatizado. En este carrusel te enseño a configurar tu primer bot que califica y cierra. https://cesarreyesjaramillo.com/blog/automatizacion-de-ventas/guia-whatsapp-crm-ia",
        platforms: ["instagram", "facebook"],
        target_month: "Abril 2026",
        topic: "WhatsApp CRM",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/portada_ia_ecuador_casos_reales_1774375909375.png"],
        scheduled_for: "2026-03-28T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "Automatiza WhatsApp o muere. La IA atiende 24/7 y cierra por ti. No más mensajes sin responder a las 3 AM.",
        platforms: ["linkedin"],
        target_month: "Abril 2026",
        topic: "WhatsApp CRM",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/portada_ia_ecuador_casos_reales_1774375909375.png"],
        scheduled_for: "2026-03-29T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 5: 29/03/2026
    {
        content_text: "Tira el catálogo en PDF a la basura. 🗑️ En 2026, el cliente quiere elegir, pagar y listo en 3 clics. Si sigues enviando archivos pesados, estás matando tu tasa de conversión. Pásate al digital interactivo: https://cesarreyesjaramillo.com/blog/automatizacion-de-ventas/ecommerce-catalogos-digitales-ventas",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "E-commerce",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/cesar-reyes-marca-generica.webp"],
        scheduled_for: "2026-03-29T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "Si tarda más de 3 clics en comprar, se fue a la competencia. El error de los PDFs que nadie descarga. #EcommerceEcuador",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "E-commerce",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/cesar-reyes-marca-generica.webp"],
        scheduled_for: "2026-03-30T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 6: 30/03/2026
    {
        content_text: "El 88% de las tarjetas de papel se pierden en 48 horas. 📉 No tires tu dinero a la basura. Cambia el cartón por tecnología NFC y captura el dato del prospecto en 3 segundos. https://cesarreyesjaramillo.com/blog/activaqr/el-nuevo-estandar-networking-b2b",
        platforms: ["linkedin"],
        target_month: "Abril 2026",
        topic: "Networking",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/portada_activaqr_networking_2026_1774380305318.png"],
        scheduled_for: "2026-03-30T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "[CARRUSEL] 3 Razones por las que el CEO moderno usa NFC 👔. Deja de dar cartones que terminan en el tacho. #NetworkingDigital",
        platforms: ["instagram", "facebook"],
        target_month: "Abril 2026",
        topic: "Networking",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/portada_activaqr_networking_2026_1774380305318.png"],
        scheduled_for: "2026-03-31T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 7: 31/03/2026
    {
        content_text: "Venderle a un experto requiere contenido de experto. No busques 'likes', busca autoridad. Te enseño cómo posicionarte en Google para que sean los gerentes quienes te busquen a ti: https://cesarreyesjaramillo.com/blog/posicionamiento-en-google/seo-b2b-autoridad-digital-ia",
        platforms: ["linkedin"],
        target_month: "Abril 2026",
        topic: "SEO B2B",
        category_id: "posicionamiento-en-google",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/cesar-reyes-marca-generica.webp"],
        scheduled_for: "2026-03-31T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "Dominando a Google y la IA 👔 Autoridad B2B real para mentes estratégicas. Vístete de autoridad.",
        platforms: ["facebook", "instagram"],
        target_month: "Abril 2026",
        topic: "SEO B2B",
        category_id: "posicionamiento-en-google",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/cesar-reyes-marca-generica.webp"],
        scheduled_for: "2026-04-01T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 8: 01/04/2026
    {
        content_text: "¿Pierdes dinero mientras duermes? El pico de búsqueda digital en Ecuador es nocturno. Si no respondes a las 11 PM, lo estás regalando. https://cesarreyesjaramillo.com/blog/automatizacion-de-ventas/sindrome-madrugada-ventas",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "Sindrome Madrugada",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/sindrome-madrugada-ventas.webp"],
        scheduled_for: "2026-04-01T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "¿Duermes? Tus leads no. 🌙 Descubre cómo un Bot CRM atiende por ti. #Ventas247",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Sindrome Madrugada",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/sindrome-madrugada-ventas.webp"],
        scheduled_for: "2026-04-02T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 9: 02/04/2026
    {
        content_text: "La gastronomía moderna no sobrevive con papel. Evoluciona a pedidos directos desde la mesa. https://cesarreyesjaramillo.com/blog/activaqr/guias-definitiva-menus-digitales-restaurantes",
        platforms: ["facebook", "linkedin"],
        target_month: "Abril 2026",
        topic: "Menús Digitales",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/guias-definitiva-menus-digitales-restaurantes.webp"],
        scheduled_for: "2026-04-02T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "[CARRUSEL] 3 Formas en las que tu menú en papel quema tus ganancias 🍽️. #RestaurantesEcuador",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Menús Digitales",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/guias-definitiva-menus-digitales-restaurantes.webp"],
        scheduled_for: "2026-04-03T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 10: 03/04/2026
    {
        content_text: "Tu empresa tiene un techo de cristal si depende de un archivo compartido para decisiones estratégicas. https://cesarreyesjaramillo.com/blog/automatizacion-de-ventas/chau-excel-gestion-empresarial",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "Chau Excel",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/chau-excel-gestion-empresarial.webp"],
        scheduled_for: "2026-04-03T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "¿Vives con miedo a que se borre una celda? 📊 Pásate a la nube. #GestionEmpresarial",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Chau Excel",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/chau-excel-gestion-empresarial.webp"],
        scheduled_for: "2026-04-04T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 11: 04/04/2026
    {
        content_text: "Tu mesero se olvida del postre. Tu sistema digital jamás lo olvida. El Upselling automático es la clave. https://cesarreyesjaramillo.com/blog/activaqr/aumentar-ticket-promedio-menu-fotografico",
        platforms: ["facebook", "linkedin"],
        target_month: "Abril 2026",
        topic: "Ticket Promedio",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/aumentar-ticket-promedio-menu-fotografico.webp"],
        scheduled_for: "2026-04-04T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "Entra por los ojos, sale en efectivo 🍟. Aplica Upselling visual hoy. #EcuadorDigital",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Ticket Promedio",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/aumentar-ticket-promedio-menu-fotografico.webp"],
        scheduled_for: "2026-04-05T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 12: 05/04/2026
    {
        content_text: "Tu cliente levantando la mano por 15 minutos es ineficiencia pura. Cero filas en 2026. https://cesarreyesjaramillo.com/blog/activaqr/elimina-fila-pedidos-mesa",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "Cero Filas",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/elimina-fila-pedidos-mesa.webp"],
        scheduled_for: "2026-04-05T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "¿Filas para pagar? Fricción mortal ⏳. Cobra directo en la mesa. #Automatización",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Cero Filas",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/elimina-fila-pedidos-mesa.webp"],
        scheduled_for: "2026-04-06T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 13: 06/04/2026
    {
        content_text: "Entregar cartones en 2026 es enviar un fax. Pásate al estándar B2B inteligente. https://cesarreyesjaramillo.com/blog/activaqr/el-nuevo-estandar-networking-b2b",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "Estandar B2B",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/el-nuevo-estandar-networking-b2b.webp"],
        scheduled_for: "2026-04-06T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "[CARRUSEL] 3 Razones por las que el CEO moderno usa NFC 👔. #Networking",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Estandar B2B",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/el-nuevo-estandar-networking-b2b.webp"],
        scheduled_for: "2026-04-07T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 14: 07/04/2026
    {
        content_text: "Si tu prospecto tiene que digitar tu correo a mano, no te va a escribir. Facilítale la vida. https://cesarreyesjaramillo.com/blog/activaqr/tarjetas-papel-basura-estadistica",
        platforms: ["facebook", "linkedin"],
        target_month: "Abril 2026",
        topic: "Tarjetas Papel",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/tarjetas-papel-basura-estadistica.webp"],
        scheduled_for: "2026-04-07T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "El cementerio del papel 🗑️. Deja de financiar imprentas. #ActivaQR",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Tarjetas Papel",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/tarjetas-papel-basura-estadistica.webp"],
        scheduled_for: "2026-04-08T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 15: 08/04/2026
    {
        content_text: "La Ley de Protección de Datos no es sugerencia. 🛡️ Un hackeo es un problema de reputación de marca. https://cesarreyesjaramillo.com/blog/marketing-para-pymes/ciberseguridad-pyme-ecuador",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "Ciberseguridad",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/portada_ciberseguridad_2026.webp"],
        scheduled_for: "2026-04-08T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "Un hackeo es un problema de marca, no técnico. Protege a tu cliente. #SeguridadDigital",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Ciberseguridad",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/portada_ciberseguridad_2026.webp"],
        scheduled_for: "2026-04-09T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 16: 09/04/2026
    {
        content_text: "La automatización te permite pivotar en días mientras los grandes tardan meses. Tu ventaja injusta. https://cesarreyesjaramillo.com/blog/automatizacion-de-ventas/automatizacion-pyme-asequible",
        platforms: ["facebook", "linkedin"],
        target_month: "Abril 2026",
        topic: "Automatización Asequible",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/cesar-reyes-marca-generica.webp"],
        scheduled_for: "2026-04-09T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "¿Automatización para grandes? Mentira. 🤖 Es para democratizar el éxito. #CesarReyes",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Automatización Asequible",
        category_id: "automatizacion-de-ventas",
        media_urls: ["https://cesarweb.b-cdn.net/articulos/cesar-reyes-marca-generica.webp"],
        scheduled_for: "2026-04-10T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 17: 10/04/2026
    {
        content_text: "Consistencia y contexto local. Google Maps premia a quien responde reseñas rápido. https://cesarreyesjaramillo.com/blog/posicionamiento-en-google/señales-confianza-seo-local",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "SEO Confianza",
        category_id: "posicionamiento-en-google",
        media_urls: ["https://cesarweb.b-cdn.net/seales-confianza-seo-local.webp"],
        scheduled_for: "2026-04-10T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "¿Ficha de Google muerta? 📍 Inactividad = Invisibilidad. Actívalo hoy.",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "SEO Confianza",
        category_id: "posicionamiento-en-google",
        media_urls: ["https://cesarweb.b-cdn.net/seales-confianza-seo-local.webp"],
        scheduled_for: "2026-04-11T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 18: 11/04/2026
    {
        content_text: "Sé el dueño de tu audiencia y deja de depender de algoritmos ajenos. Nutre tu base de datos. https://cesarreyesjaramillo.com/blog/marketing-para-pymes/email-marketing-2026-ecuador",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "Email Marketing",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/portada_email_2026.webp"],
        scheduled_for: "2026-04-11T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "WhatsApp para la urgencia, Email para la relación. 📧 Construye un activo real.",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Email Marketing",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/portada_email_2026.webp"],
        scheduled_for: "2026-04-12T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 19: 12/04/2026
    {
        content_text: "El verdadero dinero está en la digitalización de lo complejo. Mira quién se está llevando el margen. https://cesarreyesjaramillo.com/blog/marketing-para-pymes/nuevos-mercados-ecuador-2026",
        platforms: ["facebook", "linkedin"],
        target_month: "Abril 2026",
        topic: "Nuevos Mercados",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/nuevos-mercados-ecuador-2026.webp"],
        scheduled_for: "2026-04-12T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "¿Buscas nuevos clientes? 💰 Los nichos de 2019 están saturados. Mira el futuro.",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Nuevos Mercados",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/nuevos-mercados-ecuador-2026.webp"],
        scheduled_for: "2026-04-13T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 20: 13/04/2026
    {
        content_text: "El objetivo de un evento no es dar tus datos, es capturar los de los demás de forma eficiente. https://cesarreyesjaramillo.com/blog/activaqr/capturar-dato-evento-b2b-3-segundos",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "Captura Datos",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/capturar-dato-evento-b2b-3-segundos.webp"],
        scheduled_for: "2026-04-13T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "Intercambio bidireccional en 3 segundos ⏱️. Magia corporativa con ActivaQR.",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Captura Datos",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/capturar-dato-evento-b2b-3-segundos.webp"],
        scheduled_for: "2026-04-14T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 21: 14/04/2026
    {
        content_text: "Si tu logística no es automática, el crecimiento te destruirá. Crece con orden. https://cesarreyesjaramillo.com/blog/marketing-para-pymes/arquitectura-conversion-eficiencia",
        platforms: ["facebook", "linkedin"],
        target_month: "Abril 2026",
        topic: "Logística Digital",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/arquitectura-conversion-eficiencia.webp"],
        scheduled_for: "2026-04-14T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "Velocidad y Conversión 🚀 Infraestructura para escalar sin morir en el intento.",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Logística Digital",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/arquitectura-conversion-eficiencia.webp"],
        scheduled_for: "2026-04-15T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 22: 15/04/2026
    {
        content_text: "Un apretón de manos no vale nada sin seguimiento predecible. Integra el mundo físico al CRM. https://cesarreyesjaramillo.com/blog/activaqr/networking-cierre-ventas-crm",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "Cierre CRM",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/networking-cierre-ventas-crm.webp"],
        scheduled_for: "2026-04-15T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "No pierdas seguimientos en Excel 📁. El CRM recibe la data de inmediato.",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Cierre CRM",
        category_id: "activaqr",
        media_urls: ["https://cesarweb.b-cdn.net/networking-cierre-ventas-crm.webp"],
        scheduled_for: "2026-04-16T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 23: 16/04/2026
    {
        content_text: "Convierte tu Instagram en una tienda real, no en una galería de fotos. Vende directo. https://cesarreyesjaramillo.com/blog/marketing-para-pymes/ecommerce-catalogos-digitales-ventas",
        platforms: ["facebook", "linkedin"],
        target_month: "Abril 2026",
        topic: "Venta Directa",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/ecommerce-catalogos-digitales-ventas.webp"],
        scheduled_for: "2026-04-16T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "Vende en 3 clics desde el móvil 🍟. Pásate al catálogo 2.0.",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "Venta Directa",
        category_id: "marketing-para-pymes",
        media_urls: ["https://cesarweb.b-cdn.net/ecommerce-catalogos-digitales-ventas.webp"],
        scheduled_for: "2026-04-17T01:00:00.000Z",
        status: "draft_ai"
    },
    // DÍA 24: 17/04/2026
    {
        content_text: "Si la IA no sabe que existes, eres invisible. Conquista el SEO B2B hoy mismo. https://cesarreyesjaramillo.com/blog/posicionamiento-en-google/seo-b2b-autoridad-digital-ia",
        platforms: ["linkedin", "facebook"],
        target_month: "Abril 2026",
        topic: "SEO e IA",
        category_id: "posicionamiento-en-google",
        media_urls: ["https://cesarweb.b-cdn.net/seo-b2b-autoridad-digital-ia.webp"],
        scheduled_for: "2026-04-17T12:30:00.000Z",
        status: "pending"
    },
    {
        content_text: "Dominando a Google y la IA 👔 Autoridad B2B real para mentes estratégicas.",
        platforms: ["instagram"],
        target_month: "Abril 2026",
        topic: "SEO e IA",
        category_id: "posicionamiento-en-google",
        media_urls: ["https://cesarweb.b-cdn.net/seo-b2b-autoridad-digital-ia.webp"],
        scheduled_for: "2026-04-18T01:00:00.000Z",
        status: "draft_ai"
    }
];

async function runInjection() {
    if (postsToInject.length === 0) {
        console.log("⚠️ El arreglo de posts está vacío. Listo para recibir la data final.");
        return;
    }

    console.log(`🚀 Iniciando inyección de ${postsToInject.length} publicaciones...`);
    let succesCount = 0;
    
    for (const post of postsToInject) {
        const { data, error } = await supabase
            .from('social_posts')
            .insert([{
                content_text: post.content_text,
                target_month: post.target_month,
                topic: post.topic,
                platforms: post.platforms,
                category_id: post.category_id,
                media_urls: post.media_urls,
                media_url: post.media_urls[0] || null,
                status: post.status,
                scheduled_for: post.scheduled_for
            }]);
            
        if (error) {
            console.error(`❌ Error al subir post para la fecha ${post.scheduled_for}:`, error.message);
        } else {
            console.log(`✅ Post subido correctamente [${post.platforms.join(', ')}]`);
            succesCount++;
        }
    }
    
    console.log(`\n🎉 Proceso completado: ${succesCount}/${postsToInject.length} publicaciones cargadas en Supabase.`);
}

runInjection();
