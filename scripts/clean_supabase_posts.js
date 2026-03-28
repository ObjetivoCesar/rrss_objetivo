const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../apps/rrss-objetivo/.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanSocialPosts() {
  console.log("🧹 Limpiando tabla social_posts...");
  
  // Borramos todos los posts que estén en estado 'pending' o 'draft_ai'
  const { data, error, count } = await supabase
    .from('social_posts')
    .delete({ count: 'exact' })
    .neq('status', 'published'); 

  if (error) {
    console.error("❌ Error al limpiar:", error.message);
  } else {
    console.log(`✅ Mesa limpia. ${count || 0} posts eliminados.`);
  }
}

cleanSocialPosts();
