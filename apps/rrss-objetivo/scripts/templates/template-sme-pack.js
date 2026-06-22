const fetch = require('node-fetch');

const CLIENTES = [
  { empresa: "Sertecvaz Piscinas", decisor: "Ricardo Vázquez", slug: "propuesta-sertecvaz-piscinas-2026" }
];

function buildBody(empresa, decisor, slug) {
  return {
    id: slug,
    portada: {
      etiqueta: "Propuesta de Crecimiento Digital",
      titulo_principal: "",
      titulo_destacado: `${empresa}<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Optimizamos su presencia digital para que su esfuerzo se traduzca en resultados medibles y un control total de su operación.</span>`,
      subtitulo: `Alternativas Estratégicas · Preparado para el Sr. ${decisor} | Mayo 2026`,
      preparado_para: `Sr. ${decisor}`,
      preparado_por: "Ing. César Augusto Reyes Jaramillo",
      fecha: "Mayo 2026",
      imagen_url: "https://cesarweb.b-cdn.net/activaqr/pickup_qr_sertecvaz.png",
      url_fondo: "https://cesarweb.b-cdn.net/activaqr/pickup_qr_sertecvaz.png",
      url_logo_cliente: ""
    },
    introduccion: {
      titulo: "Tres Caminos para Potenciar su Negocio.",
      parrafos: [
        `Sr. ${decisor.split(' ')[0]}, basándome en el análisis de su presencia actual, he diseñado tres alternativas independientes que le permitirán fortalecer su marca y optimizar la gestión de su equipo. Mi objetivo es proporcionarle las herramientas necesarias para que su negocio siga liderando el mercado con una infraestructura sólida y moderna.`,
        `Estas opciones están diseñadas para implementarse de forma individual o combinada, permitiendo que su equipo actual continúe su labor con mayor respaldo tecnológico y visibilidad estratégica.`
      ]
    },
    etapas: [
      {
        numero: "1",
        etiqueta_tiempo: "Opción A · Visibilidad",
        nombre: "Infraestructura y Posicionamiento",
        eslogan: "\"Que lo encuentren quienes lo necesitan.\"",
        precio: "Desde $350",
        precio_subtitulo: "inversión inicial",
        descripcion: "Actualizamos el motor de su sitio web para garantizar velocidad y seguridad total post-2025. Implementamos SEO local para que su empresa aparezca en los primeros lugares cuando busquen sus servicios en la región.",
        entregables: [
          "Migración a motor de alta velocidad (Next.js)",
          "Optimización de SEO Local y palabras clave",
          "Garantía de seguridad y mantenimiento 2025"
        ],
        nota_especial: "Ideal para captar nuevos clientes automáticamente.",
        detalles_pie: ["🚀 Máxima visibilidad en Google"]
      },
      {
        numero: "2",
        etiqueta_tiempo: "Opción B · Gestión",
        nombre: "Ecosistema CRM de Campo",
        eslogan: "\"El control total en la palma de su mano.\"",
        precio: "Desde $300",
        precio_subtitulo: "configuración y puesta en marcha",
        descripcion: "Implementamos una plataforma de gestión personalizada. Permite el registro multimedia total (Fotos/Videos), notificaciones en tiempo real, control de gastos por obra y agendamiento operativo, funcionando incluso sin conexión (Modo Offline).",
        entregables: [
          "Registro Multimedia (Fotos, Videos, Notificaciones)",
          "Control de Gastos y Costos por obra",
          "Agendamiento Operativo y Modo Offline"
        ],
        nota_especial: "Optimice el tiempo de su equipo y evite malentendidos.",
        detalles_pie: ["✅ Evidencia y orden operativo"]
      },
      {
        numero: "3",
        etiqueta_tiempo: "Opción C · Marketing",
        nombre: "Vallas Publicitarias Móviles",
        eslogan: "\"Sus vehículos como imanes de clientes.\"",
        precio: "Desde $100",
        precio_subtitulo: "activación por unidad",
        descripcion: "Convertimos su flota en herramientas de marketing activo. Mediante QRs estratégicos y una landing page de alta conversión, cualquier persona interesada podrá contactarlo al instante tras ver su trabajo en sus unidades.",
        entregables: [
          "Activación de códigos QR de alta durabilidad",
          "Landing page de contacto rápido por vehículo",
          "Panel de control de promociones móviles"
        ],
        nota_especial: "Publicidad de guerrilla que trabaja 24/7.",
        detalles_pie: ["🚗 Su marca instalada en la calle"]
      }
    ],
    cierre: {
      titulo: "Hablemos de la mejor opción para usted.",
      frase_bisagra: `Sr. ${decisor.split(' ')[0]}, estas alternativas están listas para ser el motor de su crecimiento este 2026.`,
      texto: `Le propongo agendar una llamada breve de 15 minutos para definir cuál de estos caminos (o qué combinación de ellos) se adapta mejor a sus objetivos actuales. Sin compromisos, solo para que usted decida con toda la información técnica sobre la mesa.`,
      frase_final: "Herramientas diseñadas <span>para que su equipo llegue más lejos.</span>",
      mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
      cta_texto: "📞 Agendar llamada de 15 minutos",
      cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, revisé las 3 opciones de digitalización. Me gustaría agendar una llamada para conversar sobre el plan de crecimiento. Soy ${decisor}.`)}`,
      pie_texto: "Invertir en sistemas es la forma más segura de recuperar su tiempo."
    }
  };
}

async function publish() {
  console.log(`\n🚀 Publicando propuestas SME Pack...\n`);
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
