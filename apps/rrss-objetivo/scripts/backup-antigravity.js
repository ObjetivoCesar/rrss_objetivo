import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sessionData = {
  conversation_id: '4c5d3894-195b-4c76-98fb-7f351b025b96',
  session_title: 'Consolidación ADN ActivaQR & Memoria v2',
  summary: `
    - ActivaQR: Lógica de venta blindada ($35/año, responsabilidad del vendedor, sin devoluciones, garantía de estadísticas).
    - Humanizer 3.1: Inyectado el ADN "Ingeniero de Eficiencia Humanista" con las 5 Cs y el Grito de Guerra.
    - Memoria v2: Sistema de 'Caja Negra' en Supabase integrado en route.ts (Auto-recuperación activa).
    - Contenido: Diseñadas 5 opciones de post para el primer reporte de ActivaQR con enfoque en scroll-stoppers.
  `.trim(),
  pending_tasks: [
    'Implementar ejecución de primer reporte de ActivaQR (Visuales + Copy)',
    'Construir UI /pendientes (Dashboard de aprobación masiva)',
    'Prueba de Humo técnica del Intent Detection en local',
    'Auditoría final de visual-slides-pro'
  ],
  decisions: [
    'Migración total del contexto estratégico a Supabase para eliminar la amnesia entre sesiones.',
    'Sustitución de garantía de devolución por garantía de estadísticas mes a mes en ActivaQR.',
    'Enfoque de "Responsabilidad de ser guardado" como hook principal de venta.'
  ],
  dna_snapshot: {
    cesar: "Ingeniero de Eficiencia Humanista. Autoridad, IA, Humanish Efficiency.",
    activaqr_logic: "Responsabilidad del vendedor, Agenda > Redes, $35/año.",
    arch: "DeepSeek Reasoner + Gemini Executor + Supabase Memory."
  }
};

async function backupSession() {
  console.log('📦 Iniciando respaldo en antigravity_sessions...');
  
  const { data, error } = await supabase
    .from('antigravity_sessions')
    .upsert([sessionData], { onConflict: 'conversation_id' })
    .select();

  if (error) {
    console.error('❌ Error al respaldar:', error);
  } else {
    console.log('✅ Respaldo completado con éxito. ID de Sesión:', data[0].id);
  }
}

backupSession();
