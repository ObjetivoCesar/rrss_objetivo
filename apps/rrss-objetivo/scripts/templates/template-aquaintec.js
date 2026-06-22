const fetch = require('node-fetch');

const CLIENTES = [
  { empresa: "Aqua Intec", decisor: "Gerencia Aqua Intec", slug: "propuesta-aqua-intec-2026" }
];

function buildBody(empresa, decisor, slug) {
  return {
    id: slug,
    portada: {
      etiqueta: "Estrategia de Activación y Crecimiento",
      titulo_principal: "",
      titulo_destacado: `${empresa}<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Su experiencia es su mayor activo. Es momento de hacerla visible y rentable.</span>`,
      subtitulo: `Plan de Visibilidad Estratégica · Preparado para ${empresa} | Mayo 2026`,
      preparado_para: `${empresa}`,
      preparado_por: "Ing. César Augusto Reyes Jaramillo",
      fecha: "Mayo 2026",
      imagen_url: "https://cesarweb.b-cdn.net/activaqr/aquaintec_mockup.png",
      url_fondo: "https://cesarweb.b-cdn.net/activaqr/aquaintec_mockup.png",
      url_logo_cliente: "https://cesarweb.b-cdn.net/activaqr/aquaintec_logo.png"
    },
    introduccion: {
      titulo: "Transformando la Experiencia en Resultados.",
      parrafos: [
        `Es un gusto saludarles. Tras nuestra conversación, entiendo perfectamente los retos que enfrentan en un mercado que parece estrecho y altamente competitivo. Sin embargo, su vasta experiencia en el sector de piscinas es una ventaja que pocos tienen.`,
        `Mi propuesta hoy no es complicar su operación, sino **activar su marca**. Queremos que cada cliente satisfecho y cada vehículo en la calle se conviertan en una fuente constante de nuevas oportunidades.`,
        `A continuación, presento dos soluciones prácticas y de alto impacto diseñadas para que su empresa recupere el protagonismo que su trayectoria merece.`
      ]
    },
    etapas: [
      {
        numero: "1",
        etiqueta_tiempo: "Pilar I · Conexión",
        nombre: "Sistema ActivaQR Pro",
        eslogan: "\"Su contacto profesional a un solo escaneo.\"",
        precio: "$35",
        precio_subtitulo: "Activación única",
        descripcion: "Eliminamos las barreras entre usted y sus clientes. Implementamos un ecosistema ActivaQR que permite a cualquier interesado guardar su contacto, ver su portafolio de piscinas y solicitar una cotización al instante, todo desde su smartphone.",
        entregables: [
          "Perfil digital de alta conversión para la empresa",
          "Código QR inteligente para tarjetas o puntos de venta",
          "Botón directo de WhatsApp para cierre de ventas"
        ],
        nota_especial: "La forma más rápida de que su experiencia sea compartida por sus clientes.",
        detalles_pie: ["🚀 Conexión inmediata con el mercado"]
      },
      {
        numero: "2",
        etiqueta_tiempo: "Pilar II · Visibilidad",
        nombre: "Vallas Publicitarias Móviles",
        eslogan: "\"Su marca presente en cada rincón de la ciudad.\"",
        precio: "$100",
        precio_subtitulo: "Activación por unidad",
        descripcion: "Convertimos su flota de servicio en herramientas de marketing activo. Mientras su equipo trabaja en una piscina, su vehículo está vendiendo el próximo proyecto. Un diseño de alto impacto visual que proyecta solidez y profesionalismo ante la competencia.",
        entregables: [
          "Implementación de vinilos con QR de alta durabilidad",
          "Landing page de respuesta rápida por vehículo",
          "Imagen de autoridad que intimida a la competencia informal"
        ],
        nota_especial: "Publicidad de guerrilla que trabaja mientras usted se enfoca en la obra.",
        detalles_pie: ["🚗 Presencia de marca dominante"]
      }
    ],
    cierre: {
      titulo: "Es momento de recuperar el terreno.",
      frase_bisagra: `Señores de ${empresa}, estas herramientas están diseñadas para que su trayectoria deje de ser un secreto y se convierta en su mejor vendedor.`,
      texto: `Les propongo iniciar con estas dos activaciones de bajo costo y alto impacto. Son pasos firmes hacia una visión de empresa más grande y organizada.`,
      frase_final: "Tecnología diseñada <span>para potenciar a los expertos.</span>",
      mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
      cta_texto: "📲 Iniciar Activación de Marca",
      cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, revisamos la propuesta para Aqua Intec. Queremos iniciar con la activación de ActivaQR y las Vallas Móviles.`)}`,
      pie_texto: "La visibilidad es la cura para un mercado que parece pequeño."
    }
  };
}

async function publish() {
  console.log(`\n🚀 Publicando propuesta para Aqua Intec...\n`);
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
