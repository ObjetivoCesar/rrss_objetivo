import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('C:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  const { data: camps, error: cerr } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("LAST 5 CAMPAIGNS:");
  if (cerr) console.error(cerr);
  else console.log(camps);

  const { data: objs, error: oerr } = await supabase.from('objectives').select('*').order('created_at', { ascending: false }).limit(3);
  console.log("LAST 3 OBJECTIVES:");
  if (oerr) console.error(oerr);
  else console.log(objs);
}

checkDB();
