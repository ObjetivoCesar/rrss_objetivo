const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Service Role Key de .env.local (la que tiene permisos de escritura saltando RLS)
const SUPABASE_URL = "https://fcfsexddgupnvbvntgyz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE1NzkwOSwiZXhwIjoyMDc2NzMzOTA5fQ.4ipX_DaVdz1qAKoLi1z5pb7p9UT5W7pDzgZOIs5NGuc";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
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

async function syncAll() {
    console.log("🚀 Iniciando sincronización masiva de Carruseles...");
    
    // 1. Obtener todos los posts (solo no archivados)
    const { data: posts, error } = await supabase
        .from('social_posts')
        .select('*')
        .is('archived_at', null);

    if (error) { console.error("Error:", error); return; }

    let updatedCount = 0;

    for (const post of posts) {
        // Detectar si es carrusel por texto o por existencia en mapa
        const isCarousel = post.content_text?.toLowerCase().includes('carrusel') || !!topicFolderMap[post.topic];
        const folderName = topicFolderMap[post.topic];

        if (isCarousel && folderName) {
            const folderPath = path.join(localDir, folderName);
            let files = [];
            try {
                if (fs.existsSync(folderPath)) {
                    files = fs.readdirSync(folderPath)
                        .filter(f => f.endsWith('.webp'))
                        .sort(); // Ordenar alfabéticamente para que slide_1 sea la primera
                }
            } catch (e) {}

            if (files.length > 0) {
                const media_urls = files.map(file => `${BUNNY_PREFIX}/${folderName}/${encodeURIComponent(file)}`);
                
                // Actualizar Supabase
                const { error: updErr } = await supabase
                    .from('social_posts')
                    .update({ media_urls: media_urls })
                    .eq('id', post.id);

                if (!updErr) {
                    console.log(`✅ [${post.topic}] Sincronizado: ${media_urls.length} láminas.`);
                    updatedCount++;
                } else {
                    console.error(`❌ Error en post ${post.id}:`, updErr);
                }
            }
        }
    }

    // 2. Programar el carrusel de prueba (IA en Ecuador - Instagram) para las 00:45
    console.log("\n⏲️ Programando post de prueba para las 00:45...");
    const postPrueba = posts.find(p => p.topic === 'IA en Ecuador' && p.platforms?.includes('instagram'));
    
    if (postPrueba) {
        const { error: testErr } = await supabase
            .from('social_posts')
            .update({
                scheduled_for: '2026-03-26T05:45:00.000Z',
                status: 'pending'
            })
            .eq('id', postPrueba.id);
        
        if (!testErr) console.log(`✅ Post de prueba ${postPrueba.id} programado.`);
    }

    console.log(`\n🎉 Sincronización finalizada. ${updatedCount} posts actualizados.`);
}

syncAll();
