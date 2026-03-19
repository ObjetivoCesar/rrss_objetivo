import { supabaseAdmin } from './apps/rrss-objetivo/src/lib/supabase-admin';

async function checkPosts() {
  const { data: posts, error } = await supabaseAdmin
    .from('social_posts')
    .select('id, content_text, media_url, media_urls, status')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }

  console.log('--- Ultimos 10 posts ---');
  posts.forEach(p => {
    console.log(`ID: ${p.id}`);
    console.log(`Status: ${p.status}`);
    console.log(`Media URL (singular): ${p.media_url}`);
    console.log(`Media URLs (plural): ${JSON.stringify(p.media_urls)}`);
    console.log('-------------------------');
  });
}

checkPosts();
