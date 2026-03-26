const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
const fs = require('fs');

async function debug() {
    const env = fs.readFileSync('.env.local', 'utf8');
    const processEnv = {};
    env.split('\n').forEach(l => {
        const [k, v] = l.split('=');
        if(k && v) processEnv[k.trim()] = v.trim();
    });

    const supabase = createClient(processEnv.NEXT_PUBLIC_SUPABASE_URL, processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    console.log('--- SUPABASE SOCIAL POSTS (Last 5) ---');
    const { data: posts, error: postError } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false }).limit(5);
    if (postError) console.error('Supabase Error:', postError);
    else console.log(JSON.stringify(posts, null, 2));

    console.log('\n--- MYSQL ARTICLE (IA Ecuador) ---');
    try {
        const connection = await mysql.createConnection({
            host: 'mysql.us.stackcp.com',
            port: 42903,
            user: 'paginaweb-cesarreyes-353039368e3b',
            password: 'ZSAfOvstk2ID',
            database: 'paginaweb-cesarreyes-353039368e3b',
            connectTimeout: 5000
        });
        const [rows] = await connection.execute('SELECT title, slug, cover_image FROM articles WHERE slug LIKE "%ia-ecuador%"');
        console.log(JSON.stringify(rows, null, 2));
        await connection.end();
    } catch (err) {
        console.error('MySQL Error:', err.message);
    }
}

debug();
