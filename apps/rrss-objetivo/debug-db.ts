import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabaseAdmin } from './src/lib/supabase-admin';

async function main() {
  const { data, error } = await supabaseAdmin
    .from('social_posts')
    .select('id, status, scheduled_for, content_text')
    .eq('status', 'pending')
    .order('scheduled_for', { ascending: false });
    
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));

  const { data: d2 } = await supabaseAdmin
    .from('social_posts')
    .select('id, status, scheduled_for, content_text')
    .eq('status', 'processing');
  console.log("\nProcessing posts:");
  console.log(JSON.stringify(d2, null, 2));

  console.log("\nNow is: " + new Date().toISOString());
  process.exit(0);
}
main();
