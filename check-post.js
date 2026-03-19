const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fcfsexddgupnvbvntgyz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE1NzkwOSwiZXhwIjoyMDc2NzMzOTA5fQ.4ipX_DaVdz1qAKoLi1z5pb7p9UT5W7pDzgZOIs5NGuc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSpecificPost() {
  const { data: post, error } = await supabase
    .from('social_posts')
    .select('id, content_text, media_url, media_urls, status, created_at')
    .eq('id', '0cc8c06b-4b30-4f83-ab17-463eac678e1a')
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return;
  }

  console.log('--- Post Específico ---');
  console.log(`ID: ${post.id}`);
  console.log(`Created: ${post.created_at}`);
  console.log(`Status: ${post.status}`);
  console.log(`Media URL (singular): ${post.media_url}`);
  console.log(`Media URLs (plural): ${JSON.stringify(post.media_urls)}`);
  console.log('-------------------------');
}

checkSpecificPost();
