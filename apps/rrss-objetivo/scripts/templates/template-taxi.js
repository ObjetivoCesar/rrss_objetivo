const fetch = require('node-fetch');

const COOPERATIVAS = [
  { coop: "Central",                slug: "propuesta-taxi-central-2026",                presi: "Pablo Palacios Salinas",   gerente: "Marco Calle" },
  { coop: "18 de Noviembre",        slug: "propuesta-taxi-18-de-noviembre-2026",        presi: "Juan Ordoñez Guadalima",   gerente: "Afranio Matamoros" },
  { coop: "La Tebaida",             slug: "propuesta-taxi-la-tebaida-2026",             presi: "Darlin Montaño Japon",     gerente: "Iván Tapia Godoy" },
  { coop: "Isidro Ayora",           slug: "propuesta-taxi-isidro-ayora-2026",           presi: "Floro Iñiguez Gonzalez",   gerente: "Marco Medina Angamarca" },
  { coop: "Ciudad de Mercadillo",   slug: "propuesta-taxi-ciudad-de-mercadillo-2026",   presi: "Luis Paute Zhingre",       gerente: "Edwin Quezada Ordoñez" },
  { coop: "Las Palmas",             slug: "propuesta-taxi-las-palmas-2026",             presi: "Luis Granda Aguilar",      gerente: "Maribel Banegas" },
  { coop: "Cristóbal Ojeda Dávila", slug: "propuesta-taxi-cristobal-ojeda-davila-2026", presi: "Fausto Criollo Flores",    gerente: "Byron Yaguana" },
  { coop: "Miguel Riofrío",         slug: "propuesta-taxi-miguel-riofrio-2026",         presi: "Oscar Castillo Moreno",    gerente: "Luis Gonzalez" },
  { coop: "Ciudadela del Maestro",  slug: "propuesta-taxi-ciudadela-del-maestro-2026",  presi: "Richard Macas Beltran",    gerente: "Maria Tacuri" },
  { coop: "La Pradera",             slug: "propuesta-taxi-la-pradera-2026",             presi: "Juan Carlos Velez",        gerente: "Michael Veintimilla" },
  { coop: "Libertadores Loxa",      slug: "propuesta-taxi-libertadores-loxa-2026",      presi: "Walter Cuenca Carrion",    gerente: "Franklin Bustamante" },
  { coop: "El Valle",               slug: "propuesta-taxi-el-valle-2026",               presi: "Jorge Jaramillo Arizaga",  gerente: "Luis Bravo" },
  { coop: "Benjamín Carrión",       slug: "propuesta-taxi-benjamin-carrión-2026",       presi: "Pedro Jumbo Ramos",        gerente: "Thalia Pasaca" },
  { coop: "La Universitaria",       slug: "propuesta-taxi-la-universitaria-2026",       presi: "Manuel Romero Guzman",     gerente: "German Espinosa" },
  { coop: "Yahurcuna",              slug: "propuesta-taxi-yahurcuna-2026",              presi: "German Tamayo Jaramillo",  gerente: "Jackeline Toro" },
];

function buildBody({ coop, slug, presi, gerente }) {
  return {
    id: slug,
    portada: {
      etiqueta: "Sistema de Respaldo para la Directiva",
      // HERO: coop en amarillo arriba, frase de soporte en blanco abajo
      titulo_principal: "",
      titulo_destacado: `Cooperativa ${coop}<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">merece que su directiva tenga las pruebas para actuar con justicia.</span>`,
      subtitulo: `Preparado para el Sr. ${presi} y el Sr. ${gerente} | Abril 2026`,
      preparado_para: `Sr. ${presi} y Sr. ${gerente}`,
      preparado_por: "Ing. César Augusto Reyes Jaramillo",
      fecha: "Abril 2026",
      imagen_url: "https://cesarweb.b-cdn.net/activaqr/entrda%20a%20la%20ciudad%20de%20loja-%20taxismo.webp",
      url_fondo: "https://cesarweb.b-cdn.net/activaqr/entrda%20a%20la%20ciudad%20de%20loja-%20taxismo.webp",
      url_logo_cliente: ""
    },
    introduccion: {
      titulo: "La supervivencia del taxi formal es un tema de control.",
      parrafos: [
        `Sr. ${presi} y Sr. ${gerente}, ustedes conocen su flota mejor que nadie. Saben quién trabaja bien y quién genera problemas. El desafío no es saber — es poder actuar con respaldo.`,
        "ActivaQR le entrega a la directiva exactamente eso: evidencia real, automática y organizada, para que cada decisión esté respaldada por hechos y no por versiones. Menos conflictos internos. Más autoridad con los socios."
      ]
    },
    etapas: [
      {
        numero: "1",
        etiqueta_tiempo: "Etapa Uno · Configuración Digital",
        nombre: "Activación de Control por Unidad",
        eslogan: "\"Su presencia en cada cabina, sin estar ahí.\"",
        precio: "$300",
        precio_subtitulo: "configuración de plataforma",
        descripcion: "Configuración personalizada de la plataforma con códigos QR únicos por unidad, vinculados a la identidad de la cooperativa. El pasajero escanea con su celular y reporta directamente a la gerencia en segundos — sin descargar ninguna app.",
        entregables: [
          "QR digital único por cada unidad activa",
          "Canal directo de reportes a la gerencia",
          "Activación de alertas por WhatsApp"
        ],
        nota_especial: "Lista para operar en 48 horas desde la aprobación.",
        detalles_pie: ["⚡ Sin instalaciones complejas"]
      },
      {
        numero: "2",
        etiqueta_tiempo: "Etapa Dos · Inteligencia",
        nombre: "Su Centro de Mando",
        eslogan: "\"Datos reales para la asamblea.\"",
        precio: "$9.80",
        precio_subtitulo: "mensual por unidad (Plan Flota)",
        descripcion: "Acceso 24/7 a nuestro dashboard donde usted y la directiva verán el ranking de sus socios. Sabrá exactamente quién merece una felicitación y quién necesita una sanción con pruebas irrefutables.",
        entregables: [
          "Acceso Dashboard Gerencial 24/7",
          "Ranking mensual de calidad de socios",
          "Métricas de servicio y velocidad"
        ],
        nota_especial: "Costo escalable según el número exacto de socios activos.",
        detalles_pie: ["✅ Soporte técnico incluido"]
      },
      {
        numero: "3",
        etiqueta_tiempo: "Etapa Tres · Respaldo Jurídico",
        nombre: "Blindaje Legal y Reputacional",
        eslogan: "\"Evidencia que protege. Testimonios que venden.\"",
        precio: "Incluido",
        precio_subtitulo: "sin costo extra",
        descripcion: "Cada reporte negativo genera un expediente PDF con fecha y hora inalterable para respaldar sanciones. Cada viaje de 5 estrellas alimenta un perfil digital que da seguridad instantánea al pasajero.",
        entregables: [
          "Generación automática de PDFs de sanción",
          "Perfil digital público (VCard) del socio",
          "Banco de testimonios positivos"
        ],
        nota_especial: "Fundamental para procesos disciplinarios internos.",
        detalles_pie: ["📄 Respaldo total para la directiva"]
      }
    ],
    cierre: {
      titulo: "El siguiente paso",
      frase_bisagra: `Sr. ${presi} y Sr. ${gerente}, esto no requiere una decisión grande. Solo requiere 20 minutos.`,
      texto: "Le propongo una visita a nuestra oficina en Loja para mostrarle el sistema funcionando en vivo. Sin presentaciones largas, sin compromisos. Solo 20 minutos para que ustedes decidan con lo que ven, no con lo que yo les cuento.",
      frase_final: "Quien tiene los datos, <span>tiene el poder en la asamblea.</span>",
      mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
      cta_texto: "✅ Confirmar mi visita a la oficina",
      cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Confirmamos nuestra visita a la oficina de ActivaQR. Somos el Sr. ${presi} y el Sr. ${gerente} de la Cooperativa ${coop}.`)}`,
      pie_texto: "Sin contratos de entrada. Sin compromisos. Solo la reunión."
    }
  };
}

async function publishOne({ coop, slug, presi, gerente }) {
  const body = buildBody({ coop, slug, presi, gerente });
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
      console.log(`✅ [${coop}] → https://www.cesarreyesjaramillo.com/cotizaciones/${slug}`);
    } else {
      const txt = await resp.text();
      console.error(`❌ [${coop}] HTTP ${resp.status}: ${txt}`);
    }
  } catch (err) {
    console.error(`❌ [${coop}] Error de red: ${err.message}`);
  }
}

async function publishAll() {
  console.log(`\n🚀 Publicando ${COOPERATIVAS.length} cooperativas — versión con Presidente + Gerente...\n`);
  for (const item of COOPERATIVAS) {
    await publishOne(item);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('\n🏁 ¡Todas publicadas!');
}

publishAll();
