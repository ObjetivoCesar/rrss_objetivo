import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const etapas = [
    {
      "numero": "1",
      "etiqueta_tiempo": "Módulo CRM · 3-4 semanas",
      "nombre": "CRM de Gestión de Socios y Blindaje Patrimonial",
      "eslogan": "\"De dueños de unidades a Gerentes de su propio negocio.\"",
      "precio": "$2.100",
      "precio_subtitulo": "pago único / implementación core",
      "descripcion": "Ecosistema integral e individualizado. Cada uno de los 74 socios tiene su propio Dashboard para controlar: ingresos por cuotas, tracking de ruta escolar en tiempo real para padres, contabilidad de mantenimientos (Calculadora de Depreciación) y gestión de nómina para choferes.",
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
      "descripcion": "Posicionamiento de la Cooperativa como líder regional. Incluye Landing Page de alta conversión (SEO para Loja), Call Center inteligente que procesa audios de WhatsApp y despliegue de 74 QRs Dinámicos (ActivaQR) para promociones, eventos y vitrina de confianza ante el pasajero.",
      "entregables": [
        "Landing Page Institucional V3 (SEO Optimizado)", 
        "Call Center IA de Recepción (Voz a Texto)", 
        "Despliegue de 74 QRs Dinámicos",
        "Vitrina de Confianza para Padres de Familia"
      ],
      "nota_especial": "Integrado con la tecnología de ActivaQR para validación de conductor."
    }
  ];

  const { error } = await supabase
    .from('quote_drafts')
    .update({
      portada_titulo_bold: 'Proyecto Podocarpus 360',
      portada_titulo_acento: 'Liderazgo, Control e Innovación Digital.',
      portada_subtitulo: 'La propuesta estratégica para convertir a la Cooperativa en la empresa de movilidad más rentable y moderna de la región.',
      etapas: etapas,
      precio_total: 2800,
      current_step: 'final_review'
    })
    .eq('slug', 'cooperativa-podocarpus');

  if (error) console.error(error);
  else console.log("Propuesta actualizada con nuevos módulos y precios sugeridos por César.");
}
run();
