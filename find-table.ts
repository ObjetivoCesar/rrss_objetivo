const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(process.cwd(), 'apps', 'rrss-objetivo', '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findTable() {
  const targetId = 'b5a9c90d-3c04-43f4-ad48-8ae9cf5a195b';
  const tables = ['blog_posts', 'posts', 'social_posts', 'posts_rrss', 'ai_posts'];
  
  console.log(`Buscando ID ${targetId} en tablas...`);
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('id', targetId)
        .maybeSingle();

      if (data) {
        console.log(`✅ ¡Encontrado en tabla: ${table}!`);
        return;
      }
    } catch (e) {
      // Ignorar errores de tabla no existe
    }
  }
  console.log('❌ No se encontró el ID en ninguna de las tablas probadas.');
}

findTable();
