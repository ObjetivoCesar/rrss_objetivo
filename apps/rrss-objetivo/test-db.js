require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env', override: false }); // Cargar .env por si no está en local
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('social_posts').select('id, content_text').limit(5);
  console.log(error ? error : data);
}
check();
