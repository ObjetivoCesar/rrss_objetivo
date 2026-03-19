import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("🧪 Iniciando pruebas del Ecosistema de Contenido...");

  try {
    // 1. Crear Objetivo
    console.log("1. Creando Objetivo...");
    const { data: objective, error: objError } = await supabase
      .from('objectives')
      .insert({
        name: 'Prueba de QA Funcional',
        description: 'Objetivo temporal para validar el insert y las relaciones.',
        emoji: '🧪',
        color: '#10b981'
      })
      .select()
      .single();

    if (objError) throw objError;
    console.log(`✅ Objetivo creado: ${objective.id} - ${objective.name}`);

    // 2. Crear Campaña
    console.log("\n2. Creando Campaña en el Objetivo...");
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .insert({
        objective_id: objective.id,
        name: 'Campaña de Verificación',
        description: 'Validando que las campañas se agrupen correctamente',
        status: 'active'
      })
      .select()
      .single();

    if (campError) throw campError;
    console.log(`✅ Campaña creada: ${campaign.id} - ${campaign.name}`);

    // 3. Crear Social Post vinculado
    console.log("\n3. Creando Post Social vinculado a Campaña/Objetivo...");
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .insert({
        content_text: 'Este es un post de prueba generado para el script de QA. #Test #Ecosistema',
        platforms: ['linkedin'],
        status: 'draft_ai',
        scheduled_for: new Date(Date.now() + 86400000).toISOString(),
        objective_id: objective.id,
        campaign_id: campaign.id
      })
      .select()
      .single();

    if (postError) throw postError;
    console.log(`✅ Post creado: ${post.id}`);

    // 4. Leer con Relaciones
    console.log("\n4. Leyendo Campaña con su Objetivo y Posts...");
    const { data: campWithRelations, error: readError } = await supabase
      .from('campaigns')
      .select(`
        *,
        objectives(name, emoji),
        social_posts(id, status, platforms)
      `)
      .eq('id', campaign.id)
      .single();

    if (readError) throw readError;
    console.log('✅ Lectura relacional exitosa:');
    console.log(JSON.stringify(campWithRelations, null, 2));

    // Cleanup Options (opcional, dejamos para que vean la data o limpiamos?)
    // Lo dejaremos para que se validen los datos en la tabla.
    
    console.log("\n🎉 Todas las pruebas del Ecosistema pasaron correctamente.");

  } catch (err) {
    console.error("❌ Fallo en la prueba:", err);
  }
}

runTests();
