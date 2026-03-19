import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTvObjective() {
  console.log("Creando objetivo: Presentación en TV - Breaking Routine Pitch...");
  
  const { data, error } = await supabase
    .from('objectives')
    .insert([{
      name: "Presentación en TV - Breaking Routine Pitch",
      description: "Estrategia de contenido y guion para una presentación en televisión, basada en el framework 30/25/25/15/5. Enfocada en demostraciones visuales rápidas de ActivaQR para romper la rutina del espectador, generar impacto inmediato y capturar leads.",
      emoji: "📺",
      color: "#FF6B6B",
      status: "active"
    }])
    .select()
    .single();

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("✅ Objetivo creado con ID:", data.id);
  }
}

createTvObjective();
