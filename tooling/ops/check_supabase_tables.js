require('dotenv').config({ path: 'c:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\apps\\rrss-objetivo\\.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('URL:', supabaseUrl ? 'Exists' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    const tables = ['blog_posts', 'posts', 'articles', 'social_posts'];
    for (const table of tables) {
      console.log(`Checking ${table}...`);
      const { data, error } = await supabase.from(table).select('*').limit(3);
      if (error) {
        console.log(`Table ${table} error:`, error.message);
      } else {
        console.log(`\nTable ${table} exists. Rows found: ${data.length}`);
        if (data.length > 0) {
           console.log(`Sample from ${table}:`, Object.keys(data[0]));
           if (data[0].title) console.log(data.map(d => d.title));
           if (data[0].slug) console.log(data.map(d => d.slug));
        }
      }
    }
  } catch(e) {
    console.error(e);
  }
}
checkTables();
