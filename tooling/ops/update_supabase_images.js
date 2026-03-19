const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcfsexddgupnvbvntgyz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTc5MDksImV4cCI6MjA3NjczMzkwOX0.lPj2Q984Mc62ZqEEWyVNZxMHNzpX_DeknFjSgVFGSb4';

const supabase = createClient(supabaseUrl, supabaseKey);
const BUNNY_BASE_URL = 'https://cesarweb.b-cdn.net/articulos';

const updates = [
  {
    slug: 'por-que-publicar-en-redes-sociales-no-es-lo-mismo-que-tener-presencia-real-en-internet',
    image: `${BUNNY_BASE_URL}/cesar-reyes-trabajando.webp`
  },
  {
    slug: 'soy-carpintero-no-quiero-un-curso-de-seo:-por-que-los-gurus-te-hacen-perder-tiempo',
    image: `${BUNNY_BASE_URL}/carpintero-qr-fidelizacion.png`
  },
  {
    slug: 'por-que-nadie-encuentra-tu-restaurante-en-internet-y-no-tiene-nada-que-ver-con-el-chef',
    image: `${BUNNY_BASE_URL}/restaurante-visible-maps.png`
  },
  {
    slug: 'por-que-enviar-el-menu-por-whatsapp-en-pdf-te-esta-haciendo-perder-clientes',
    image: `${BUNNY_BASE_URL}/whatsapp-messaging.webp`
  },
  {
    slug: 'como-conseguir-mas-pacientes-para-tu-consultorio-sin-gastar-en-publicidad',
    image: `${BUNNY_BASE_URL}/caso-exito-doctor.jpg`
  }
];

async function updateDatabase() {
  for (const item of updates) {
    const { data, error } = await supabase
      .from('articles')
      .update({ cover_image: item.image })
      .eq('slug', item.slug)
      .select();

    if (error) {
      console.error(`Error a actualizar ${item.slug}:`, error.message);
    } else {
      console.log(`✅ Articulo actualizado -> ${item.slug}`);
      if (data.length === 0) {
        console.log(`⚠️ Advertencia: No se encontró el slug ${item.slug}`);
      }
    }
  }
}

updateDatabase();
