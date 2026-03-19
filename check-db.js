const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fcfsexddgupnvbvntgyz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE1NzkwOSwiZXhwIjoyMDc2NzMzOTA5fQ.4ipX_DaVdz1qAKoLi1z5pb7p9UT5W7pDzgZOIs5NGuc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkPosts() {
  const { data: posts, error } = await supabase
    .from('social_posts')
    .select('id, content_text, media_url, media_urls, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }

  console.log('--- Ultimos 10 posts ---');
  posts.forEach(p => {
    console.log(`ID: ${p.id}`);
    console.log(`Created: ${p.created_at}`);
    console.log(`Status: ${p.status}`);
    console.log(`Media URL (singular): ${p.media_url}`);
    console.log(`Media URLs (plural): ${JSON.stringify(p.media_urls)}`);
    console.log('-------------------------');
  });
}

checkPosts();
