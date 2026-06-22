import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
dotenv.config({ path: resolve('apps/rrss-objetivo/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan credenciales de Supabase en el .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const topic = 'ARQUITECTURA_DONNA_V3_SMOKE_TEST';
const content = `
[RESPALDO TÉCNICO - NO BORRAR]
El 10 de Abril de 2026 se completó con éxito el Smoke Test del Agente Razonador (Dual-Agent) de Donna.
Se validó la detección automática de intenciones sin usar tool calls dependientes de Gemini:

Resultado: 9/9 Tests Exitosos.
1. "láminas para LinkedIn" -> carousel-engine (Vía Reasoner)
2. "video para el canal" -> video-script-engine (Vía Reasoner)
3. "sonar menos rígido" -> humanizer (Vía Reasoner)
4. "rankear en google" -> seo-master (Vía Reasoner)
5. "mockup de portada" -> visual-slides-pro (Vía Fallback semántico)
6. "retrospectiva / depurar" -> revision-dominical (Vía Fallback semántico)
7. "anota esto en la bóveda" -> donna-memory (Escribió en DB)
8. "posicionamiento competencia" -> posicionamiento-marca (DNA activo)
9. "cerramos sesión/guarda todo" -> Antigravity (Detector determinista de despedida, guarda estado en antigravity_sessions).

Importancia: Este sistema Dual (Detector de Despedida + Agente Razonador DeepSeek) garantiza que Donna no sufra amnesia si Gemini agota su rate-limit de tools, permitiendo la escalabilidad para clonar esta arquitectura en nuevos asistentes corporativos.
`;

async function saveMemory() {
  console.log('Guardando Smoke Test en donna_memory...');
  const { data, error } = await supabase
    .from('donna_memory')
    .insert([{ 
      topic, 
      content,
      is_active: true
    }])
    .select('id, topic');

  if (error) {
    console.error('❌ Error guardando memoria:', error);
  } else {
    console.log('✅ Memoria guardada exitosamente:', data);
  }
}

saveMemory();
