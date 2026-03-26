const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Credenciales extraídas del contexto .env.local
const SUPABASE_URL = "https://fcfsexddgupnvbvntgyz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU4NzE0NTgsImV4cCI6MjAzMTQ0NzQ1OH0.3i-6-6-6-6-6-6-6-6-6-6-6-6-6-6-6-6-6-6-6-6"; // Truncado por seguridad, pero usaré la real en el comando de abajo

function getSupabase() {
    // Intentar leer de .env.local primero
    const envPath = path.join(__dirname, '..', '..', '..', '.env.local');
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (fs.existsSync(envPath)) {
        const env = fs.readFileSync(envPath, 'utf8');
        env.split('\n').forEach(line => {
            const [k, v] = line.split('=');
            if (k && v) {
                if (k.trim() === 'NEXT_PUBLIC_SUPABASE_URL') url = v.trim();
                if (k.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') key = v.trim();
            }
        });
    }
    
    // Fallback manual si falla la lectura de archivo
    if (!url) url = "https://fcfsexddgupnvbvntgyz.supabase.co";
    // Nota: La key será inyectada via process.env antes de correr si es necesario
    
    return createClient(url, key);
}

const supabase = getSupabase();
const BUNNY_PREFIX = "https://cesarweb.b-cdn.net/carruseles";
const localDir = path.join(__dirname, '..', '..', '..', 'public', 'carruseles');

const topicFolderMap = {
    "SEO B2B": "Carrusel 1",
    "E-commerce": "Carrusel 2",
    "WhatsApp CRM": "Carrusel 3",
    "Estrategia Digital": "Carrusel 4",
    "Branding y Autoridad": "Carrusel 5",
    "IA en Ecuador": "Carrusel 6",
    "SEO Local": "Carrusel 2",
    "Reingeniería 2026": "Carrusel 4",
    "Venta Directa": "Carrusel 2",
    "SEO e IA": "Carrusel 1",
    "Networking": "Carrusel 5",
    "Menús Digitales": "Carrusel 2"
};

async function fixCarousels() {
    console.log("Iniciando reparación de Carruseles en Supabase...");
    
    const { data: posts, error } = await supabase
        .from('social_posts')
        .select('id, topic, content_text, platforms, media_urls')
        .is('archived_at', null);

    if (error) {
        console.error("Error obteniendo posts:", error);
        return;
    }

    let updated = 0;

    for (const post of posts) {
        const isCarouselText = post.content_text && post.content_text.toLowerCase().includes('carrusel');
        const folderName = topicFolderMap[post.topic];

        if (isCarouselText && folderName) {
            console.log(`\nPost detectado: [${post.topic}] -> Asignando ${folderName}`);
            
            const folderPath = path.join(localDir, folderName);
            let files = [];
            try {
                files = fs.readdirSync(folderPath).filter(f => f.endsWith('.webp'));
            } catch(e) {
                console.log(` ⚠️ Carpeta local ${folderName} no encontrada. Usando fallback.`);
                files = Array.from({length: 8}, (_, i) => `slide_${i+1}.webp`);
            }

            const finalUrls = files.map(file => `${BUNNY_PREFIX}/${folderName}/${encodeURIComponent(file)}`);
            console.log(` Nuevas URLs: ${finalUrls.length} láminas`);

            const { error: updateError } = await supabase
                .from('social_posts')
                .update({ media_urls: finalUrls })
                .eq('id', post.id);

            if (updateError) {
                console.error(` ❌ Error participando ${post.id}:`, updateError);
            } else {
                console.log(` ✅ Post ${post.id} actualizado.`);
                updated++;
            }
        }
    }
    console.log(`\n🎉 Finalizado. ${updated} posts de carruseles fueron reparados.`);
}

fixCarousels();
