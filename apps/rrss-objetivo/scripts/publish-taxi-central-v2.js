const fetch = require('node-fetch');

async function publish() {
  const presi = "Pablo Palacios Salinas";
  const coop = "Central";
  const slug = "propuesta-taxi-central-2026";

  const body = {
    id: slug,
    portada: {
      etiqueta: "Sistema de Respaldo para la Directiva",
      titulo_principal: `Cooperativa ${coop} merece que su directiva tenga`,
      titulo_destacado: "las pruebas para actuar con justicia.",
      subtitulo: `Preparado para el Sr. ${presi} | Abril 2026`,
      preparado_para: `Sr. ${presi}`,
      preparado_por: "Ing. César Augusto Reyes Jaramillo",
      fecha: "Abril 2026",
      imagen_url: "https://cesarweb.b-cdn.net/activaqr/entrda%20a%20la%20ciudad%20de%20loja-%20taxismo.webp",
      url_fondo: "https://cesarweb.b-cdn.net/activaqr/entrda%20a%20la%20ciudad%20de%20loja-%20taxismo.webp",
      url_logo_cliente: ""
    },
    introduccion: {
      titulo: "La supervivencia del taxi formal es un tema de control.",
      parrafos: [
        `Sr. ${presi} y Sr. Marco Calle, como lo conversamos por teléfono, ustedes conocen su flota mejor que nadie. Saben quién trabaja bien y quién genera problemas. El desafío no es saber — es poder actuar con respaldo.`,
        "ActivaQR le entrega a la directiva exactamente eso: evidencia real, automática y organizada, para que cada decisión esté respaldada por hechos y no por versiones. Menos conflictos internos. Más autoridad con los socios."
      ]
    },
    etapas: [
      {
        numero: "1",
        etiqueta_tiempo: "Etapa Uno · Despliegue Físico",
        nombre: "Activación de Control por Unidad",
        eslogan: "\"Su presencia en cada cabina, sin estar ahí.\"",
        precio: "$300",
        precio_subtitulo: "configuración de plataforma",
        descripcion: "Equipamiento físico de sus unidades con placas QR de alta durabilidad en el espaldar. El pasajero escanea y reporta directamente a su WhatsApp institucional cualquier novedad de velocidad o trato.",
        entregables: [
          "Placas QR físicas por unidad",
          "Generación de enlace directo a gerencia",
          "Activación de canal WhatsApp"
        ],
        nota_especial: "Implementación en 48 horas una vez aprobado el diseño.",
        detalles_pie: ["📍 Placas de alto tráfico"]
      },
      {
        numero: "2",
        etiqueta_tiempo: "Etapa Dos · Inteligencia",
        nombre: "Su Centro de Mando",
        eslogan: "\"Datos reales para la asamblea.\"",
        precio: "$9.80",
        precio_subtitulo: "mensual por unidad (Plan Flota)",
        descripcion: "Acceso 24/7 a nuestro dashboard donde usted y la directiva verán el ranking de sus socios. Sabrá exactamente quién merece una felicitación y quién necesita una sanción con pruebas irrefutables.",
        entregables: [
          "Acceso Dashboard Gerencial 24/7",
          "Ranking mensual de calidad de socios",
          "Métricas de servicio y velocidad"
        ],
        nota_especial: "Costo escalable según el número exacto de socios activos.",
        detalles_pie: ["✅ Soporte técnico incluido"]
      },
      {
        numero: "3",
        etiqueta_tiempo: "Etapa Tres · Respaldo Jurídico",
        nombre: "Blindaje Legal y Reputacional",
        eslogan: "\"Evidencia que protege. Testimonios que venden.\"",
        precio: "Incluido",
        precio_subtitulo: "sin costo extra",
        descripcion: "Cada reporte negativo genera un expediente PDF con fecha y hora inalterable para respaldar sanciones. Cada viaje de 5 estrellas alimenta un perfil digital que da seguridad instantánea al pasajero.",
        entregables: [
          "Generación automática de PDFs de sanción",
          "Perfil digital público (VCard) del socio",
          "Banco de testimonios positivos"
        ],
        nota_especial: "Fundamental para procesos disciplinarios internos.",
        detalles_pie: ["📄 Respaldo total para la directiva"]
      }
    ],
    cierre: {
      titulo: "El siguiente paso",
      frase_bisagra: `Sr. ${presi}, esto no requiere una decisión grande. Solo requiere 20 minutos.`,
      texto: "Le propongo una visita a nuestra oficina en Loja para mostrarle el sistema funcionando en vivo. Sin presentaciones largas, sin compromisos. Solo 20 minutos para que usted decida con lo que ven, no con lo que yo le cuento.",
      frase_final: "Quien tiene los datos, <span>tiene el poder en la asamblea.</span>",
      mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
      cta_texto: "✅ Confirmar mi visita a la oficina",
      cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Confirmo mi visita a la oficina de ActivaQR. Soy el Sr. ${presi} de la Cooperativa ${coop}.`)}`,
      pie_texto: "Sin contratos de entrada. Sin compromisos. Solo la reunión."
    }
  };

  console.log(`🚀 Publicando versión de prueba: Cooperativa ${coop}...`);
  
  try {
    const resp = await fetch('https://cesarreyesjaramillo.com/api/webhooks/cotizaciones', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer CesarQuotes2026',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (resp.ok) {
      console.log(`✅ Publicada: https://www.cesarreyesjaramillo.com/cotizaciones/${slug}`);
    } else {
      console.error('❌ Error HTTP:', resp.status);
    }
  } catch (err) {
    console.error('❌ Error de red:', err.message);
  }
}

publish();
