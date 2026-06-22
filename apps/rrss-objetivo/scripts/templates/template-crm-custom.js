const fetch = require('node-fetch');

const slug = "propuesta-crm-pisciriego-2026";
const decisor = "Leoncio Ramón";
const empresa = "Pisciriego";

const body = {
  id: slug,
  portada: {
    etiqueta: "Ecosistema de Gestión a Medida",
    titulo_principal: "",
    titulo_destacado: `${empresa}<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Usted construye sueños de cristal y agua; nosotros construimos el sistema que evita que su esfuerzo se filtre por las grietas de la desorganización.</span>`,
    subtitulo: `Preparado para el Sr. ${decisor}, Líder de Visión | Abril 2026`,
    preparado_para: `Sr. ${decisor}`,
    preparado_por: "Ing. César Augusto Reyes Jaramillo",
    fecha: "Abril 2026",
    imagen_url: "https://cesarweb.b-cdn.net/activaqr/pisciriego.webp",
    url_fondo: "https://cesarweb.b-cdn.net/activaqr/pisciriego.webp",
    url_logo_cliente: ""
  },
  introduccion: {
    titulo: "La diferencia entre \"Estar en la Obra\" y \"Tener el Control\".",
    parrafos: [
      `Sr. Leoncio, usted ha levantado Pisciriego con el sudor de su frente, convirtiéndola en el referente de Loja y el sur del país. Sin embargo, sabemos que el crecimiento tiene un precio oculto: la pérdida de libertad. Hoy, su mente está en tres lugares a la vez: la oficina, la obra que se está excavando y la cotización que el cliente está esperando.`,
      `Cada vez que una instrucción se pierde en un chat de WhatsApp, cada vez que un operario olvida un detalle o que una cotización se retrasa porque no hay datos claros del campo, su rentabilidad se evapora. No le estamos ofreciendo una "herramienta tecnológica" más. Le ofrecemos un Ecosistema de Gestión a Medida diseñado para que usted recupere dos cosas que el éxito le ha ido quitando: Tranquilidad y Tiempo.`
    ]
  },
  etapas: [
    {
      numero: "1",
      etiqueta_tiempo: "Módulo Uno · Agendamiento Operativo",
      nombre: "Adiós a los \"se me olvidó\"",
      eslogan: "\"Tu personal siempre en el lugar y momento correcto, sin pérdida de información.\"",
      precio: "$500",
      precio_subtitulo: "desarrollo único",
      descripcion: "Su personal tendrá en su mano la ubicación exacta, fotos y hasta las notas de voz de lo que deben hacer antes de poner un pie en la obra. Todo integrado en mapas y agendas directas.",
      entregables: [
        "Sincronización de calendarios del personal",
        "Ubicación exacta con Google Maps",
        "Guía de planificación multimedia desde campo"
      ],
      nota_especial: "Elimina la desconexión entre la administración y el equipo en obra.",
      detalles_pie: ["⚡ Operatividad en campo garantizada"]
    },
    {
      numero: "2",
      etiqueta_tiempo: "Módulo Dos · Gestión en Terreno",
      nombre: "Transparencia Total",
      eslogan: "\"Control total de la obra y comunicación en tiempo real desde el primer día.\"",
      precio: "$1,500",
      precio_subtitulo: "desarrollo único",
      descripcion: "Usted podrá ver, desde su teléfono y en tiempo real, el chat de cada proyecto, las fotos del avance y los gastos generados. El sistema se convierte en sus ojos en cada obra, sin necesidad de que usted esté ahí físicamente.",
      entregables: [
        "Chat colaborativo por proyecto",
        "Perfiles temporales para contratistas externos",
        "Registro histórico y control de gastos"
      ],
      nota_especial: "Mantiene la trazabilidad completa del proyecto a lo largo del tiempo.",
      detalles_pie: ["✅ Cero fugas de información de la obra"]
    },
    {
      numero: "3",
      etiqueta_tiempo: "Módulo Tres · Cierres Rápidos",
      nombre: "Cotice a la velocidad del rayo",
      eslogan: "\"Presupuestos profesionales emitidos en segundos, directamente desde el campo.\"",
      precio: "$500",
      precio_subtitulo: "desarrollo único",
      descripcion: "Mientras su competencia tarda días en enviar un PDF, su equipo podrá generar presupuestos profesionales en el mismo sitio de la obra, usando precios reales de su inventario.",
      entregables: [
        "Cotizador en campo vinculado a inventario",
        "Inclusión de rubros extras manuales",
        "Generación y envío de PDF al instante"
      ],
      nota_especial: "Inversión total del Ecosistema CRM: $2,500 (desarrollo a medida).",
      detalles_pie: ["📄 Profesionalismo para ganar contratos"]
    }
  ],
  cierre: {
    titulo: "El siguiente paso",
    frase_bisagra: `Sr. Leoncio, una decisión estratégica sobre infraestructura digital requiere analizarse en persona.`,
    texto: "Le propongo una visita a nuestra oficina en Loja para mostrarle la arquitectura del sistema y conversar sobre cómo se adaptará al día a día de Pisciriego. Sin presentaciones largas, sin compromisos. Solo 20 minutos para que usted decida con toda la información sobre la mesa.",
    frase_final: "Un sistema que se adapta a su proceso, <span>y no al revés.</span>",
    mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
    cta_texto: "✅ Confirmar mi visita a la oficina",
    cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, confirmo nuestra reunión en la oficina para revisar la propuesta del CRM. Soy Leoncio Ramón de Pisciriego.`)}`,
    pie_texto: "Este no es un gasto, es una inversión en la infraestructura digital de Pisciriego."
  }
};

async function publish() {
  console.log(`\n🚀 Publicando propuesta para ${empresa}...\n`);
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
      console.log(`✅ ¡Cotización publicada con éxito!`);
      console.log(`🔗 URL: https://www.cesarreyesjaramillo.com/cotizaciones/${slug}`);
    } else {
      const txt = await resp.text();
      console.error(`❌ HTTP ${resp.status}: ${txt}`);
    }
  } catch (err) {
    console.error(`❌ Error de red: ${err.message}`);
  }
}

publish();
