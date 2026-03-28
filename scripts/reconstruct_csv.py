import csv
import io
from datetime import datetime, timedelta

headers = [
    "ID", "Silo", "Título", "Tipo", "Palabras_Est", "Hub_URL", "Enlace_Pilar", 
    "Intención_Búsqueda", "Draft_Status", "Slug", "Thumbnail", "Contenido_Markdown", 
    "Post_FB", "Post_IG", "Post_LI", "Post_X", "URL_Final", "Hook_TikTok", 
    "Script_Video", "Story_Idea", "Prompt_Portada_16_9", "imagePromptInternal1", "imagePromptInternal2"
]

def get_rows():
    rows = []
    
    def r(id_n, silo, title, slug, li, ig, fb, x, url, prompt, int1="", int2="", hub="/analisis-estrategico", pilar="N/A", intent="Solución", hook="", script=""):
        rows.append([str(id_n), silo, title, "Cluster" if "Pilar" not in title else "Pilar", "850", hub, pilar, intent, "Ready", slug, f"https://cesarweb.b-cdn.net/{slug}.webp", "", fb, ig, li, x, url, hook, script, "", prompt, int1, int2])

    # 1. IA Ecuador
    r(1, "automatizacion-de-ventas", "¿Cómo usar la Inteligencia Artificial en mi negocio en Ecuador? (Caso Real)", "ia-ecuador-casos-reales", "La IA no va a reemplazar tu negocio, pero un competidor que use IA sí lo hará...", "¿Duermes? Tu competencia no. 🤖 La IA en Ecuador...", "🇪🇨 El futuro no es 'usar IA', es saber DÓNDE aplicarla para no perder dinero. Mira este caso real de cómo una empresa en Loja automatizó sus ventas.", "La IA en Ecuador: No es 'chatear con un bot'...", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/ia-ecuador-casos-reales", "Cinematographic wide shot. A futuristic bridge made of golden energy and blue data streams crossing a deep canyon...", hook="La IA en Ecuador no es ciencia ficción, es ahorro real. 🤖💰", script="Gancho: Lo que nadie te dice de la IA en Ecuador...", pilar="/blog/automatizacion/guia-whatsapp-crm-ia", intent="Descubrimiento")

    # 2. Mi hijo maneja las redes
    prompt2 = "Actúa como un Director de Arte de élite y fotógrafo publicitario. Genera una imagen fotorrealista 3D en formato 16:9. Estilo: Organic-Premium. ESCENA: Un semáforo solitario brillando en verde intenso en una calle nocturna empedrada y solitaria. IDENTIDAD ECUADOR: Arquitectura colonial del Centro Histórico de Quito con reflejos de lluvia. Integra el logotipo transparente de \"Objetivo\" como: Logo 'Objetivo' pirograbado en la base de piedra del semáforo. TEXTO: \"EL SEMÁFORO EN VERDE\" - \"Pero la calle está vacía\"."
    r(2, "marketing-para-pymes", "Mi hijo maneja las redes: El error estratégico que está quebrando a las PYMEs", "error-marketing-familiar-pymes", "Delegar el marketing de tu empresa a un sobrino es el camino más rápido a la invisibilidad comercial...", "Tu sobrino sabe subir fotos, pero ¿sabe construir una base de datos?...", "⚠️ Alerta PYME: Delegar tus redes al 'sobrino' que sabe subir fotos es el error más costoso de 2026. El marketing no es visual, es ESTRUCTURAL.", "¿Likes o Ventas? Si tu 'community manager' es un familiar, tienes un hobby, no una empresa.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/error-marketing-familiar-pymes", prompt2, hub="/desarrollo-web/tu-negocio-24-7", pilar="/analisis-estrategico/estrategia-ganar-clientes", intent="Reconocimiento")

    # 3. Google Maps
    r(3, "posicionamiento-en-google", "Por qué no apareces en Google Maps aunque tengas el mejor producto de la ciudad", "guia-definitiva-seo-local", "Tienes el mejor producto de la ciudad, pero eres invisible...", "¿Eres invisible en tu propia ciudad? 📍...", "📍 Si no apareces en Google Maps cuando alguien busca 'tu servicio + tu ciudad', simplemente no existes.", "¿Buscas un negocio y sale tu competencia pero tú no?...", "https://www.cesarreyesjaramillo.com/blog/posicionamiento-en-google/guia-definitiva-seo-local", "Hyper-realistic wide landscape. A golden metallic lighthouse on a misty Ecuadorian cliffside...", hub="/posicionamiento/auditoria-seo-rediseno", intent="Diagnóstico")

    # 4. WhatsApp y CRM
    r(4, "automatizacion-de-ventas", "Guía Definitiva de WhatsApp y CRM con IA en Ecuador (2026)", "guia-whatsapp-crm-ia", "Si usas WhatsApp solo para chatear, estás matando tu rentabilidad...", "Tu clon de ventas con IA. 🤖 Cierra tratos mientras duermes.", "Automatiza tus ventas 24/7 y deja de perder dinero en la madrugada.", "Automatiza WhatsApp o muere. La IA atiende 24/7 y cierra por ti.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/guia-whatsapp-crm-ia", "Hyper-realistic close-up. A stylized human heart made of glowing golden fiber optics...", hub="/desarrollo-web/tu-negocio-24-7", intent="Transaccional")

    # 5. E-commerce
    r(5, "automatizacion-de-ventas", "E-commerce y Catálogos Digitales: Cómo Vender sin Fricción en 2026", "ecommerce-catalogos-digitales-ventas", "Un catálogo en PDF no cierra ventas, bloquea memorias de teléfono.", "Tira the PDF to trash 🗑️ Vende en 3 clics", "El error de enviar PDFs que nadie descarga. Evoluciona al catálogo dinámico interactivo.", "Si tarda más de 3 clics en comprar, se fue a la competencia.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/ecommerce-catalogos-digitales-ventas", "Cinematographic close-up. A high-end fountain pen writing a signature on a luminous holographic contract...", hub="/desarrollo-web/tu-sucursal-online", intent="Transaccional")

    # 6. Networking
    r(6, "automatizacion-de-ventas", "Networking en 2026: Por qué entregar tarjetas de papel te hace ver obsoleto", "networking-digital-activaqr", "Entregar una tarjeta de papel es el equivalente a usar una máquina de escribir...", "Tira los cartones a la basura. 🗑️ La primera impresión es digital.", "¿Sigues cargando cartones en el bolsillo? El 88% terminan en la basura...", "¿Estatus o papel? Pásate a la tecnología ActivaQR.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/networking-digital-activaqr", "Cinematographic wide shot. A wrinkled, old paper business card disintegrating into golden dust...", hub="/desarrollo-web/tarjeta-digital")

    # 7. Síndrome Madrugada
    r(7, "automatizacion-de-ventas", "El Síndrome de la Madrugada: Cuánto dinero pierdes mientras tu negocio duerme", "sindrome-madrugada-ventas", "Cerrar tu 'local digital' a las 6 PM es un suicidio comercial.", "¿Duermes? Tus leads no. 🌙 Descubre cómo un Bot CRM atiende por ti.", "¿Te despiertas con 20 mensajes sin leer? El pico de búsqueda es nocturno...", "Pierdes más dinero en la madrugada de lo que crees.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/sindrome-madrugada-ventas", "Cinematic landscape. A moonlit office with a large window. Virgen del Panecillo visible...", hub="/desarrollo-web/tu-negocio-24-7", intent="Comercial")

    # 8. Chau Excel
    r(8, "automatizacion-de-ventas", "Por qué las empresas que usan Excel para gestionar su inventario siempre llegan tarde", "chau-excel-gestion-empresarial", "Tu empresa tiene un techo de cristal si depende de un archivo compartido.", "¿Vives con miedo a que se borre una celda? 📊 Pásate a la nube.", "Excel no es una base de datos. Tu negocio tiene un techo de cristal.", "Excel te dice qué pasó ayer. Un sistema B2B te dice qué pasará mañana.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/chau-excel-gestion-empresarial", "Professional food photography. A bowl of Encebollado with Objetivo logo toothpick flag...", hub="/desarrollo-web/tu-empresa-online", intent="Frustración")

    # 9. Arquitectura Conversión
    r(9, "marketing-para-pymes", "Arquitectura de Conversión y Eficiencia Operativa para PYMES", "arquitectura-conversion-eficiencia", "Si tu logística no es automática, el crecimiento de tu empresa te destruirá.", "Velocidad y Conversión 🚀 Prepara tu web para escalar.", "De nada sirve tener 10,000 visitas si tu operación colapsa.", "Más ventas con mala logística = pérdida de margen.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/arquitectura-conversion-eficiencia", "Cinematographic shot. A dark, dusty storage room. Golden light pouring out of a drawer...", hub="/desarrollo-web/plataformas-y-embudos-operativos", intent="Comercial")

    # 10. Nuevos Mercados
    r(10, "marketing-para-pymes", "Nuevos Mercados 2026: Dónde está el dinero en el Ecuador Digital", "nuevos-mercados-ecuador-2026", "El dinero en Ecuador no se fue, simplemente cambió de manos y de canal.", "¿Buscas nuevos clientes? 💰 Los nichos de 2019 están saturados.", "¿La situación está difícil? El dinero simplemente cambió de canal.", "Deja de competir por precio. Identifica la fricción operativa.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/nuevos-mercados-ecuador-2026", "High-end professional photography. A bright, modern medical office. Tablet glows with golden calendar...", hub="/analisis-estrategico/estudio-factibilidad")

    # 11. Futuro PYME
    r(11, "automatizacion-de-ventas", "El Futuro de la PYME: Automatización Asequible en 2026", "automatizacion-pyme-asequible", "La automatización no es un lujo corporativo, es el escudo de la PYME.", "¿Automatización para grandes? Mentira. 🤖 Democratización del éxito.", "La automatización ya no es solo para corporaciones. Hoy es el escudo de la PYME.", "Regálate 15 horas de libertad a la semana. Automatiza.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/automatizacion-pyme-asequible", "Gritty, professional photography. Close-up of workshop table. Heavy metallic wrench with Objetivo logo...", hub="/desarrollo-web/tu-empresa-online", intent="Descubrimiento")

    # 12. Señales Confianza
    r(12, "posicionamiento-en-google", "Señales de Confianza: El secreto de Google para negocios locales", "señales-confianza-seo-local", "¿Ficha de Google Maps muerta? 📍 Google es un club exclusivo y te está dejando fuera.", "¿Por qué Google muestra a tu competencia primero? Le faltan señales.", "¿Ficha de Google muerta? 📍 Inactividad es invisibilidad.", "Si tu ficha no tiene fotos ni respuestas, Google piensa que ya no existes.", "https://www.cesarreyesjaramillo.com/blog/posicionamiento-en-google/señales-confianza-seo-local", "Warm cinematic shot. Inside a cozy, high-end cafe in Cuenca. Cup with Objetivo logo embossed...", hub="/posicionamiento/seo-local-quito-ecuador", intent="Confianza")

    # 13. SEO B2B
    r(13, "posicionamiento-en-google", "SEO B2B y Autoridad Digital: Dominando Google y la IA en Ecuador", "seo-b2b-autoridad-digital-ia", "Venderle a otra empresa es venderle a un experto. Proyecta autoridad técnica.", "Dominando a Google y la IA 👔 Autoridad B2B real.", "¿El Gerente que necesitas no te encuentra? Positiciónate técnicamente.", "Vístete de autoridad. El mercado corporativo compra certeza.", "https://www.cesarreyesjaramillo.com/blog/posicionamiento-en-google/seo-b2b-autoridad-digital-ia", "Cinematic architectural photography. Modern glass building in Samborondón...", hub="/posicionamiento")

    # 14. Ciberseguridad
    r(14, "marketing-para-pymes", "Ciberseguridad PYME: Protegiendo los datos de tus clientes en Ecuador", "ciberseguridad-pyme-ecuador", "La Ley de Protección de Datos en Ecuador no es una sugerencia.", "Un hackeo es un problema de marca, no técnico. 🛡️", "¿Crees que eres muy pequeño para un hacker? Los bots no discriminan.", "¿Backups? No esperes al desastre para blindar tu activo digital.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/ciberseguridad-pyme-ecuador", "Cinematographic landscape. Entrepreneur on a high-tech terrace overlooking futuristic Quito...", intent="Prevención")

    # 15. Networking CEOs
    r(15, "automatizacion-de-ventas", "Networking para CEOs: Tu perfil digital es tu nueva oficina", "networking-para-ceos", "Tú eres el activo más valioso de tu empresa. ¿Qué proyectas?", "Tu marca personal es tu mejor herramienta de cierre. 🏛️", "Tú eres el activo más valioso de tu empresa. ¿Qué proyecta tu perfil digital?", "Toca con ActivaQR y entra directo al CRM del cliente premium.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/networking-para-ceos", "Professional workplace photography. Desk in an office in Cumbayá. Coffee mug with Objetivo logo...", hub="/desarrollo-web/tu-contacto-profesional", intent="Estatus")

    # 16. Email Marketing
    r(16, "marketing-para-pymes", "Email Marketing 2026: Por qué no ha muerto y cómo usarlo en Ecuador", "email-marketing-2026-ecuador", "WhatsApp para la urgencia, Email para la relación profunda.", "No dependas del algoritmo 📧. Construye tu base propia.", "¿Crees que el email murió? Es el canal con mayor ROI si dejas de hacer SPAM.", "Un cliente educado es un cliente fiel. Automatiza tu onboarding.", "https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/email-marketing-2026-ecuador", "Cinematographic dark atmosphere. Tactical digital map of Ecuador glowing in blue...", hub="/analisis-estrategico/estrategia-ganar-clientes", intent="Educativo")

    # 17. Menús Digitales (Pilar)
    r(17, "automatizacion-de-ventas", "Guía Definitiva de Menús Digitales y Pedidos Automáticos para Restaurantes (2026)", "guias-definitiva-menus-digitales-restaurantes", "[CARRUSEL] El PDF vs El Menú Inteligente. 🍔 Velocidad operativa.", "[CARRUSEL] 3 Formas en las que tu menú en papel quema tus ganancias 🍽️.", "[CARRUSEL] El PDF vs El Menú Inteligente. 🍔 Por qué el PDF te hace perder el 30% de pedidos.", "Tu comida es buena, tu sistema de pedidos es malo.", "https://www.cesarreyesjaramillo.com/blog/activaqr/guias-definitiva-menus-digitales-restaurantes", "Cinematic portrait. Split background: gaming room vs high-end office with dashboards...", hub="/desarrollo-web/tu-sucursal-online", intent="Transaccional")

    # 18. Costo Impresión
    r(18, "automatizacion-de-ventas", "El Costo Oculto de Imprimir Menús Físicos Cada Mes", "costo-oculto-imprimir-menus", "¿Gastas $300 anuales en imprenta de menús? Estás subsidiando a la imprenta.", "Papel manchado = Pérdida de marca 🗑️. Pásate al digital.", "¿Gastas $300 anuales en imprenta de menús? El papel es una camisa de fuerza.", "Sube el precio del proveedor y tú pierdes porque no puedes tachar el cartón.", "https://www.cesarreyesjaramillo.com/blog/activaqr/costo-oculto-imprimir-menus", "Cinematic tech photography. Server room with blue lights. Tablet shows unified WhatsApp API...", hub="/desarrollo-web/tu-sucursal-online", intent="Frustración")

    # 19. Ticket Promedio
    r(19, "automatizacion-de-ventas", "Cómo Aumentar el Ticket Promedio un 20% Usando Fotografías en tu Menú QR", "aumentar-ticket-promedio-menu-fotografico", "[CARRUSEL] El Upselling visual en restaurantes. ¿Cómo lograr que pidan papas grandes?", "Entra por los ojos, sale en efectivo 🍟. Upselling visual.", "[CARRUSEL] El Upselling visual en restaurantes. El sistema digital nunca olvida.", "La gente no lee listas, ve fotos de comida suculenta.", "https://www.cesarreyesjaramillo.com/blog/activaqr/aumentar-ticket-promedio-menu-fotografico", "Hyper-realistic conceptual art. Liquid gold metal forming words around human silhouette...", hub="/desarrollo-web/tu-sucursal-online")

    # 20. Elimina Fila
    r(20, "automatizacion-de-ventas", "Elimina la Fila: Pedidos desde la Mesa Directo a la Cocina", "elimina-fila-pedidos-mesa", "Cada 10 minutos de fila para pagar es una mesa menos de rotación.", "¿Filas para pagar? Fricción mortal ⏳. Cobra directo en la mesa.", "Cada 10 minutos de fila es una mesa menos de rotación. Elimina cajas centrales.", "La comida llega caliente, la cuenta se paga en 1 clic.", "https://www.cesarreyesjaramillo.com/blog/activaqr/elimina-fila-pedidos-mesa", "Luxury architectural photography. Sunset penthouse view IQON building. Gold key Objetivo logo...", hub="/desarrollo-web/tu-sucursal-online", intent="Comercial")

    # 21. Networking B2B (Pilar)
    r(21, "marketing-para-pymes", "El Nuevo Estándar del Networking B2B: Tarjetas Inteligentes y CRM (2026)", "el-nuevo-estandar-networking-b2b", "[CARRUSEL] La anatomía del fracaso de la tarjeta de papel vs ActivaQR B2B.", "[CARRUSEL] 3 Razones por las que el CEO moderno usa NFC 👔.", "[CARRUSEL] La anatomía del fracaso de la tarjeta de papel y la magia de ActivaQR B2B.", "Tu tarjeta de papel no cierra ventas. ActivaQR sí.", "https://www.cesarreyesjaramillo.com/blog/activaqr/el-nuevo-estandar-networking-b2b", "Cinematographic close-up. Two hands holding dark wood gift box with Objetivo logo...", hub="/desarrollo-web/tarjeta-digital", intent="Transaccional")

    # 22. Tarjetas Basura
    r(22, "marketing-para-pymes", "El 88% de las Tarjetas de Papel Terminan en la Basura", "tarjetas-papel-basura-estadistica", "La estadística es brutal: Ese paquete de $50 terminará en el tacho en 48 horas.", "El cementerio del papel 🗑️. Deja de financiar imprentas.", "La estadística es brutal: $50 que imprimiste terminarán en el tacho en 48h.", "El papel crea fricción. La fricción evapora tu inversión.", "https://www.cesarreyesjaramillo.com/blog/activaqr/tarjetas-papel-basura-estadistica", "Epic industrial photography. Modern factory floor in Durán. Robotic arms Objetivo logo...", hub="/desarrollo-web/tu-contacto-profesional", intent="Frustración")

    # 23. Capturar Dato
    r(23, "marketing-para-pymes", "Cómo Capturar el Dato de tu Prospecto en 3 Segundos Durante un Evento", "capturar-dato-evento-b2b-3-segundos", "En una feria B2B tienes 30 segundos. Invierte 27 en hablar y 3 en capturar.", "Intercambio bidireccional en 3 segundos ⏱️. Magia corporativa.", "En una feria B2B tienes 30 segundos. Atrapa el lead en tu pantalla.", "Acerca tu tarjeta, abre tu perfil, atrapa el lead.", "https://www.cesarreyesjaramillo.com/blog/activaqr/capturar-dato-evento-b2b-3-segundos", "Cinematographic wide angle. Left: gray office. Right: golden command center terminal Objetivo logo...", hub="/desarrollo-web/tarjeta-digital", intent="Educativo")

    # 24. Cierre Ventas CRM
    r(24, "marketing-para-pymes", "De la Tarjeta de Presentación al Cierre de Ventas: Integración CRM", "networking-cierre-ventas-crm", "[CARRUSEL] El flujo mágico: De la tarjeta NFC directo al CRM.", "No pierdas seguimientos en Excel 📁. El CRM recibe la data de inmediato.", "[CARRUSEL] El flujo mágico: De la tarjeta NFC directo al CRM y al primer correo.", "De la sonrisa en la feria al contrato cerrado.", "https://www.cesarreyesjaramillo.com/blog/activaqr/networking-cierre-ventas-crm", "Epic conceptual art. Massive crystalline Objetivo logo floating above clouds over Ecuador...", hub="/desarrollo-web/tarjeta-digital", intent="Comercial")

    return rows

def write_csv(filename, rows, include_scheduling=False):
    with io.open(filename, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        current_headers = headers + ["Scheduled_At"] if include_scheduling else headers
        writer.writerow(current_headers)
        
        # Start date for scheduling: March 28, 2026
        start_date = datetime(2026, 3, 28, 12, 30)
        
        for i, row in enumerate(rows):
            if include_scheduling:
                # One post per day
                current_date = start_date + timedelta(days=i)
                scheduled_at = current_date.strftime('%Y-%m-%dT%H:%M:%S-05:00')
                writer.writerow(row + [scheduled_at])
            else:
                writer.writerow(row)

rows = get_rows()
write_csv("BLOG_ESTRATEGICO_2026.csv", rows)
write_csv("BLOG_ESTRATEGICO_2026_SCHEDULED.csv", rows, include_scheduling=True)
print("Files Generated Successfully: BLOG_ESTRATEGICO_2026.csv and BLOG_ESTRATEGICO_2026_SCHEDULED.csv")
