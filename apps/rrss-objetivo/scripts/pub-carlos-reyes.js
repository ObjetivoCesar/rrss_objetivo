const fetch = require('node-fetch');

// 🚀 PROPUESTA CARLOS RAFAEL REYES - CRM
const slug = "carlos-rafael-reyes-crm-2026";

const body = {
  id: slug,
  portada: {
    etiqueta: "Sistema CRM a Medida",
    titulo_principal: "Gestión Integral de Leads, Agenda y Redes Sociales",
    titulo_destacado: "Ing. Carlos Rafael Reyes",
    subtitulo: "Propuesta técnica y comercial | Junio 2026",
    preparado_para: "Ing. Carlos Rafael Reyes",
    preparado_por: "César Reyes Jaramillo",
    fecha: "Junio 2026",
    imagen_url: "",
    url_fondo: "",
    url_logo_cliente: ""
  },
  introduccion: {
    titulo: "Centralice su atención, organice su agenda y derive sin perder oportunidades.",
    parrafos: [
      "Ing. Carlos, gestionar un negocio con múltiples canales de comunicación (WhatsApp, redes sociales, página web) sin un sistema centralizado genera pérdida de leads, olvidos en seguimientos y derivaciones desorganizadas.",
      "Le presento dos opciones diseñadas a su medida: un CRM básico para comenzar con el control de leads y agenda, o un sistema completo que además integra la gestión de sus redes sociales desde un solo lugar."
    ]
  },
  opciones: [
    {
      numero: "1",
      nombre: "CRM Básico — Gestión de Leads y Agenda",
      eslogan: "Control total de leads, agenda y mensajería.",
      precio: "$850",
      precio_nota: "Pago único",
      tiempo_entrega: "1 mes",
      garantia: "6 meses",
      items: [
        "Módulo de Leads de WhatsApp (captura, segmentación, historial)",
        "Módulo de Agenda y Recordatorios (calendario, notificaciones)",
        "Módulo de Redirección de Mensajería (derivación inteligente)",
        "API REST personalizada + Base de datos independiente",
        "Panel de administración web"
      ],
      no_incluye: [
        "Módulo de redes sociales",
        "Integración con Facebook/Instagram"
      ]
    },
    {
      numero: "2",
      nombre: "CRM Completo + Módulo de Redes Sociales",
      eslogan: "Todo lo anterior + gestión integral de redes sociales.",
      precio: "$1,400",
      precio_nota: "Pago único",
      tiempo_entrega: "3 meses",
      garantia: "6 meses",
      items: [
        "Todos los módulos del CRM Básico",
        "Planificador de publicaciones (calendarización)",
        "Integración con Facebook Business",
        "Integración con Instagram",
        "Integración con WhatsApp Business API",
        "Gestión de comentarios y mensajes desde un solo lugar",
        "Atribución de leads de redes sociales al CRM",
        "Reportes y Analytics (engagement, conversión, ROI)"
      ],
      no_incluye: [
        "Creación de contenido",
        "Campañas pagadas de ads",
        "Nuevos módulos no especificados"
      ],
      nota: "APIs de terceros (Meta, WhatsApp, scheduling) incluidas en la integración."
    }
  ],
  garantia: {
    titulo: "Garantía",
    descripcion: "6 meses por defectos de programación. No incluye nuevos módulos ni cambios de alcance."
  },
  forma_pago: {
    titulo: "Forma de Pago",
    items: [
      "50% anticipo al inicio del proyecto",
      "50% restante a la entrega final"
    ]
  },
  cta: {
    titulo: "¿Comenzamos?",
    descripcion: "Agendemos una videollamada para revisar los detalles y definir cuál plan se ajusta mejor a sus necesidades.",
    whatsapp: "https://wa.me/593963410409"
  },
  footer: {
    preparado_por: "César Reyes Jaramillo",
    rol: "Constructor de Sistemas | Ecuador",
    contacto: "0963410409"
  }
};

async function publish() {
  const API = 'http://localhost:3000/api/cotizaciones/publish';
  
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (data.success) {
      console.log('✅ Publicado:', slug);
      console.log('🔗 Preview: https://rrss.objetivo.ai/cotizaciones/' + slug);
    } else {
      console.log('⚠️ Respuesta:', data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

publish();
