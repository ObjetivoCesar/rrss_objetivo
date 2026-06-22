import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno locales ANTES del import
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { supabaseAdmin } = require('./src/lib/supabase-admin');

async function saveMemory() {
  console.log('🔄 Iniciando guardado de memoria sobre API de Instagram...');

  try {
    const memoryContent = `⚠️ **REGLA CRÍTICA DE PUBLICACIÓN - INSTAGRAM GRAPH API (ERROR 500 / 9004)**
Cuando Make.com devuelve un error 500 (Scenario failed to complete) al intentar publicar en Instagram Business, casi siempre se trata del error **DataError: Only photo or video can be accepted as media type (9004, OAuthException)**.

**Diagnóstico Técnico:**
El JSON y la lógica de Donna pueden estar perfectos, pero Facebook colapsa en la descarga de la imagen por uno de estos motivos:
1. **Espacios en la URL (%20):** Make.com o Meta puede fallar al parsear URLs de Supabase Storage que tengan nombres con espacios.
2. **Archivos PNG nativos o con transparencia:** Instagram Graph API rechaza a menudo PNGs nativos o archivos que en el fondo son WebP forzados. EXIGEN de preferencia JPG estándar.
3. **Relation Aspect (Resolución):** Instagram rechaza tajantemente archivos fuera del espectro 4:5 (vertical) y 1.91:1 (horizontal).

**Solución Documentada:**
Si esto ocurre, no hay que tocar el código de enrutado. Basta con pedirle a Donna que procese una imagen limpia, en JPG estándar, de formato celular/cuadrado y renombrada sin espacios, y enviarla con un webhook inmediato ("publícalo ya").`;

    // Asumimos un objective_id base o nulo si es una regla general técnica.
    const { data, error } = await supabaseAdmin
      .from('donna_memory')
      .insert([{
        topic: 'Regla Instagram API 9004',
        content: memoryContent,
      }])
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error guardando la memoria en Supabase:', error);
      return;
    }

    console.log(`✅ Memoria técnica guardada en Supabase bajo el ID: ${data.id}`);

  } catch (err: any) {
    console.error('❌ Error crudo en el script:', err.message);
  }
}

saveMemory();
