const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log('Fetching posts...');
  const { data, error } = await supabase
    .from('social_posts')
    .select('id, status, scheduled_for, content_text')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching posts:', error);
    fs.writeFileSync('db_check_result.txt', 'ERROR: ' + error.message);
  } else {
    console.log(`Found ${data.length} posts.`);
    fs.writeFileSync('db_check_result.txt', JSON.stringify(data, null, 2));
  }
}

check().catch(err => {
  console.error('Fatal error:', err);
  fs.writeFileSync('db_check_result.txt', 'FATAL: ' + err.message);
});
