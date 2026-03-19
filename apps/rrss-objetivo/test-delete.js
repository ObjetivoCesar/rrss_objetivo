require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env', override: false });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function purge() {
  const targetId = 'eb4c0d99-27a9-4fa4-8861-a05f80962422'; // El ID con el que chocó César
  
  console.log("Intentando borrar ID", targetId);
  const { data, error } = await supabase.from('social_posts').delete().eq('id', targetId).select();
  
  console.log("Resultado del delete:", { data, error });
}
purge();
