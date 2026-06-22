const fetch = require('node-fetch');

const CLIENTES = [
  { empresa: "EF Riego", decisor: "Luis Pineda", slug: "propuesta-crm-ef-riego-saas-2026" },
  { empresa: "Hidri Riego", decisor: "Daniel Quiñonez", slug: "propuesta-crm-hidri-riego-saas-2026" }
];

function buildBody(empresa, decisor, slug) {
  return {
    id: slug,
    portada: {
      etiqueta: "Ecosistema de Gestión SaaS",
      titulo_principal: "",
      titulo_destacado: `${empresa}<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Usted construye sueños de cristal y agua; nosotros construimos el sistema que evita que su esfuerzo se filtre por las grietas de la desorganización.</span>`,
      subtitulo: `Opción SaaS · Preparado para el Sr. ${decisor} | Abril 2026`,
      preparado_para: `Sr. ${decisor}`,
      preparado_por: "Ing. César Augusto Reyes Jaramillo",
      fecha: "Abril 2026",
      imagen_url: "https://cesarweb.b-cdn.net/activaqr/software-crm-empresas-servicio-objetivo.webp",
      url_fondo: "https://cesarweb.b-cdn.net/activaqr/software-crm-empresas-servicio-objetivo.webp",
      url_logo_cliente: ""
    },
    introduccion: {
      titulo: "La diferencia entre \"Estar en la Obra\" y \"Tener el Control\".",
      parrafos: [
        `Sr. ${decisor.split(' ')[0]}, usted ha levantado ${empresa} con el sudor de su frente, convirtiéndola en un referente. Sin embargo, sabemos que el crecimiento tiene un precio oculto: la pérdida de libertad. Hoy, su mente está en tres lugares a la vez: la oficina, la obra que se está excavando y la cotización que el cliente está esperando.`,
        `Cada vez que una instrucción se pierde en un chat de WhatsApp, cada vez que un operario olvida un detalle o que una cotización se retrasa porque no hay datos claros del campo, su rentabilidad se evapora. No le estamos ofreciendo una "herramienta tecnológica" más. Le ofrecemos un Ecosistema de Gestión a Medida bajo un modelo de suscripción accesible, diseñado para que usted recupere dos cosas que el éxito le ha ido quitando: Tranquilidad y Tiempo.`
      ]
    },
    etapas: [
      {
        numero: "1",
        etiqueta_tiempo: "Etapa Uno · Setup",
        nombre: "Configuración y Personalización",
        eslogan: "\"El sistema adaptado a su forma de trabajar.\"",
        precio: "$300",
        precio_subtitulo: "pago único de configuración",
        descripcion: "Adaptamos el software específicamente a las necesidades de su operación en campo y administración. Entregamos el ecosistema listo para usar en exactamente 1 semana tras la firma.",
        entregables: [
          "Personalización a medida de las necesidades",
          "Configuración de cuentas y permisos",
          "Tiempo de entrega: 1 semana"
        ],
        nota_especial: "Inversión inicial por única vez.",
        detalles_pie: ["⚡ Implementación veloz"]
      },
      {
        numero: "2",
        etiqueta_tiempo: "Etapa Dos · Operación",
        nombre: "Licencia Ecosistema CRM",
        eslogan: "\"Los tres pilares de su negocio, en la palma de su mano.\"",
        precio: "$50",
        precio_subtitulo: "mensual (hasta 5 usuarios)",
        descripcion: "Acceso total a los 3 módulos clave de la operación: 1) Agendamiento Operativo, 2) Gestión de Proyectos en Terreno y 3) Cotizaciones Instantáneas.",
        entregables: [
          "Módulo de Agendamiento con mapas",
          "Chat y registro histórico por proyecto",
          "Cotizador automático en campo"
        ],
        nota_especial: "Cobertura completa para su equipo clave (max 5 personas).",
        detalles_pie: ["✅ Productividad diaria"]
      },
      {
        numero: "3",
        etiqueta_tiempo: "Etapa Tres · Respaldo",
        nombre: "Infraestructura Cloud e IA",
        eslogan: "\"Olvídese de los servidores, nosotros nos encargamos.\"",
        precio: "Incluido",
        precio_subtitulo: "sin costo extra",
        descripcion: "Alojamiento en servidores de alto rendimiento. Incluye la base de datos para guardar de forma segura las imágenes, videos, audios y documentos de sus obras, además de cubrir el costo de la Inteligencia Artificial.",
        entregables: [
          "Almacenamiento multimedia seguro",
          "Mantenimiento de bases de datos",
          "Costos de Inteligencia Artificial"
        ],
        nota_especial: "Su información protegida y siempre disponible.",
        detalles_pie: ["☁️ Tecnología de clase mundial"]
      }
    ],
    cierre: {
      titulo: "El siguiente paso",
      frase_bisagra: `Sr. ${decisor.split(' ')[0]}, una decisión estratégica sobre infraestructura digital requiere analizarse en persona.`,
      texto: `Le propongo una visita a nuestra oficina en Loja para mostrarle la arquitectura del sistema y conversar sobre cómo esta opción SaaS (Suscripción) se adaptará al día a día de ${empresa}. Sin presentaciones largas, sin compromisos. Solo 20 minutos para que usted decida con toda la información sobre la mesa.`,
      frase_final: "Un sistema que se adapta a su proceso, <span>y no al revés.</span>",
      mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
      cta_texto: "✅ Confirmar mi visita a la oficina",
      cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, confirmo nuestra reunión en la oficina para revisar la Opción Mensual del CRM. Soy ${decisor} de ${empresa}.`)}`,
      pie_texto: "Este no es un gasto, es una inversión mensual en la productividad de su empresa."
    }
  };
}

async function publish() {
  console.log(`\n🚀 Publicando propuestas SaaS (Riego)...\n`);
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
        console.log(`✅ ¡Cotización SaaS de ${empresa} publicada con éxito!`);
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
