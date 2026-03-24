const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fcfsexddgupnvbvntgyz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE1NzkwOSwiZXhwIjoyMDc2NzMzOTA5fQ.4ipX_DaVdz1qAKoLi1z5pb7p9UT5W7pDzgZOIs5NGuc'
);

async function run() {
  const { data: rows } = await supabase.from('strategy_sessions').select('*').limit(1);
  if (rows && rows.length > 0) {
    console.log('Columns:', Object.keys(rows[0]));
    console.log('Sample Data:', JSON.stringify(rows[0], null, 2).substring(0, 500));
  } else {
    console.log('No rows found');
  }
}

run();
