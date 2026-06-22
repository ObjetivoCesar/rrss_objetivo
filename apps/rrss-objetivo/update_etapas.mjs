import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const etapas = [
    {
      "numero": "1",
      "etiqueta_tiempo": "Etapa 1 · 2-3 semanas",
      "nombre": "Dashboard del Socio y Control de Activos",
      "eslogan": "\"Su patrimonio, bajo su control total.\"",
      "precio": "$850",
      "precio_subtitulo": "pago inicial / reserva",
      "descripcion": "Creación del panel privado por socio. Incluye la Calculadora de Salud Vehicular (alertas de mantenimiento y curva de depreciación) e Inventario de Activos fijos para cada una de las 74 unidades.",
      "entregables": ["Panel de control del socio", "Monitor de salud vehicular", "Inventario digital de activos"],
      "nota_especial": "Optimizado para visualización móvil 24/7.",
      "detalles_pie": ["⏱ <strong>Duración:</strong> 3 semanas", "📄 <strong>Facturación:</strong> RUC 1103421531001"]
    },
    {
      "numero": "2",
      "etiqueta_tiempo": "Etapa 2 · 2 semanas",
      "nombre": "Sistema de Cobranza Institucional y Nómina",
      "eslogan": "\"Cero deudas, 100% liquidez.\"",
      "precio": "$650",
      "precio_subtitulo": "implementación módulo contable",
      "descripcion": "Automatización de notificaciones vía WhatsApp a padres de familia por mensualidades pendientes. Módulo de control de nómina para choferes contratados y pagos de seguridad social.",
      "entregables": ["Módulo de cobranza WhatsApp", "Gestor de nómina y seguridad social", "Reporte de morosidad en tiempo real"],
      "nota_especial": "Integración con API de WhatsApp oficial.",
      "detalles_pie": ["⏱ <strong>Duración:</strong> 2 semanas"]
    },
    {
      "numero": "3",
      "etiqueta_tiempo": "Etapa 3 · 1 semana",
      "nombre": "Cerebro de Automatización (Chatbot Directivo)",
      "eslogan": "\"Transparencia y agilidad en la asamblea.\"",
      "precio": "$500",
      "precio_subtitulo": "módulo IA institucional",
      "descripcion": "Chatbot conectado al sistema principal para recibir reportes en tiempo real, agendar citas del Consejo y transparentar el registro de las actas de asamblea ante los socios.",
      "entregables": ["Asistente virtual de asamblea", "Gestor de citas del consejo", "Repositorio de actas automatizado"],
      "nota_especial": "IA entrenada con los estatutos de la Cooperativa."
    },
    {
      "numero": "4",
      "etiqueta_tiempo": "Etapa 4 · Recurrente",
      "nombre": "Infraestructura QR de Seguridad y Landing Page",
      "eslogan": "\"La cara moderna de Podocarpus ante el mundo.\"",
      "precio": "$1.530",
      "precio_subtitulo": "despliegue 74 unidades",
      "descripcion": "Despliegue de Códigos QR físicos en las 74 unidades conectados a una Vitrina Digital que garantiza visibilidad y trazabilidad total para la tranquilidad de los clientes escolares.",
      "entregables": ["74 QRs de alta resistencia", "Landing Page institucional v3.0", "Vitrina digital de servicios"],
      "nota_especial": "Incluye diseño premium y optimización SEO regional."
    }
  ];

  const { error } = await supabase
    .from('quote_drafts')
    .update({
      intro_titulo: 'La Nueva Era de la Movilidad en Loja',
      intro_parrafos: [
        'El verdadero desafío de mantener el 45% del mercado escolar no es competir, es gestionar eficientemente 74 unidades. Actualmente, la falta de control sobre pagos atrasados de padres de familia y mantenimientos no programados están drenando la rentabilidad mensual de cada socio.',
        'Podocarpus 360 no es solo una página web; es un sistema de gestión diseñado para que cada dueño de buseta controle su negocio desde el celular. Notificamos automáticamente los cobros y generamos alertas de salud vehicular para que sepan exactamente cuándo actuar sin perder capital.'
      ],
      portada_url_coordinador: 'https://cesarreyesjaramillo.com/img/cesar_asesor.jpg',
      etapas: etapas,
      precio_total: 3530,
      current_step: 'etapas'
    })
    .eq('slug', 'cooperativa-podocarpus');

  if (error) console.error(error);
  else console.log("Datos de Introducción y Etapas inyectados en Supabase.");
}
run();
