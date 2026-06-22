import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('quote_drafts').select('slug');
  if (error) {
    console.error("Error consultando:", error.message);
  } else {
    console.log("Filas encontradas:", data.length);
    console.log("Slugs:", data.map(d => d.slug));
  }
}
run();
