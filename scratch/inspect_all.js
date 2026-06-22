
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectLastEntries() {
  console.log('--- RECENT MEMORY ENTRIES ---');
  const { data: memory, error: mError } = await supabase
    .from('donna_memory')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (mError) console.error('Error fetching memory:', mError);
  else console.log(JSON.stringify(memory, null, 2));

  console.log('\n--- RECENT SOCIAL POSTS ---');
  const { data: posts, error: pError } = await supabase
    .from('social_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (pError) console.error('Error fetching posts:', pError);
  else console.log(JSON.stringify(posts, null, 2));
}

inspectLastEntries();
