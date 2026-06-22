const fetch = require('node-fetch');

// 🚀 SCRIPT DE PUBLICACIÓN - COOPERATIVA ENTRE RÍOS 360 (CON IMAGEN DE FURGONETA)
// Reemplaza el fondo por una furgoneta amarilla profesional

const slug = "cooperativa-entre-rios";
const decisor = "Jimmy Quesada";
const empresa = "Cooperativa Entre Ríos";
const unidades = "70";
// URL de furgoneta amarilla profesional
const imagen_fondo = "https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&q=80&w=2000"; 

const body = {
  id: slug,
  hero_image: imagen_fondo,
  portada: {
    etiqueta: "Ecosistema Digital Entre Ríos 360",
    titulo_principal: "Entre Ríos 360: De la Gestión Manual al Liderazgo Digital",
    titulo_destacado: `Proyecto ${empresa}:<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Potencie la eficiencia de sus ${unidades} socios y recupere el control de su tiempo.</span>`,
    subtitulo: `Estrategia de Control Operativo · Preparado para ${decisor} | Abril 2026`,
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
      `Actualmente, coordinar a ${unidades} socios y sus respectivos procesos consume gran parte de la jornada administrativa. Con Entre Ríos 360, la directiva puede supervisar toda la operación en minutos, no en horas. Es la transición definitiva hacia una gestión profesional y tecnológica.`,
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
      descripcion: `Cuenta de Comando Central para Jimmy Quesada + ${unidades} Cuentas Individuales para cada socio. Un sistema unificado donde la información fluye sin necesidad de procesos manuales.`,
      entregables: [
        "Dashboard de Comando Central (Visión 360°)",
        `${unidades} Cuentas de Socio independientes`,
        "Sistema de Alertas de Mantenimiento Automático"
      ],
      nota_especial: "Optimización total de la comunicación interna y el cumplimiento administrativo.",
      detalles_pie: ["⚡ Implementación técnica inmediata"]
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
      ],
      nota_especial: "Máxima visibilidad en calle y potencial de ingresos por publicidad.",
      detalles_pie: ["📈 Visibilidad regional garantizada"]
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
      ],
      nota_especial: "Atracción activa de contratos con empresas y grupos turísticos.",
      detalles_pie: ["🛡️ Blindaje de marca institucional"]
    }
  ],
  cierre: {
    titulo: "Liderazgo Digital en Movilidad",
    frase_bisagra: `${decisor}, Entre Ríos tiene la escala necesaria para ser la referencia absoluta del transporte profesional.`,
    texto: `Le propongo una reunión de 20 minutos para mostrarle cómo las 71 cuentas sincronizadas recuperarán su tiempo y blindarán la reputación de la cooperativa.`,
    frase_final: "Tecnología diseñada para que usted <span>vuelva a tener el control.</span>",
    mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
    cta_texto: "✅ Agendar Demostración (20 min)",
    cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, soy Jimmy de Entre Ríos. Revisemos la propuesta 360 para los 70 socios.`)}`,
    pie_texto: "Inversión única. Transformación institucional garantizada."
  }
};

async function publish() {
  console.log(`🚀 Actualizando Propuesta Entre Ríos con fondo de furgoneta...`);
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
      console.log(`✅ ¡Fondo actualizado con éxito para Entre Ríos!`);
      console.log(`🔗 URL: https://www.cesarreyesjaramillo.com/cotizaciones/cooperativa-entre-rios`);
    } else {
      const text = await resp.text();
      console.error('❌ Error publicando:', resp.status, text);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

publish();
