import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("🚀 Iniciando inyección MAESTRA para Podocarpus...");

  const etapas = [
    {
      "numero": "1",
      "etiqueta_tiempo": "Módulo CRM · 3-4 semanas",
      "nombre": "CRM de Gestión de Socios y Blindaje Patrimonial",
      "eslogan": "\"De dueños de unidades a Gerentes de su propio negocio.\"",
      "precio": "$2.100",
      "precio_subtitulo": "pago único / implementación core",
      "descripcion": "Ecosistema integral e individualizado. Cada uno de los 74 socios tiene su propio Dashboard para controlar: ingresos por cuotas, tracking de ruta escolar en tiempo real para padres, contabilidad de mantenimientos (Calculadora de Depreciación) e inventario de activos.",
      "entregables": [
        "Dashboard Multitenant para 74 socios", 
        "Monitor de Salud Vehicular y Gastos", 
        "Sistema de Cobranza Automatizada (WhatsApp)",
        "Módulo de Reportería para el Consejo"
      ],
      "nota_especial": "Basado en la arquitectura de Donna para gestión de tareas y cobros recurrentes.",
      "detalles_pie": ["⏱ <strong>Implementación:</strong> 4 semanas", "📄 <strong>Metodología:</strong> Individualización por Socio"]
    },
    {
      "numero": "2",
      "etiqueta_tiempo": "Módulo Plataforma · 2 semanas",
      "nombre": "Plataforma de Liderazgo e Infraestructura QR",
      "eslogan": "\"La cara más tecnológica del transporte en Loja.\"",
      "precio": "$700",
      "precio_subtitulo": "despliegue institucional",
      "descripcion": "Posicionamiento de la Cooperativa como líder regional. Incluye Landing Page de alta conversión (SEO para Loja), Call Center inteligente que procesa audios de WhatsApp y despliegue de 74 QRs Dinámicos (ActivaQR) para dar confianza total al padre de familia.",
      "entregables": [
        "Landing Page Institucional V3 (SEO Optimizado)", 
        "Call Center IA de Recepción (Voz a Texto)", 
        "Despliegue de 74 QRs Dinámicos",
        "Vitrina de Confianza para Padres de Familia"
      ],
      "nota_especial": "Integrado con la tecnología de ActivaQR para validación de conductor."
    }
  ];

  const data = {
    slug: 'cooperativa-podocarpus',
    client_name: 'Cooperativa Podocarpus',
    client_contact_name: 'Wilmer Jara',
    objective_id: '5d9e7d2b-b341-4d94-870e-152a8da1345c',
    status: 'ready',
    current_step: 'final_review',
    portada_etiqueta: 'Proyecto Podocarpus 360',
    portada_titulo_bold: 'Evolución Institucional',
    portada_titulo_acento: 'Modernidad y prestigio en cada ruta.',
    portada_subtitulo: 'La propuesta estratégica para convertir a la Cooperativa en la empresa de movilidad más rentable y moderna de la región.',
    portada_preparado_para: 'Wilmer Jara y el Consejo de Administración',
    portada_fecha: 'Abril 2026',
    portada_url_banner: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop',
    portada_url_coordinador: 'https://cesarreyesjaramillo.com/img/cesar_asesor.jpg',
    intro_titulo: 'La Nueva Era de la Movilidad en Loja',
    intro_parrafos: [
      'El verdadero desafío de mantener el 45% del mercado escolar no es competir, es gestionar eficientemente 74 unidades. Actualmente, la falta de control sobre pagos y mantenimientos está drenando la rentabilidad mensual de cada socio.',
      'Podocarpus 360 no es solo una página web; es un sistema de gestión diseñado para que cada dueño de buseta controle su negocio desde el celular. Vendemos modernidad y confianza ante el público.'
    ],
    etapas: etapas,
    precio_total: 2800,
    cierre_llamada_accion: 'Estamos listos para liderar la transformación digital del transporte escolar en Loja. ¿Programamos la fecha de inicio?',
    cierre_titulo_propuesta: 'El Siguiente Paso',
    cierre_cta_texto: 'Aprobar Propuesta y Agendar Inicio',
    cierre_vigencia: '15 días laborables',
    cierre_forma_pago: '50% anticipo, 50% contra entrega',
    cierre_tiempo_ejecucion: '18 días laborables',
    cierre_pie_texto: 'Construyamos el futuro <span>hoy mismo.</span>'
  };

  const { error } = await supabase.from('quote_drafts').upsert(data, { onConflict: 'slug' });

  if (error) {
    console.error("❌ Error inyectando:", error.message);
  } else {
    console.log("✅ Fila Podocarpus creada y poblada exitosamente.");
  }
}
run();
