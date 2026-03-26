const { createClient } = require('@supabase/supabase-js');

// Usando Service Role Key del .env.local real
const SUPABASE_URL = "https://fcfsexddgupnvbvntgyz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE1NzkwOSwiZXhwIjoyMDc2NzMzOTA5fQ.4ipX_DaVdz1qAKoLi1z5pb7p9UT5W7pDzgZOIs5NGuc";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    // 1. Ver logs del sistema para diagnosticar
    console.log("📋 Últimos 10 logs del sistema:");
    const { data: logs } = await supabase
        .from('system_logs')
        .select('service, severity, message, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
    
    if (logs && logs.length > 0) {
        logs.forEach(l => console.log(`[${l.severity}] ${l.service}: ${l.message} (${l.created_at})`));
    } else {
        console.log("No hay logs aún.");
    }

    // 2. Ver el post de IA en Ecuador
    console.log("\n🔍 Buscando posts de IA en Ecuador:");
    const { data: posts } = await supabase
        .from('social_posts')
        .select('id, topic, status, scheduled_for, platforms, media_urls')
        .eq('topic', 'IA en Ecuador')
        .is('archived_at', null);

    console.log(JSON.stringify(posts, null, 2));

    // 3. Si existe el post de IG, actualizarlo para las 00:30
    const postIG = posts && posts.find(p => p.platforms && p.platforms.includes('instagram'));
    if (!postIG) { console.log("No hay post de instagram en IA en Ecuador."); return; }

    const { error: updErr } = await supabase
        .from('social_posts')
        .update({ scheduled_for: '2026-03-26T05:30:00.000Z', status: 'pending' })
        .eq('id', postIG.id);

    if (updErr) console.error("Error actualizando:", updErr);
    else console.log(`\n✅ Post ${postIG.id} → programado para 00:30 EC. Media URLs: ${postIG.media_urls?.length || 0}`);
}

run();
