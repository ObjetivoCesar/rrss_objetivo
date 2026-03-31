import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabaseAdmin } from './src/lib/supabase-admin';

async function main() {
  const { data, error } = await supabaseAdmin
    .from('social_posts')
    .select('id, status, error_log, media_urls')
    .eq('id', 'de28e56c-aa03-41f2-90d6-f3042b95df44');
    
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));

  process.exit(0);
}
main();
