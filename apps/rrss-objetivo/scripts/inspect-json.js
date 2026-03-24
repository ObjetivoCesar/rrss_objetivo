const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fcfsexddgupnvbvntgyz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE1NzkwOSwiZXhwIjoyMDc2NzMzOTA5fQ.4ipX_DaVdz1qAKoLi1z5pb7p9UT5W7pDzgZOIs5NGuc'
);

async function run() {
  const { data: sessions } = await supabase.from('strategy_sessions').select('nodes').limit(1);
  console.log(JSON.stringify(sessions?.[0]?.nodes || [], null, 2));
}

run();
