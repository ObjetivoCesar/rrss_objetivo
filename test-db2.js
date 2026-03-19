import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('C:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuery() {
    const { data: objectives, error: objError } = await supabase
      .from("objectives")
      .select(`
        id, name,
        campaigns (
          id, name, archived_at
        )
      `)
      .is('archived_at', null)
      .is('campaigns.archived_at', null)
      .order('created_at', { ascending: false });
      
    console.log("QUERY RESULT:", JSON.stringify(objectives, null, 2));
    if (objError) console.error(objError);
}

checkQuery();
