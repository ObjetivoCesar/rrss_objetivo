const fetch = require('node-fetch');

async function publish(body, name) {
  console.log(`🚀 Forzando Actualización de Metadata para ${name}...`);
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
      console.log(`✅ ¡Propuesta de ${name} actualizada con éxito!`);
    } else {
      const text = await resp.text();
      console.error(`❌ Error publicando ${name}:`, resp.status, text);
    }
  } catch (error) {
    console.error(`❌ Error de conexión para ${name}:`, error.message);
  }
}

// ENTRE RÍOS
const imgEntreRios = "https://cesarweb.b-cdn.net/activaqr/cooperativa_entre_rios_loja_v2.png";
const bodyEntreRios = {
  id: "cooperativa-entre-rios",
  hero_image: imgEntreRios,
  og_image: imgEntreRios, // Campo extra para OpenGraph
  image: imgEntreRios,    // Campo extra para preview
  thumbnail: imgEntreRios, // Campo extra para preview
  portada: {
    etiqueta: "Ecosistema Digital Entre Ríos 360",
    titulo_principal: "Entre Ríos 360: De la Gestión Manual al Liderazgo Digital",
    titulo_destacado: `Proyecto Cooperativa Entre Ríos:<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Potencie la eficiencia de sus 70 socios y recupere el control de su tiempo.</span>`,
    subtitulo: `Estrategia de Control Operativo · Preparado para Jimmy Quesada | Abril 2026`,
    preparado_para: "Jimmy Quesada",
    preparado_por: "Ing. César Augusto Reyes Jaramillo",
    fecha: "Abril 2026",
    imagen_url: imgEntreRios,
    url_fondo: imgEntreRios
  },
  introduccion: {
    titulo: "Elimine la carga administrativa y lidere con datos.",
    parrafos: [
      "Actualmente, coordinar a 70 socios y sus respectivos procesos consume gran parte de la jornada administrativa. Con Entre Ríos 360, la directiva puede supervisar toda la operación en minutos, no en horas. Es la transición definitiva hacia una gestión profesional y tecnológica.",
      "Además, posicionamos las 70 unidades como la red de visibilidad más grande de la región, asegurando que Entre Ríos sea la referencia en Google tanto para transporte escolar como para rutas turísticas institucionales."
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
      descripcion: "Cuenta de Comando Central para Jimmy Quesada + 70 Cuentas Individuales para cada socio. Un sistema unificado donde la información fluye sin necesidad de procesos manuales.",
      entregables: [
        "Dashboard de Comando Central (Visión 360°)",
        "70 Cuentas de Socio independientes",
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
      descripcion: "Transformación de las 70 unidades en puntos de información digital masiva. Promoción de servicios, precios y rutas turísticas ante la ciudadanía de forma profesional.",
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
    frase_bisagra: "Jimmy, Entre Ríos tiene la escala necesaria para ser la referencia absoluta del transporte profesional.",
    texto: "Le propongo una reunión de 20 minutos para mostrarle cómo las 71 cuentas sincronizadas recuperarán su tiempo y blindarán la reputación de la cooperativa.",
    cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, soy Jimmy de Entre Ríos. Revisemos la propuesta 360 para los 70 socios.`)}`
  }
};

// ESTOSUR
const imgEstosur = "https://cesarweb.b-cdn.net/activaqr/cooperativa_estosur_loja_v2.png";
const bodyEstosur = {
  id: "cooperativa-estosur",
  hero_image: imgEstosur,
  og_image: imgEstosur,
  image: imgEstosur,
  thumbnail: imgEstosur,
  portada: {
    etiqueta: "Ecosistema Digital Estosur 360",
    titulo_principal: "Estosur 360: De la Gestión Manual al Liderazgo Digital",
    titulo_destacado: `Proyecto Cooperativa Estosur:<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Recupere el control de su tiempo and modernice la operación de sus 15 unidades.</span>`,
    subtitulo: "Estrategia de Control Operativo · Preparado para Vanessa Salcedo | Mayo 2026",
    preparado_para: "Vanessa Salcedo",
    preparado_por: "Ing. César Augusto Reyes Jaramillo",
    fecha: "Mayo 2026",
    imagen_url: imgEstosur,
    url_fondo: imgEstosur
  },
  introduccion: {
    titulo: "Elimine la carga administrativa y recupere su tiempo.",
    parrafos: [
      "Actualmente, la directiva de Estosur dedica gran parte de su jornada a organizar socios y procesos que hoy viven en papel. Con Estosur 360, la directiva puede supervisar toda la operación en minutos, no en horas. No es solo software, es la capacidad de liderar con datos reales y precisos.",
      "Además, convertimos sus 15 unidades en el canal de comunicación más potente de Loja, posicionando a Estosur no solo en el sector escolar, sino también en el turístico ante empresas y turistas que buscan seguridad y profesionalismo garantizado."
    ]
  },
  etapas: [
    {
      numero: "1",
      etiqueta_tiempo: "Nodo Uno · Eficiencia",
      nombre: "Software Administrativo + Dashboard",
      eslogan: "\"Ahorro de tiempo real para la directiva y cada socio.\"",
      precio: "Consultar en reunión",
      precio_subtitulo: "(Combo Ecosistema 360)",
      descripcion: "Cuenta de Comando Central para la directiva + 15 Cuentas Individuales para cada socio. Un sistema unificado donde el control es total y la información es transparente.",
      entregables: [
        "Dashboard de Comando Central (Visión 360°)",
        "15 Cuentas de Socio independientes",
        "Sistema de Alertas de Mantenimiento Preventivo"
      ]
    },
    {
      numero: "2",
      etiqueta_tiempo: "Nodo Dos · Visibilidad",
      nombre: "Infraestructura QR + Vitrina Digital",
      eslogan: "\"Su empresa comunicando servicios y rutas en todo momento.\"",
      precio: "Consultar en reunión",
      precio_subtitulo: "(Combo Ecosistema 360)",
      descripcion: "Transformación de las 15 unidades en puntos de información digital. Permite promocionar servicios, precios y contactos ante la ciudadanía y turistas de forma profesional.",
      entregables: [
        "Códigos QR de alta durabilidad por unidad",
        "Vitrina digital interactiva de Estosur",
        "Canal oficial de contacto y promoción"
      ]
    },
    {
      numero: "3",
      etiqueta_tiempo: "Nodo Tres · Autoridad",
      nombre: "Estrategia SEO y Autoridad (Google)",
      eslogan: "\"La infraestructura técnica para ser la referencia en Loja.\"",
      precio: "Consultar en reunión",
      precio_subtitulo: "(Combo Ecosistema 360)",
      descripcion: "Implementación de la arquitectura técnica para que Estosur sea altamente visible ante búsquedas de transporte escolar y rutas turísticas en la región.",
      entregables: [
        "Optimización para búsquedas en Google",
        "Landing page corporativa de alta conversión",
        "Estrategia de autoridad digital profesional"
      ]
    }
  ],
  cierre: {
    titulo: "Hacia una Cooperativa Inteligente",
    frase_bisagra: "Vanessa, el valor real de esta transformación se apreciará en su totalidad durante nuestra demostración técnica.",
    texto: "Le propongo una reunión presencial en su oficina para mediados de mayo. En 20 minutos le mostraré el sistema de calificación de socios mediante QR y el potencial de las 16 cuentas sincronizadas trabajando para usted.",
    cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, soy Vanessa de Estosur. Agendemos la reunión para mediados de mayo para revisar el Ecosistema 360 (15+1 cuentas).`)}`
  }
};

async function main() {
  await publish(bodyEntreRios, "Entre Ríos");
  await publish(bodyEstosur, "Estosur");
}

main();
