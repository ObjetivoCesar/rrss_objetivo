import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching columns:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in social_posts:', Object.keys(data[0]));
  } else {
    // If no data, try to get from another table or just list what we have
    console.log('No data in social_posts to check columns.');
  }
}

checkColumns();
