const fetch = require('node-fetch');

// ⚠️ ARCHIVO MAESTRO - PLANTILLA ACTIVAQR 2 (SUPERVISIÓN DE VENTAS / MAGÚ)
// Clonar este archivo a 'scripts/publish-temp.js', modificar los datos y ejecutar.

const slug = "propuesta-supervision-nacional-magu";
const decisor = "Sr. Magú";
const empresa = "Empresa de Papelería";
const vendedores = "100";
const imagen_fondo = "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2000"; // Imagen de equipo de ventas/oficina

const body = {
  id: slug,
  portada: {
    etiqueta: "Supervisión Inteligente Nacional",
    titulo_principal: "",
    titulo_destacado: `Proyecto ${empresa}:<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Tenga ojos en cada local que visiten sus ${vendedores} vendedores en las 24 provincias.</span>`,
    subtitulo: `Estrategia de Control Operativo · Preparado para ${decisor} | Abril 2026`,
    preparado_para: `${decisor}`,
    preparado_por: "Ing. César Augusto Reyes Jaramillo",
    fecha: "Abril 2026",
    imagen_url: imagen_fondo,
    url_fondo: imagen_fondo,
    url_logo_cliente: ""
  },
  introduccion: {
    titulo: "Elimine la Ceguera Operativa de su fuerza de ventas.",
    parrafos: [
      `Hoy, su empresa confía en lo que el vendedor dice que pasó en cada visita. Mañana, sabrán exactamente lo que el cliente *sintió* que pasó. No le vendemos "códigos QR", le vendemos la capacidad de estar presente en 100 visitas simultáneas sin salir de su oficina.`,
      `Contratar supervisores físicos para recorrer 24 provincias es costoso e ineficiente. ActivaQR 2 hace ese trabajo 24/7, procesando datos con IA para detectar dónde falla la presentación y dónde se ganan los cierres, permitiendo un entrenamiento quirúrgico basado en la realidad, no en suposiciones.`
    ]
  },
  etapas: [
    {
      numero: "1",
      etiqueta_tiempo: "Etapa Uno · Activación",
      nombre: "Configuración y Personalización Nacional",
      eslogan: "\"Su marca y sus parámetros de evaluación en todo el país.\"",
      precio: "$300",
      precio_subtitulo: "pago único de setup",
      descripcion: "Dejamos el sistema listo con el logo de su empresa y configuramos los parámetros específicos de evaluación que su gerencia necesite para los 100 vendedores.",
      entregables: [
        "Personalización de marca en la plataforma",
        "Configuración de métricas de desempeño",
        "Generación masiva de identificadores por vendedor"
      ],
      nota_especial: "Inversión inicial por única vez para control total.",
      detalles_pie: ["⚡ Implementación inmediata"]
    },
    {
      numero: "2",
      etiqueta_tiempo: "Etapa Dos · Supervisión IA",
      nombre: "Licencia de Monitoreo Inteligente",
      eslogan: "\"IA analizando sentimientos en cada punto de contacto.\"",
      precio: "$8.87",
      precio_subtitulo: `mensual / por vendedor (Total: $887)`,
      descripcion: `Acceso al dashboard de control donde la IA procesa al instante los reportes de los ${vendedores} vendedores. Reciba alertas inmediatas de quejas graves y rankings de desempeño por provincia.`,
      entregables: [
        "Panel de control gerencial 24/7",
        "Análisis de sentimiento por Inteligencia Artificial",
        "Alertas de incidentes críticos en tiempo real"
      ],
      nota_especial: "El costo de supervisión más bajo del mercado nacional.",
      detalles_pie: ["📈 Datos reales para decisiones rápidas"]
    },
    {
      numero: "3",
      etiqueta_tiempo: "Etapa Tres · Reputación",
      nombre: "Blindaje de Marca y Fidelización",
      eslogan: "\"Que un mal servicio en una provincia no dañe su nombre nacional.\"",
      precio: "Incluido",
      precio_subtitulo: "sin costo adicional",
      descripcion: "Utilizamos la data para premiar a los mejores vendedores y corregir a tiempo los puntos débiles. Incluye el sistema de incentivos para asegurar que el cliente final participe en el reporte.",
      entregables: [
        "Sistema de incentivos para clientes finales",
        "Reportes ejecutivos de reputación",
        "Banco de testimonios positivos para marketing"
      ],
      nota_especial: "Proteja su inversión nacional con evidencia real.",
      detalles_pie: ["🛡️ Seguridad reputacional"]
    }
  ],
  cierre: {
    titulo: "El argumento de Supervivencia",
    frase_bisagra: `Magú, hoy tu empresa está sorda y ciega en la calle. Es hora de recuperar los ojos.`,
    texto: `Le propongo una videollamada de 20 minutos para mostrarle el dashboard de IA funcionando y cómo recibirá los reportes de sus vendedores en Ambato, Quito o Guayaquil al instante.`,
    frase_final: "Un sistema que hace el trabajo de 24 supervisores <span>por el costo de uno.</span>",
    mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
    cta_texto: "✅ Agendar demostración de 20 min",
    cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, me interesa la Supervisión Inteligente para los 100 vendedores. Hablemos.`)}`,
    pie_texto: "Inversión escalable. Resultados medibles desde el primer día."
  }
};

async function publish() {
  console.log(`🚀 Publicando Propuesta (Supervisión Nacional) para ${empresa}...`);
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
    const text = await resp.text();
    console.error('❌ Error publicando:', resp.status, text);
  }
}

publish();
