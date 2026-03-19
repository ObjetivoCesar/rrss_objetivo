import { supabaseAdmin } from '../lib/supabase-admin';

async function clearPosts() {
  console.log('🧹 Limpiando tabla social_posts...');
  const { error } = await supabaseAdmin
    .from('social_posts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (error) {
    console.error('❌ Error limpiando posts:', error.message);
  } else {
    console.log('✅ Tabla social_posts vaciada correctamente.');
  }
}

clearPosts();
