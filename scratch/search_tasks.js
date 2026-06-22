
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchMemory() {
  const { data, error } = await supabase
    .from('donna_memory')
    .select('*')
    .ilike('topic', '%Tarea%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching memory:', error);
    return;
  }

  console.log('--- FOUND TASKS ---');
  console.log(JSON.stringify(data, null, 2));
}

searchMemory();
