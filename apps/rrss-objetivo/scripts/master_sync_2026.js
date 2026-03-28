const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function masterSync() {
    console.log('--- STARTING MASTER SYNC 2026 ---');

    // 1. PURGE Range (Mar 20 - May 10) - Ensuring total cleanup
    console.log('Purging legacy posts...');
    const { error: purgeError } = await supabase
        .from('social_posts')
        .update({ archived_at: new Date().toISOString() })
        .gte('scheduled_for', '2026-03-20T00:00:00Z')
        .lte('scheduled_for', '2026-05-10T23:59:59Z')
        .is('archived_at', null);

    if (purgeError) {
        console.error('Error in purge:', purgeError);
        return;
    }

    // 2. Read CSV
    const csvPath = path.join(process.cwd(), '../../', 'BLOG_ESTRATEGICO_2026.csv');
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const rows = lines.slice(1).filter(l => l.startsWith('1,') || l.startsWith('2,') || l.match(/^\d+,/)); // Extract only valid data rows

    console.log(`Found ${rows.length} rows in CSV.`);

    // 3. Daily Posting Logic (Viral-Valor-Venta)
    const postsToInsert = [];
    const startDate = new Date('2026-03-27T08:00:00-05:00'); // Today (Ecuador)
    
    // Mapping rules per Weekday (0=Sun, 1=Mon, ...)
    const gridRules = {
        0: { cat: 'venta', time: '11:00', label: 'Venta-Story' },
        1: { cat: 'viral', time: '08:00', label: 'Viral-Hook' },
        2: { cat: 'viral', time: '08:00', label: 'Viral-Controv' },
        3: { cat: 'valor', time: '07:30', label: 'Valor-Guia' },
        4: { cat: 'viral', time: '19:00', label: 'Viral-Trend' }, // Jueves noche
        5: { cat: 'valor', time: '07:30', label: 'Valor-Tutorial' },
        6: { cat: 'venta', time: '10:00', label: 'Venta-Directo' }
    };

    for (let i = 0; i < rows.length; i++) {
        const line = rows[i];
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length < 5) continue;

        const id = parts[0];
        const title = parts[2]?.replace(/^"|"$/g, '');
        const liPost = parts[14]?.replace(/^"|"$/g, ''); // LinkedIn text
        const imagePrompt = parts[20]?.replace(/^"|"$/g, '');

        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const weekday = currentDate.getDay();
        const rule = gridRules[weekday];
        
        // Format: YYYY-MM-DDTHH:mm:ss-05:00
        const dateStr = currentDate.toISOString().split('T')[0];
        const scheduledAt = `${dateStr}T${rule.time}:00-05:00`;

        postsToInsert.push({
            content_text: liPost || title,
            scheduled_for: scheduledAt,
            platforms: ['facebook', 'instagram', 'linkedin'],
            status: 'pending',
            category_id: rule.cat === 'valor' ? 'educativo' : (rule.cat === 'venta' ? 'personal' : 'carrusel'),
            metadata: {
                csv_id: id,
                grid_strategy: rule.cat.toUpperCase(),
                grid_label: rule.label,
                image_prompt: imagePrompt
            }
        });
    }

    console.log(`Inserting ${postsToInsert.length} posts...`);
    const { error: insertError } = await supabase
        .from('social_posts')
        .insert(postsToInsert);

    if (insertError) {
        console.error('Error inserting:', insertError);
    } else {
        console.log('MASTER SYNC SUCCESSFUL!');
    }
}

masterSync();
