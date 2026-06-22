const fetch = require('node-fetch');

const CLIENTES = [
  { empresa: "HidroCobre", decisor: "Srs. HidroCobre", slug: "propuesta-hidrocobre-2026" }
];

function buildBody(empresa, decisor, slug) {
  return {
    id: slug,
    portada: {
      etiqueta: "Estrategia de Identidad Digital Propietaria",
      titulo_principal: "",
      titulo_destacado: `${empresa}<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Su nombre es su activo más valioso. Es hora de que le pertenezca también en internet.</span>`,
      subtitulo: `Plan de Expansión y Control · Preparado para ${decisor} | Mayo 2026`,
      preparado_para: `${decisor}`,
      preparado_por: "Ing. César Augusto Reyes Jaramillo",
      fecha: "Mayo 2026",
      imagen_url: "https://cesarweb.b-cdn.net/activaqr/hidrocobre_mockup.png",
      url_fondo: "https://cesarweb.b-cdn.net/activaqr/hidrocobre_mockup.png",
      url_logo_cliente: "https://cesarweb.b-cdn.net/activaqr/hidrocobre_logo.png"
    },
    introduccion: {
      titulo: "Propiedad Digital y Control Operativo.",
      parrafos: [
        `Es un gusto saludarles. Tras analizar su presencia digital actual, he identificado una oportunidad clave para fortalecer la autoridad de **${empresa}**.`,
        `Hoy en día, no basta con tener una ficha en plataformas externas; la solidez de una empresa de ingeniería se refleja en tener su propia casa en internet: **hidrocobre.com**.`,
        `Esta propuesta no solo busca darles esa identidad propia, sino también dotarles de las herramientas de control necesarias para supervisar su operación en campo con la precisión que sus clientes esperan.`
      ]
    },
    etapas: [
      {
        numero: "1",
        etiqueta_tiempo: "Pilar I · Identidad",
        nombre: "Dominio y Plataforma Propietaria",
        eslogan: "\"Su empresa, su nombre, su plataforma.\"",
        precio: "",
        precio_subtitulo: "Inversión bajo cotización técnica",
        description: "Establecemos su presencia oficial bajo el dominio hidrocobre.com. Dejamos de depender de espacios alquilados para proyectar una imagen de corporación sólida y profesional, donde los clientes que buscan soluciones de agua en Cuenca los encuentren directamente a ustedes.",
        entregables: [
          "Activación de dominio propio hidrocobre.com",
          "Desarrollo de plataforma web de alta autoridad",
          "Posicionamiento estratégico en búsquedas de ingeniería"
        ],
        nota_especial: "La diferencia entre tener una tarjeta digital y tener una empresa en internet.",
        detalles_pie: ["🚀 Independencia y autoridad digital"]
      },
      {
        numero: "2",
        etiqueta_tiempo: "Pilar II · Control",
        nombre: "Sistema de Gestión y Evidencia",
        eslogan: "\"Supervisión total de su equipo técnico.\"",
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
      titulo: "El siguiente paso hacia la solidez digital.",
      frase_bisagra: `Señores de ${empresa}, es momento de que su identidad digital esté a la altura de su capacidad técnica.`,
      texto: `Les propongo agendar una sesión técnica de 15 minutos para dimensionar el impacto de estas herramientas en su operación actual y definir la combinación de soluciones que mejor potencie su crecimiento este año.`,
      frase_final: "Tecnología diseñada <span>para proyectar la grandeza de su empresa.</span>",
      mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
      cta_texto: "📅 Agendar Consultoría Técnica (15 min)",
      cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, revisamos la propuesta para HidroCobre. Queremos agendar la llamada de 15 minutos para discutir los pilares de crecimiento.`)}`,
      pie_texto: "Invertir en identidad es la forma más segura de blindar su futuro comercial."
    }
  };
}

async function publish() {
  console.log(`\n🚀 Publicando propuesta para HidroCobre...\n`);
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
