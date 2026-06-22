import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function scheduleTests() {
  const imageUrl = "https://bibliasholman.lifeway.com/wp-content/uploads/2023/08/QUE-ES-EL-TERMINO-IMAGEN-DE-DIOS-scaled.jpg";
  
  // Programar para las 17:30 local (UTC-5 -> 22:30 UTC)
  const scheduledTime = "2026-04-26T22:30:00Z";

  const posts = [
    {
      content_text: "🚀 Prueba LinkedIn (17:30) - Restauración Payload V2",
      media_urls: [imageUrl],
      platforms: ["linkedin"],
      status: "pending",
      scheduled_for: scheduledTime
    }
  ];


  console.log('Insertando post para LinkedIn (17:10)...');
  const { data, error } = await supabase.from('social_posts').insert(posts).select('id, platforms, scheduled_for');

  if (error) {
    console.error('Error insertando post:', error);
  } else {
    console.log('✅ Post de LinkedIn programado:', JSON.stringify(data, null, 2));
  }
}



scheduleTests();

