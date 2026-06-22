import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('objectives').select('id, name');
  if (error) {
    console.error("Error consultando objetivos:", error.message);
  } else {
    console.log("Objetivos encontrados:");
    console.log(JSON.stringify(data, null, 2));
  }
}
run();
