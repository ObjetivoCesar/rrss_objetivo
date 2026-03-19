const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcfsexddgupnvbvntgyz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTc5MDksImV4cCI6MjA3NjczMzkwOX0.lPj2Q984Mc62ZqEEWyVNZxMHNzpX_DeknFjSgVFGSb4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  const { data, error } = await supabase.from('articles').select('*').eq('slug', 'por-que-publicar-en-redes-sociales-no-es-lo-mismo-que-tener-presencia-real-en-internet');
  console.log("Fetch result:", data, error);
}

testFetch();
