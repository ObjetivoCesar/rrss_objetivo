const fetch = require('node-fetch');

// ⚠️ ARCHIVO MAESTRO - PLANTILLA ACTIVAQR 1 (FLOTAS / MARKETING)
// Clonar este archivo a 'scripts/publish-temp.js', modificar los datos y ejecutar.

const slug = "propuesta-flota-ejemplo-2026";
const decisor = "Ing. Nombre Apellido";
const empresa = "Nombre Empresa";
const unidades = "10"; // Número de vehículos
const gancho = "sus servicios estrella"; // Qué es lo que más les cuesta vender
const imagen_fondo = "https://cesarweb.b-cdn.net/activaqr/activaqr-contacto-business.webp"; // Imagen oficial de ActivaQR Business

const body = {
  id: slug,
  portada: {
    etiqueta: "Estrategia de Captación Móvil",
    titulo_principal: "",
    titulo_destacado: `Proyecto ${empresa}:<br><span style="color:white;font-size:0.55em;font-style:normal;font-weight:300;line-height:1.1">Convierta sus unidades, letreros y vallas en una red de comunicación activa 24/7.</span>`,
    subtitulo: `Preparado para el Sr. ${decisor} | Abril 2026`,
    preparado_para: `Sr. ${decisor}`,
    preparado_por: "Ing. César Augusto Reyes Jaramillo",
    fecha: "Abril 2026",
    imagen_url: imagen_fondo,
    url_fondo: imagen_fondo,
    url_logo_cliente: ""
  },
  introduccion: {
    titulo: "La diferencia entre Publicidad Muda y Publicidad Viva.",
    parrafos: [
      `Tener sus unidades, letreros y vallas en la calle es tener activos publicitarios desperdiciados. El problema actual es que son "anuncios mudos": el cliente ve la marca, pero no tiene cómo interactuar en ese momento.`,
      `Ya sea en un semáforo o pasando frente a su establecimiento, usted pierde un cliente potencial porque nadie tiene tiempo de anotar un número de teléfono. Hoy sus activos solo muestran su nombre; mañana, además de mostrar, van a vender y captar clientes.`
    ]
  },
  etapas: [
    {
      numero: "1",
      etiqueta_tiempo: "Paso Uno · Conexión Inmediata",
      nombre: "Agenda Digital Instalable",
      eslogan: "\"Usted ya no es un número olvidado, es un contacto guardado.\"",
      precio: "Incluido",
      precio_subtitulo: "en la licencia anual",
      descripcion: "El cliente escanea el QR en el vehículo y su empresa queda guardada inmediatamente con foto, servicios y redes en su celular. Tecnología compatible con cualquier smartphone, sin fricción ni descargas.",
      entregables: [
        "Código QR optimizado para unidades y vallas",
        "Agenda digital vCard instalable",
        "Enlaces directos a WhatsApp de ventas"
      ],
      nota_especial: "Elimine el gasto en volantes o tarjetas que terminan en la basura.",
      detalles_pie: ["⚡ Cero fricción para el cliente", "🔗 [Ver detalles del producto](https://www.activaqr.com/contacto-business)"]
    },
    {
      numero: "2",
      etiqueta_tiempo: "Paso Dos · Ventas",
      nombre: "Vitrina Dinámica Auto-Administrable",
      eslogan: "\"Promocione lo que necesita vender hoy, no lo que rotuló ayer.\"",
      precio: "$100",
      precio_subtitulo: "por unidad / al año",
      descripcion: `¿Cambió la promoción del mes? ¿Quiere impulsar ${gancho}? Cámbielo desde su propio celular en 10 segundos y todos los QR de su flota se actualizarán al instante sin gastar un centavo en nueva rotulación.`,
      entregables: [
        "Landing Page administrable desde su celular",
        "Galería de imágenes y videos promocionales",
        "Botones de acción configurables"
      ],
      nota_especial: "Costo Diario: $0.27 centavos (Menos que un café a la semana).",
      detalles_pie: ["✅ Control total desde su celular"]
    }
  ],
  cierre: {
    titulo: "Garantía de Retorno Inmediato",
    frase_bisagra: `Sr. ${decisor.split(' ')[0]}, una sola venta generada a través del QR en 365 días cubre el 100% de la inversión de todo el año.`,
    texto: `Le propongo una visita rápida de 15 minutos para mostrarle cómo se vería el sistema funcionando en las unidades y vallas de ${empresa}. Sin compromisos, solo para que vea la tecnología en acción.`,
    frase_final: "Su empresa ahora vive <span>en el bolsillo del cliente.</span>",
    mapa_url: "https://maps.app.goo.gl/UjyuP42rjGHND4xb6",
    cta_texto: "✅ Confirmar demostración de 15 min",
    cta_url: `https://wa.me/593983237491?text=${encodeURIComponent(`Hola César, me interesa la propuesta de Flota Inteligente. Soy ${decisor} de ${empresa}.`)}`,
    pie_texto: "Inversión 100% deducible. Alta rentabilidad comercial."
  }
};

async function publish() {
  console.log(`🚀 Publicando Propuesta (Plantilla Flota) para ${empresa}...`);
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
