const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcfsexddgupnvbvntgyz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTc5MDksImV4cCI6MjA3NjczMzkwOX0.lPj2Q984Mc62ZqEEWyVNZxMHNzpX_DeknFjSgVFGSb4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSlugs() {
  const { data, error } = await supabase.from('articles').select('slug, title');
  if (error) {
    console.error(error.message);
  } else {
    data.forEach(d => console.log(`Title: ${d.title} | Slug: ${d.slug}`));
  }
}

checkSlugs();
