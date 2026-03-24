const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fcfsexddgupnvbvntgyz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE1NzkwOSwiZXhwIjoyMDc2NzMzOTA5fQ.4ipX_DaVdz1qAKoLi1z5pb7p9UT5W7pDzgZOIs5NGuc'
);

async function run() {
  const { data: sessions } = await supabase.from('strategy_sessions').select('id, name, nodes');
  
  sessions.forEach(session => {
    const nodes = session.nodes || [];
    const objectiveNode = nodes.find(n => n.type === 'objective');
    if (objectiveNode) {
      console.log(`Session ${session.id} (${session.name}) has Objective Node:`, objectiveNode.id || objectiveNode.data?.id);
    }
  });
}

run();
