const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getSupabase() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const env = fs.readFileSync(envPath, 'utf8');
        env.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
    
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

async function checkSupabase() {
    const supabase = getSupabase();
    
    // Primero, veamos la estructura (trayendo un registro o intentando)
    const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .limit(1);
        
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Resultados de social_posts:', data);
    }
}

checkSupabase();
