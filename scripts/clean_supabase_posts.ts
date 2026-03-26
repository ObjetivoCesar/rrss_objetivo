import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'apps/rrss-objetivo/.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanSocialPosts() {
  console.log("🧹 Limpiando tabla social_posts...");
  
  // Borramos todos los posts que estén en estado 'pending' o 'draft_ai'
  // (Asumiendo que los que queremos borrar son los que inyectamos masivamente)
  const { data, error } = await supabase
    .from('social_posts')
    .delete()
    .neq('status', 'published'); // Mantener lo que ya se publicó si hubiera algo

  if (error) {
    console.error("❌ Error al limpiar:", error.message);
  } else {
    console.log("✅ Mesa limpia. Posts eliminados.");
  }
}

cleanSocialPosts();
