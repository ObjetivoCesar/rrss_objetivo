import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const objectiveId = '5d9e7d2b-b341-4d94-870e-152a8da1345c'; // OBJETIVO — Ingeniería de Eficiencia
  const videoUrl = 'https://player.mediadelivery.net/play/636136/7d9b7651-96ba-4098-b47a-e4502f880c98';
  
  // Para que el scheduler lo detecte como video, vamos a intentar usar una URL que termine en .mp4
  // O simplemente confiar en que el scheduler lo pase a Make y Make lo procese.
  // Pero según scheduler.ts línea 255: isVideo = url.toLowerCase().endsWith('.mp4')
  // Así que vamos a "engañarlo" o mejor, buscar la URL real.
  // Probemos con la URL de Bunny que suele funcionar:
  const directVideoUrl = 'https://vz-4b4d1e2c-063.b-cdn.net/7d9b7651-96ba-4098-b47a-e4502f880c98/play_720p.mp4';

  const post = {
    content_text: `¿Sigues regalando basura? 🚩
Dar tarjetas no es malo, esperar que guarden tu información es difícil pero aquí te enseño algo interesante 👇
#objetivo #contactodigital`,
    platforms: ['facebook'],
    objective_id: objectiveId,
    status: 'pending',
    scheduled_for: '2026-04-28T14:54:00-05:00', // Un minuto después por si acaso
    media_url: directVideoUrl,
    media_urls: [directVideoUrl],
    topic: 'Reel de Prueba - BunnyNet Integration'
  };

  const { data, error } = await supabase.from('social_posts').insert([post]).select();

  if (error) {
    console.error("Error programando el post:", error.message);
  } else {
    console.log("✅ Post programado exitosamente:");
    console.log(JSON.stringify(data, null, 2));
  }
}
run();
