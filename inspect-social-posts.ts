const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(process.cwd(), 'apps', 'rrss-objetivo', '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (data && data[0]) {
    console.log('Columnas en social_posts:', Object.keys(data[0]));
  } else {
    console.log('No se encontraron filas en social_posts.');
  }
}

inspectSchema();
