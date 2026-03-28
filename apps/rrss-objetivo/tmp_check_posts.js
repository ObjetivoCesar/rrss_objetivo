
require('dotenv').config({ path: 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/apps/rrss-objetivo/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPosts() {
  const { data, error } = await supabase
    .from('social_posts')
    .select('id, content_text, scheduled_for, status')
    .is('archived_at', null)
    .order('scheduled_for', { ascending: true });

  if (error) {
    console.error("Error fetching posts:", error);
    process.exit(1);
  }

  console.log(JSON.stringify(data, null, 2));
}

checkPosts();
