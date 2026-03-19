import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- TEST: System Logs ---');
  
  // Insert a test log
  console.log('1. Intentando escribir un log de prueba...');
  const { data: insertData, error: insertError } = await supabase
    .from('system_logs')
    .insert([
      { service: 'test-script', severity: 'INFO', message: 'Test verification script payload' }
    ]);
    
  if (insertError) {
    console.log('❌ Falló al insertar el log. Revisa si la tabla existe.', insertError);
    return;
  }
  console.log('✅ Log insertado exitosamente.');
  
  console.log('2. Leyendo los logs recientes...');
  const { data: logs, error: selectError } = await supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (selectError) {
    console.log('❌ Falló al leer los logs.', selectError);
    return;
  }
  
  console.log(`✅ Éxito: Se encontraron ${logs.length} logs recientes.`);
  console.log(logs.map(l => `[${l.created_at}] [${l.service}] [${l.severity}]: ${l.message}`));
}

run();
