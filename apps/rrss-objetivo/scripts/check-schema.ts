import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/apps/rrss-objetivo/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('strategy_sessions').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log("strategy_sessions schema (by column keys):");
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log("Table is empty, going to fetch information_schema via RPC or direct query if possible...");
      const { data: cols } = await supabase.rpc('query_columns', { table_name: 'strategy_sessions' });
      console.log(cols);
    }
  }

  const { data: obj } = await supabase.from('objectives').select('*').limit(1);
  if (obj && obj.length > 0) console.log("objectives columns:", Object.keys(obj[0]));
}

main().catch(console.error);
