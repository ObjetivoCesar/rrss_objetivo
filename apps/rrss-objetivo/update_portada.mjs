import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { error } = await supabase
    .from('quote_drafts')
    .update({
      portada_url_banner: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop', // Simulo una de buses por ahora o uso la del usuario si la tuviera
      portada_titulo_bold: 'Evolución Podocarpus',
      portada_titulo_acento: 'Modernidad que sus socios y pasajeros pueden sentir.',
      portada_subtitulo: 'Posicionando a la Cooperativa como el referente tecnológico del transporte en Loja, garantizando seguridad y eficiencia en cada kilómetro.',
      current_step: 'intro'
    })
    .eq('slug', 'cooperativa-podocarpus');

  if (error) console.error(error);
  else console.log("Campos de Portada actualizados en Supabase.");
}
run();
