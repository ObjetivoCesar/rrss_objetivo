const fetch = require('node-fetch');

// 🚀 PROPUESTA ENTRE RÍOS FINAL - MÉTODO ESTOSUR (CON UNPLASH)
const slug = "propuesta-entre-rios-final-2026";
const decisor = "Jimmy Quezada";
const empresa = "Cooperativa Entre Ríos";
const unidades = "70";

// Usamos Unsplash porque WhatsApp confía más en sus headers que en BunnyCDN
const imagen_fondo = "https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&q=80&w=2000";

const body = {
  id: slug,
  // NO usamos hero_image en la raíz para seguir el patrón de Estosur que funcionó
  portada: {
    etiqueta: "Ecosistema Digital Entre Ríos 360",
    titulo_principal: "Entre Ríos 360: De la Gestión Manual al Liderazgo Digital",
    titulo_destacado: `Proyecto ${empresa}`,
    subtitulo: `Preparado para ${decisor} | Abril 2026`,
    preparado_para: `${decisor}`,
    preparado_por: "Ing. César Augusto Reyes Jaramillo",
    fecha: "Abril 2026",
    imagen_url: imagen_fondo,
    url_fondo: imagen_fondo,
    url_logo_cliente: ""
  },
  introduccion: {
    titulo: "Elimine la carga administrativa y lidere con datos.",
    parrafos: [
      `${decisor}, coordinar a ${unidades} socios y sus respectivos procesos consume gran parte de la jornada administrativa. Con Entre Ríos 360, la directiva puede supervisar toda la operación en minutos, no en horas. Es la transición definitiva hacia una gestión profesional y tecnológica.`,
      `Además, posicionamos las ${unidades} unidades como la red de visibilidad más grande de la región, asegurando que Entre Ríos sea la referencia en Google tanto para transporte escolar como para rutas turísticas institucionales.`
    ]
  },
  etapas: [
    {
      numero: "1",
      etiqueta_tiempo: "Nodo Uno · Eficiencia",
      nombre: "Software Administrativo + Dashboard",
      eslogan: "\"Ahorro de tiempo real para la gerencia y sus 70 socios.\"",
      precio: "Consultar en reunión",
      precio_subtitulo: "(Combo Ecosistema 360)",
      descripcion: `Cuenta de Comando Central para ${decisor} + ${unidades} Cuentas Individuales para cada socio. Un sistema unificado donde la información fluye sin necesidad de procesos manuales.`,
      entregables: [
        "Dashboard de Comando Central (Visión 360°)",
        `${unidades} Cuentas de Socio independientes`,
        "Sistema de Alertas de Mantenimiento Automático"
      ]
    },
    {
      numero: "2",
      etiqueta_tiempo: "Nodo Dos · Visibilidad",
      nombre: "Infraestructura QR + Vitrina Digital",
      eslogan: "\"70 unidades comunicando su autoridad en todo momento.\"",
      precio: "Consultar en reunión",
      precio_subtitulo: "(Combo Ecosistema 360)",
      descripcion: `Transformación de las ${unidades} unidades en puntos de información digital masiva. Promoción de servicios, precios y rutas turísticas ante la ciudadanía de forma profesional.`,
      entregables: [
        "Códigos QR de alta durabilidad en cada unidad",
        "Vitrina digital interactiva de Entre Ríos",
        "Canal oficial de contacto y captación de clientes"
      ]
    },
    {
      numero: "3",
      etiqueta_tiempo: "Nodo Tres · Autoridad",
      nombre: "Estrategia SEO y Autoridad (Google)",
      eslogan: "\"La infraestructura técnica para dominar el mercado regional.\"",
      precio: "Consultar en reunión",
      precio_subtitulo: "(Combo Ecosistema 360)",
      descripcion: "Implementación técnica para asegurar que Entre Ríos aparezca en los primeros resultados de búsqueda para transporte seguro y profesional en la zona.",
      entregables: [
        "Optimización avanzada para Google",
        "Landing page corporativa de alto impacto",
        "Estrategia de autoridad digital regional"
      ]
    }
  ],
  cierre: {
    titulo: "Liderazgo Digital en Movilidad",
    texto: `${decisor}, le propongo una reunión de 20 minutos para mostrarle cómo las 71 cuentas sincronizadas recuperarán su tiempo y blindarán la reputación de la cooperativa.`,
    frase_final: "Usted no necesita más vigilancia. Necesita que el sistema de <span>calidad trabaje solo.</span>",
    cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, soy Jimmy Quezada de Entre Ríos. Revisemos la propuesta 360 para los 70 socios.`)}`
  }
};

async function publish() {
  console.log(`🚀 Publicando Propuesta Entre Ríos con método Estosur (Unsplash)...`);
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
      console.log(`✅ ¡Propuesta publicada con éxito!`);
      console.log(`🔗 URL: https://www.cesarreyesjaramillo.com/cotizaciones/${slug}`);
    } else {
      const text = await resp.text();
      console.error('❌ Error:', resp.status, text);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

publish();
