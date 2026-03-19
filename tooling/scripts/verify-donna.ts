import { createClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

// Configuración extraída de .env
const supabaseUrl = "https://fcfsexddgupnvbvntgyz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTc5MDksImV4cCI6MjA3NjczMzkwOX0.lPj2Q984Mc62ZqEEWyVNZxMHNzpX_DeknFjSgVFGSb4";
const deepseekKey = "sk-4a48b5eb760a46369c0a35fa199a3da6";

const supabase = createClient(supabaseUrl, supabaseKey);
const deepseek = createDeepSeek({ apiKey: deepseekKey });

async function runTest() {
  console.log("🚀 Iniciando Test de Inteligencia de Donna (via DeepSeek)...");

  // 1. Crear Objetivo de Prueba
  const testId = Math.floor(Math.random() * 10000);
  const { data: objective, error: objErr } = await supabase
    .from('objectives')
    .insert({
      name: `Test: Expansión Dental ${testId}`,
      description: 'Objetivo creado por el script de verificación para testear el snapshot.',
      color: '#FF5733',
      emoji: '🦷'
    })
    .select()
    .single();

  if (objErr) {
    console.error("❌ Error creando objetivo:", objErr);
    return;
  }
  console.log(`✅ Objetivo creado: ${objective.name} (${objective.id})`);

  // 2. Crear Campaña de Prueba
  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .insert({
      objective_id: objective.id,
      name: `Campaña: Invisalign Pro ${testId}`,
      description: 'Campaña de alta rentabilidad para dentistas premium.',
      status: 'active'
    })
    .select()
    .single();

  if (campErr) {
    console.error("❌ Error creando campaña:", campErr);
    return;
  }
  console.log(`✅ Campaña creada: ${campaign.name} (${campaign.id})`);

  // 3. Simular Prompt
  const systemPrompt = `Eres **Donna**, la Directora Estratégica del ecosistema digital de ActivaQR y César Reyes.
  
  BOARD DE EXPERTOS Y RAZONAMIENTO INVISIBLE: Reflexiona como SEO, Copy y Growth antes de responder, pero no lo muestres.
  
  SNAPSHOT REAL-TIME (CONTEXTO ACTUAL):
  - OBJETIVOS ACTIVOS: [ { id: "${objective.id}", name: "${objective.name}" } ]
  - CAMPAÑAS ACTIVAS: [ { id: "${campaign.id}", name: "${campaign.name}" } ]
  
  REGLA DE MEMORIA OBLIGATORIA: 
  Cuando decidas una estrategia, usa el comando: <SAVE_NOTE topic="Registro: [Tema]">Resumen de lo decidido</SAVE_NOTE>.`;

  console.log("🤖 Consultando a Donna...");
  try {
    const { text } = await generateText({
      model: deepseek('deepseek-chat'), 
      system: systemPrompt,
      prompt: `César te pregunta: Donna, acabo de crear una campaña de Invisalign. ¿Qué estrategia rápida me sugieres y cómo la registro en tu memoria para que no se me olvide?`,
    });

    console.log("\n--- RESPUESTA DE DONNA ---");
    console.log(text);
    console.log("--------------------------\n");

    // 4. Verificar y guardar nota
    const noteMatch = text.match(/<SAVE_NOTE topic="([^"]+)">([\s\S]+?)<\/SAVE_NOTE>/);
    if (noteMatch) {
      console.log(`📝 Donna intentó guardar la nota: "${noteMatch[1]}"`);
      const { error: memErr } = await supabase.from('donna_memory').insert({
        topic: noteMatch[1].trim(),
        content: noteMatch[2].trim(),
        added_by: 'donna'
      });
      if (memErr) {
        console.error("❌ Error guardando en donna_memory:", memErr);
      } else {
        console.log("✅ EXITOSO: Nota insertada en la tabla 'donna_memory'.");
      }
    } else {
      console.log("⚠️ Donna no generó etiqueta <SAVE_NOTE>.");
    }
  } catch (e: any) {
    console.error("💥 Error en la llamada a la IA:", e.message);
  }
  
  console.log("\n🎯 PRUEBA COMPLETADA.");
}

runTest();
