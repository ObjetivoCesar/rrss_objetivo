import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('C:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuery() {
    const { data: campaignDir, error: e1 } = await supabase.from('campaigns').select('*').eq('id', 'f9d375bc-7d4d-450f-aedb-871d374f66fa');
    console.log("Direct campaign fetch:", campaignDir);

    const { data: objJoin, error: e2 } = await supabase.from('objectives').select('id, name, campaigns(*)').eq('id', '79d2de4e-7d2e-4da5-a060-b9d9c01eb876');
    console.log("Join from objective fetch:", JSON.stringify(objJoin, null, 2));
}

checkQuery();
