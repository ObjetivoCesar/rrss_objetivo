const fetch = require('node-fetch');

function buildBody() {
  return {
    id: "propuesta-rosso-2026",
    portada: {
      etiqueta: "Propuesta Comercial",
      titulo_principal: "",
      titulo_destacado: `ROSSO BAR<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Un clásico de Loja, con historia desde el 2000, merece una presencia digital de autoridad.</span>`,
      subtitulo: `Preparado para David Morocho | Mayo 2026`,
      preparado_para: `David Morocho`,
      preparado_por: "Ing. César Augusto Reyes Jaramillo",
      fecha: "Mayo 2026",
      imagen_url: "https://cesarweb.b-cdn.net/activaqr/rosso-since-2000.png", 
      url_fondo: "https://cesarweb.b-cdn.net/activaqr/rosso-since-2000.png",
      url_logo_cliente: ""
    },
    introduccion: {
      titulo: "La autoridad se demuestra, no solo se cuenta.",
      parrafos: [
        `David, tú sabes mejor que nadie lo que significa mantener un negocio funcionando desde el año 2000. Rosso no es solo un bar, es una marca reconocida y un clásico de la noche lojana.`,
        "Esa autoridad comercial y toda esa historia necesitan reflejarse con fuerza en internet. Esta propuesta está diseñada para unificar el legado de Rosso y la proyección del Burger en una sola plataforma web: rosso.com (o rossobar.com). Un ecosistema digital donde tú tienes el control absoluto, demostrando por qué son los mejores."
      ]
    },
    etapas: [
      {
        numero: "1",
        etiqueta_tiempo: "Fase Uno · Desarrollo Tecnológico",
        nombre: "Sitio Web (rosso.com)",
        eslogan: "\"Tu ecosistema, tu historia, bajo tu propio dominio.\"",
        precio: "$500",
        precio_subtitulo: "desarrollo completo",
        descripcion: "Un sitio web de primer nivel diseñado para transmitir la experiencia del bar y la calidad del Burger. La gran ventaja: una portada principal 100% dinámica. Ingresas con tu contraseña desde el celular y cambias la foto principal, anuncias eventos o lanzas promociones en segundos.",
        entregables: [
          "Diseño Premium (aprox. 8 páginas)",
          "Portada Dinámica Administrable (Vía Celular)",
          "Integración de historia, menú y eventos"
        ],
        nota_especial: "Entrega inicial en 7 días laborables.",
        detalles_pie: ["⚡ Sin dependencia de terceros para actualizar"]
      },
      {
        numero: "2",
        etiqueta_tiempo: "Fase Dos · Respaldo Jurídico",
        nombre: "Blindaje de Protección de Datos",
        eslogan: "\"Seguridad legal para ti y tus clientes.\"",
        precio: "$300",
        precio_subtitulo: "implementación única",
        descripcion: "Implementación integral de todos los protocolos y políticas de privacidad y manejo de información. Esto blinda a tus dos negocios legalmente frente al manejo de bases de datos de clientes, cumpliendo estrictamente con la normativa vigente.",
        entregables: [
          "Políticas de Privacidad",
          "Términos y Condiciones",
          "Avisos legales integrados en web"
        ],
        nota_especial: "Requisito fundamental para operar sin riesgos de multas.",
        detalles_pie: ["✅ 100% alineado a la ley actual"]
      },
      {
        numero: "🎁",
        etiqueta_tiempo: "Bono de Cortesía",
        nombre: "Contacto Digital Premium",
        eslogan: "\"Conexión rápida y directa.\"",
        precio: "Incluido",
        precio_subtitulo: "sin costo extra",
        descripcion: "Como valor agregado por nuestra amistad de años, incluyo la configuración completa de un sistema de Contacto Digital. Ideal para facilitar reservaciones y centralizar la comunicación de los clientes que lleguen desde redes sociales.",
        entregables: [
          "Enlace rápido multiplataforma",
          "Botones integrados de WhatsApp/Redes",
          "Optimización de ruta de reservas"
        ],
        nota_especial: "Instalado y configurado desde el día 1.",
        detalles_pie: ["🔥 Beneficio Exclusivo"]
      }
    ],
    cierre: {
      titulo: "El Plan de Acción (Trato de Amigos)",
      frase_bisagra: `David, conocemos nuestra trayectoria. Vamos a hacer esto sencillo para arrancar y potenciar el negocio de inmediato.`,
      texto: "Te propongo un esquema fácil: 50% de entrada para iniciar el proyecto ahora mismo. El saldo restante te lo financio a 4 meses, totalmente sin intereses. ",
      frase_final: "Una marca consolidada desde el 2000 merece <span>la mejor tecnología del 2026.</span>",
      mapa_url: "",
      cta_texto: "✅ ¡Empecemos el proyecto!",
      cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`César, revisé la propuesta web. Arranquemos con el proyecto de Rosso y el Burger.`)}`,
      pie_texto: "Sin trámites complejos. Aprobamos y empezamos."
    }
  };
}

async function publishOne() {
  const body = buildBody();
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
      console.log(`✅ [Rosso Bar] → https://www.cesarreyesjaramillo.com/cotizaciones/${body.id}`);
    } else {
      const txt = await resp.text();
      console.error(`❌ [Rosso Bar] HTTP ${resp.status}: ${txt}`);
    }
  } catch (err) {
    console.error(`❌ [Rosso Bar] Error de red: ${err.message}`);
  }
}

publishOne();
