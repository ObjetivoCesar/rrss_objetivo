import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabaseAdmin } from './src/lib/supabase-admin';

async function main() {
  const { data, error } = await supabaseAdmin
    .from('social_posts')
    .select('id, status, scheduled_for, content_text')
    .gte('scheduled_for', '2026-03-28T00:00:00Z')
    .lt('scheduled_for', '2026-03-29T00:00:00Z')
    .order('scheduled_for', { ascending: true });
    
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));

  process.exit(0);
}
main();
