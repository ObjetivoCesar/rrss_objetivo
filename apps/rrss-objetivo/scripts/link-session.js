const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fcfsexddgupnvbvntgyz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE1NzkwOSwiZXhwIjoyMDc2NzMzOTA5fQ.4ipX_DaVdz1qAKoLi1z5pb7p9UT5W7pDzgZOIs5NGuc'
);

async function run() {
  const { data, error } = await supabase
    .from('strategy_sessions')
    .update({ objective_id: '6e9e187c-35aa-4e86-b11e-a04513fadbac' })
    .eq('id', 'fd516c89-ae55-4f8c-b663-4bfc5d5a04ba');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Linked successfully!');
  }
}

run();
