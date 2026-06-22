-- Insertar borrador inteligente para Cooperativa Podocarpus
INSERT INTO quote_drafts (slug, client_name, current_step, data, objective_id)
VALUES (
  'cooperativa-podocarpus',
  'Cooperativa Podocarpus',
  'done',
  '{
    "portada": {
      "etiqueta": "Plataforma de Rentabilidad y Control Operativo",
      "tituloPrincipal": "Podocarpus 360: De Cooperativa Tradicional a Empresa de Movilidad Inteligente",
      "tituloDestacado": "Blindaje Operativo y Rentabilidad Individual para sus 74 Socios.",
      "subtitulo": "Reduzca costos de mantenimiento, automatice el cobro de mensualidades y proteja el patrimonio de cada unidad con el primer CRM cooperativo de Loja.",
      "preparadoPara": "Wilmer Jara y el Honorable Consejo de Administración de Coop. Podocarpus",
      "fecha": "Abril 2026"
    },
    "introduccion": {
      "titulo": "El fin del caos administrativo y las fugas de dinero.",
      "parrafos": [
        "El verdadero desafío de mantener el 45% del mercado escolar no es competir, es gestionar eficientemente 74 unidades. Actualmente, la falta de control sobre pagos atrasados de padres de familia y mantenimientos no programados están drenando la rentabilidad mensual de cada socio.",
        "Podocarpus 360 no es solo una página web; es un sistema de gestión diseñado para que cada dueño de buseta controle su negocio desde el celular. Notificamos automáticamente los cobros a los padres de familia y generamos alertas de salud vehicular para que sepan exactamente cuándo hacer mantenimiento y cuándo renovar su unidad sin perder capital."
      ]
    },
    "etapas": [
      {
        "titulo": "Dashboard del Socio y Control de Activos",
        "descripcion": "Creación de panel privado por socio. Incluye la Calculadora de Salud Vehicular (alertas de mantenimiento y curva de depreciación) e Inventario de Activos fijos.",
        "precio": 850
      },
      {
        "titulo": "Sistema de Cobranza Institucional y Nómina",
        "descripcion": "Automatización de notificaciones vía WhatsApp a padres de familia por mensualidades pendientes. Módulo de control de nómina para choferes contratados.",
        "precio": 650
      },
      {
        "titulo": "Cerebro de Automatización (Chatbot Directivo)",
        "descripcion": "Chatbot conectado al sistema principal para recibir reportes en tiempo real, agendar citas del Consejo y transparentar el registro de las actas de asamblea.",
        "precio": 500
      },
      {
        "titulo": "Infraestructura QR de Seguridad y Landing Page",
        "descripcion": "Despliegue de Códigos QR en las 74 unidades conectados a una Vitrina Digital que garantiza visibilidad y trazabilidad total para la tranquilidad de los clientes.",
        "precio": 1530
      }
    ],
    "cierre": {
      "vigencia": "15 días laborables",
      "formaPago": "50% anticipo, 50% contra entrega",
      "tiempoEjecucion": "18 días laborables"
    }
  }'::jsonb,
  '5d9e7d2b-b341-4d94-870e-152a8da1345c'
)
ON CONFLICT (slug) DO UPDATE 
SET data = EXCLUDED.data, current_step = 'done';
