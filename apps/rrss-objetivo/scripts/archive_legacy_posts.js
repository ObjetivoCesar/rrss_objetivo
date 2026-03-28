
require('dotenv').config({ path: 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/apps/rrss-objetivo/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function archiveLegacy() {
  console.log("Archiving legacy posts...");
  const { data, error, count } = await supabase
    .from('social_posts')
    .update({ archived_at: new Date().toISOString() })
    .neq('status', 'published')
    .is('archived_at', null)
    .select();

  if (error) {
    console.error("Error archiving posts:", error);
    process.exit(1);
  }

  console.log(`Successfully archived ${data.length} posts.`);
  process.exit(0);
}

archiveLegacy();
