require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env', override: false });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const targetId = 'eb4c0d99-27a9-4fa4-8861-a05f80962422'; // El ID con el que chocó César
  const { data, error } = await supabase.from('social_posts').select('*').eq('id', targetId);
  console.log("Búsqueda de ID", targetId);
  console.log("Resultado:", error ? error : data);
  
  // Imprimir total de registros para asegurar
  const { count } = await supabase.from('social_posts').select('*', { count: 'exact', head: true });
  console.log("Total de posts en BD:", count);
}
check();
