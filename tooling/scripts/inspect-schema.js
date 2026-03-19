/**
 * inspect-social-posts-schema.js
 * Muestra las columnas reales de la tabla social_posts
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function inspect() {
  // Query with a wrong column to get real schema info from error
  // Or insert with minimal required fields to discover the schema
  const { data, error } = await supabase
    .from('social_posts')
    .insert([{ 
      content_text: '__SCHEMA_PROBE__',
      platforms: ['instagram'],
      status: 'draft_ai',
      scheduled_for: new Date().toISOString()
    }])
    .select('*')
    .single();

  if (error) {
    console.error('Insert error:', error.message, error.details);
  } else if (data) {
    console.log('\n=== COLUMNAS REALES EN social_posts ===');
    const cols = Object.keys(data);
    cols.forEach(c => {
      const val = data[c];
      const type = val === null ? 'null' : Array.isArray(val) ? `array` : typeof val;
      console.log(`  ${c}: ${type} = ${JSON.stringify(val)?.substring(0, 60)}`);
    });
    console.log(`\nTotal columnas: ${cols.length}`);
    
    // Limpieza
    await supabase.from('social_posts').delete().eq('id', data.id);
    console.log('\n(Fila de prueba eliminada)');
  }
}

inspect();
