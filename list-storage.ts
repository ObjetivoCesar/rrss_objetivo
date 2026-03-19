import * as dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Cargar variables desde la app
const envPath = path.join(process.cwd(), 'apps', 'rrss-objetivo', '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function listFiles() {
  console.log('--- Listado de archivos en posts-assets ---');
  const { data: files, error } = await supabaseAdmin
    .storage
    .from('posts-assets')
    .list('', {
      limit: 20,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) {
    console.error('Error:', error);
    return;
  }

  for (const file of files || []) {
    console.log(`- ${file.name} (Created: ${file.created_at})`);
  }
}

listFiles();
