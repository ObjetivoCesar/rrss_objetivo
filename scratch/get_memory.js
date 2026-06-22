
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getLatestSession() {
  const { data, error } = await supabase
    .from('antigravity_sessions')
    .select('*');

  if (error) {
    console.error('Error fetching session:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Found', data.length, 'sessions:');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('No sessions found in table antigravity_sessions.');
  }
}

getLatestSession();
