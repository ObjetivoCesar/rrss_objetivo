const fetch = require('node-fetch');

const CLIENTES = [
  { empresa: "AgrosistemRiego Cia. Ltda.", decisor: "AgrosistemRiego", slug: "propuesta-agrosistem-riego-2026" }
];

function buildBody(empresa, decisor, slug) {
  return {
    id: slug,
    portada: {
      etiqueta: "Estrategia de Liderazgo Digital",
      titulo_principal: "",
      titulo_destacado: `${empresa}<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Implementamos la infraestructura tecnológica que define a los líderes de la industria en 2026.</span>`,
      subtitulo: `Plan de Modernización Estratégica · Preparado para ${empresa} | Mayo 2026`,
      preparado_para: `${empresa}`,
      preparado_por: "Ing. César Augusto Reyes Jaramillo",
      fecha: "Mayo 2026",
      imagen_url: "https://cesarweb.b-cdn.net/activaqr/agrosistemriego_mockup.png",
      url_fondo: "https://cesarweb.b-cdn.net/activaqr/agrosistemriego_mockup.png",
      url_logo_cliente: "https://cesarweb.b-cdn.net/activaqr/agrosistemriego_logo.png"
    },
    introduccion: {
      titulo: "El Estándar Tecnológico de la Industria.",
      parrafos: [
        `Es un gusto saludarles. Basándome en la trayectoria y solidez de **${empresa}**, he diseñado una hoja de ruta estratégica para alinear su presencia digital con el prestigio que ya ostentan en el campo ecuatoriano.`,
        `En un mercado donde la competencia ya está adoptando sistemas de gestión en tiempo real y posicionamiento avanzado, esta propuesta busca consolidar su liderazgo, modernizando los procesos de captación y control operativo sin perder la esencia de su experiencia.`,
        `A continuación, presento tres pilares de transformación diseñados para proyectar una imagen de autoridad y eficiencia absoluta.`
      ]
    },
    etapas: [
      {
        numero: "1",
        etiqueta_tiempo: "Pilar I · Visibilidad",
        nombre: "Presencia y Autoridad en Google",
        eslogan: "\"Que lo encuentren quienes hoy lo buscan en internet.\"",
        precio: "",
        precio_subtitulo: "Inversión bajo cotización técnica",
        descripcion: "Desarrollamos su primera vitrina digital profesional, diseñada específicamente para que su empresa aparezca de forma prioritaria cuando alguien busque 'sistemas de riego' en Cuenca o la región. Convertimos su prestigio de años en una presencia digital que genera confianza inmediata.",
        entregables: [
          "Diseño de su primera plataforma web profesional",
          "Configuración prioritaria en Google Maps",
          "Estrategia de visibilidad local directa"
        ],
        nota_especial: "Ideal para captar nuevos proyectos sin depender de recomendaciones boca a boca.",
        detalles_pie: ["🚀 Su empresa visible en todo el país"]
      },
      {
        numero: "2",
        etiqueta_tiempo: "Pilar II · Control",
        nombre: "Sistema de Gestión y Evidencia",
        eslogan: "\"Toda su operación bajo su control absoluto.\"",
        precio: "",
        precio_subtitulo: "Configuración según volumen operativo",
        descripcion: "Un centro de mando para supervisar cada instalación. Sepa exactamente qué hizo su equipo ayer y qué está haciendo hoy. Mediante reportes con fotos y videos, usted tendrá la evidencia total de cada trabajo realizado, garantizando el orden y la calidad que su trayectoria exige.",
        entregables: [
          "Herramienta de reporte con fotos y videos por obra",
          "Control de asistencia y bitácora de actividades",
          "Archivo histórico de cada proyecto realizado"
        ],
        nota_especial: "Tenga la tranquilidad de saber exactamente qué pasa en cada obra.",
        detalles_pie: ["✅ Evidencia y orden operativo total"]
      },
      {
        numero: "3",
        etiqueta_tiempo: "Pilar III · Visibilidad",
        nombre: "Vallas Publicitarias Inteligentes",
        eslogan: "\"Su flota como su mejor fuerza de ventas.\"",
        precio: "",
        precio_subtitulo: "Activación por unidad",
        descripcion: "Convertimos sus vehículos y puntos de instalación en canales de venta activa. Mediante QRs integrados y una landing page de respuesta inmediata, capturamos el interés de clientes potenciales en el momento exacto en que ven sus equipos trabajando.",
        entregables: [
          "Implementación de códigos QR de alta autoridad",
          "Landing page optimizada para conversiones rápidas",
          "Monitoreo de tráfico generado por unidades móviles"
        ],
        nota_especial: "Publicidad de alto impacto con inversión mínima recurrente.",
        detalles_pie: ["🚗 Presencia de marca en movimiento"]
      }
    ],
    cierre: {
      titulo: "Liderazgo es anticiparse al cambio.",
      frase_bisagra: `Señores de ${empresa}, estas herramientas no son solo software; son el respaldo que su trayectoria merece.`,
      texto: `Les propongo agendar una sesión técnica de 15 minutos para dimensionar el impacto de estas herramientas en su operación actual y definir la combinación de soluciones que mejor potencie su crecimiento este año.`,
      frase_final: "Tecnología diseñada <span>para proyectar la grandeza de su empresa.</span>",
      mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
      cta_texto: "📅 Agendar Consultoría Técnica (15 min)",
      cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, revisamos la propuesta para AgrosistemRiego. Queremos agendar la llamada de 15 minutos para discutir los pilares de crecimiento.`)}`,
      pie_texto: "El prestigio se construye en el campo, pero se defiende con tecnología."
    }
  };
}

async function publish() {
  console.log(`\n🚀 Publicando propuesta para AgrosistemRiego...\n`);
  for (const cliente of CLIENTES) {
    const { empresa, decisor, slug } = cliente;
    const body = buildBody(empresa, decisor, slug);
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
        console.log(`✅ ¡Propuesta de ${empresa} publicada con éxito!`);
        console.log(`🔗 URL: https://www.cesarreyesjaramillo.com/cotizaciones/${slug}`);
      } else {
        const txt = await resp.text();
        console.error(`❌ HTTP ${resp.status} en ${empresa}: ${txt}`);
      }
    } catch (err) {
      console.error(`❌ Error de red en ${empresa}: ${err.message}`);
    }
  }
}

publish();
