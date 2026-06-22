const fetch = require('node-fetch');

// ⚠️ ARCHIVO MAESTRO - PLANTILLA CLÍNICA
// Clonar este archivo a 'scripts/publish-temp.js', modificar los datos y ejecutar.

const slug = "propuesta-clinica-ejemplo";
const decisor = "Dr. Claudio Abendaño";
const empresa = "Clínica Abendaño";
const imagen_fondo = "https://cesarweb.b-cdn.net/activaqr/clinica_abenda%C3%B1o.webp"; // Cambiar por la imagen del cliente

const body = {
  id: slug,
  portada: {
    etiqueta: "Propuesta de Posicionamiento Web",
    titulo_principal: `La ${empresa} merece estar a la altura de su nombre.`,
    titulo_destacado: "Ser el primer resultado en Google.",
    subtitulo: `Preparado para el ${decisor} | Abril 2026`,
    preparado_para: `${decisor}`,
    preparado_por: "Ing. César Augusto Reyes Jaramillo",
    fecha: "Abril 2026",
    imagen_url: imagen_fondo,
    url_fondo: imagen_fondo,
    url_logo_cliente: ""
  },
  introduccion: {
    titulo: "Es el momento de ganar también en lo digital.",
    parrafos: [
      `La ${empresa} tiene lo que ninguna campaña de marketing puede fabricar: años de trayectoria, una especialidad única en la región y una comunidad de pacientes que confía en usted. Lo que existe hoy en internet no refleja eso — y eso tiene solución.`,
      `Esta propuesta está diseñada en etapas progresivas. Usted decide hasta dónde llegar, cuándo avanzar y quién ejecuta cada fase. Mi rol es asegurar que cada paso sea técnicamente correcto, estratégicamente coherente y medible en resultados reales.`
    ]
  },
  etapas: [
    {
      numero: "0",
      etiqueta_tiempo: "Etapa Cero · Diagnóstico",
      nombre: "Consultoría Estratégica Digital",
      eslogan: "\"Primero el diagnóstico. Luego, la inversión.\"",
      precio: "$3,500",
      precio_subtitulo: "servicio completo",
      descripcion: "Antes de construir, estudiamos su mercado y sus pacientes ideales. El resultado es una hoja de ruta que convierte cada paso siguiente en una inversión calculada.",
      entregables: [
        "Estudio de competencia directa",
        "Análisis de palabras clave reales",
        "Plan estratégico de posicionamiento"
      ],
      nota_especial: "Etapa independiente: si decide ejecutar con su equipo, el plan es suyo.",
      detalles_pie: ["⏱️ 4–5 semanas"]
    },
    {
      numero: "1",
      etiqueta_tiempo: "Etapa Uno · Arquitectura",
      nombre: "Arquitectura Web Profesional",
      eslogan: "\"Un sitio construido para agendar citas, no solo para verse bien.\"",
      precio: "$1,000",
      precio_subtitulo: "hasta 40 páginas",
      descripcion: "Con el estudio en mano, construimos el sitio web. Cada botón y cada palabra tiene un propósito: convertir la visita de un paciente en una cita agendada.",
      entregables: [
        "Sitio web de alto rendimiento",
        "SEO técnico avanzado",
        "Integración con WhatsApp"
      ],
      nota_especial: "Los entregables se basan en los hallazgos de la Etapa Cero.",
      detalles_pie: ["✅ Carga ultra-rápida"]
    },
    {
      numero: "2",
      etiqueta_tiempo: "Etapa Dos · Tráfico",
      nombre: "Sistema de Automatización",
      eslogan: "\"Contenido atrayendo pacientes 24/7.\"",
      precio: "$2,500",
      precio_subtitulo: "licencia + configuración",
      descripcion: "Software configurado a medida que distribuye contenido SEO de forma automática para asegurar que aparezca cuando el paciente busca su especialidad.",
      entregables: [
        "Software configurado e integrado",
        "Artículos iniciales optimizados",
        "Primer mes de gestión SEO"
      ],
      nota_especial: "Ahorro estimado en agencias tradicionales: $5.000 anuales.",
      detalles_pie: ["🔄 Tráfico continuo"]
    },
    {
      numero: "3",
      etiqueta_tiempo: "Etapa Tres · Control",
      nombre: "Dirección Técnica Mensual",
      eslogan: "\"Resultados medibles cada mes.\"",
      precio: "$650",
      precio_subtitulo: "por mes",
      descripcion: "Un director técnico dedicado que coordina, supervisa y rinde cuentas directamente a usted, garantizando que el ecosistema crezca.",
      entregables: [
        "Dirección técnica permanente",
        "Monitoreo continuo de resultados",
        "Reporte ejecutivo mensual"
      ],
      nota_especial: "Garantía de ejecución sobre la hoja de ruta.",
      detalles_pie: ["📊 Crecimiento sostenible"]
    }
  ],
  cierre: {
    titulo: "El siguiente paso",
    frase_bisagra: `${decisor}, la autoridad médica ya la tiene. Ahora debemos reflejarla digitalmente.`,
    texto: `Le propongo 45 minutos para revisar juntos esta propuesta en su consultorio, resolver cualquier duda y definir por dónde empezamos.`,
    frase_final: "Usted no necesita una página web. Necesita que su nombre aparezca <span>primero.</span>",
    mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
    cta_texto: "✅ Confirmar reunión",
    cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, confirmo nuestra reunión para revisar la propuesta de ${empresa}.`)}`,
    pie_texto: "Sin compromisos iniciales. Analicemos los números juntos."
  }
};

async function publish() {
  console.log(`🚀 Publicando Propuesta (Plantilla Clínica) para ${empresa}...`);
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
    console.log(`🔗 URL: https://cesarreyesjaramillo.com/cotizaciones/${slug}`);
  } else {
    const text = await resp.text();
    console.error('❌ Error publicando:', resp.status, text);
  }
}

// publish(); // DESCOMENTAR PARA PUBLICAR
