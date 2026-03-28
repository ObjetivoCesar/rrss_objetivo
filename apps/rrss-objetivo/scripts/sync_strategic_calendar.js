
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/apps/rrss-objetivo/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const csvPath = 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/BLOG_ESTRATEGICO_2026.csv';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Grid Mapping: [ID, Date, Time, Type]
const grid = [
  { id: 15, date: '2026-03-28', time: '10:00', label: 'Venta-Story' },
  { id: 5,  date: '2026-03-29', time: '15:00', label: 'Venta-Directo' },
  { id: 1,  date: '2026-03-30', time: '07:30', label: 'Viral-IA' },
  { id: 2,  date: '2026-03-31', time: '07:30', label: 'Viral-Trend' },
  { id: 4,  date: '2026-04-01', time: '07:30', label: 'Valor-Pilar' },
  { id: 3,  date: '2026-04-02', time: '07:30', label: 'Viral-Contra' },
  { id: 6,  date: '2026-04-03', time: '07:30', label: 'Valor-Tips' },
  { id: 24, date: '2026-04-04', time: '10:00', label: 'Venta-Story' },
  { id: 17, date: '2026-04-05', time: '15:00', label: 'Venta-Directo' },
  { id: 11, date: '2026-04-06', time: '07:30', label: 'Viral-IA' },
  { id: 8,  date: '2026-04-07', time: '07:30', label: 'Viral-Trend' },
  { id: 9,  date: '2026-04-08', time: '07:30', label: 'Valor-Pilar' },
  { id: 18, date: '2026-04-09', time: '07:30', label: 'Viral-Contra' },
  { id: 12, date: '2026-04-10', time: '07:30', label: 'Valor-Tips' },
  { id: 23, date: '2026-04-11', time: '10:00', label: 'Venta-Story' },
  { id: 21, date: '2026-04-12', time: '15:00', label: 'Venta-Directo' },
  { id: 10, date: '2026-04-13', time: '07:30', label: 'Viral-Impact' },
  { id: 14, date: '2026-04-14', time: '07:30', label: 'Viral-IA' },
  { id: 13, date: '2026-04-15', time: '07:30', label: 'Valor-Pilar' },
  { id: 7,  date: '2026-04-16', time: '07:30', label: 'Viral-Contra' },
  { id: 16, date: '2026-04-17', time: '13:00', label: 'Valor-Tips' },
  { id: 22, date: '2026-04-18', time: '10:00', label: 'Venta-Story' },
  { id: 19, date: '2026-04-19', time: '15:00', label: 'Venta-Directo' },
  { id: 20, date: '2026-04-20', time: '07:30', label: 'Viral-Trend' }
];

async function run() {
  const content = fs.readFileSync(csvPath, 'utf8');
  // Simple heuristic parsing for this specific CSV structure
  // Each ID row starts with an ID number at the beginning of the line
  const lines = content.split('\n');
  let newContent = lines[0].trim() + ",Scheduled_At\n";
  
  const postsToInsert = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const match = line.match(/^(\d+),/);
    if (match) {
      const id = parseInt(match[1]);
      const scheduleEntry = grid.find(g => g.id === id);
      if (scheduleEntry) {
        const scheduledAt = `${scheduleEntry.date}T${scheduleEntry.time}:00-05:00`;
        newContent += line.trim() + ',"' + scheduledAt + '"\n';
        
        // Prepare for Supabase
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma outside quotes
        postsToInsert.push({
          content_text: parts[14] ? parts[12].replace(/^"|"$/g, '') : parts[2].replace(/^"|"$/g, ''),
          scheduled_for: scheduledAt,
          platforms: ['facebook', 'instagram', 'linkedin'],
          status: 'pending',
          media_urls: [parts[10]?.replace(/^"|"$/g, '') || ''],
          category_id: parts[3]?.replace(/^"|"$/g, '') === 'Pilar' ? 'educativo' : 'carrusel',
          metadata: {
            csv_id: id,
            grid_label: scheduleEntry.label,
            silo: parts[1]?.replace(/^"|"$/g, '')
          }
        });
      } else {
        newContent += line.trim() + ',\n';
      }
    } else {
      // It's a continuation line (multi-line prompt)
      newContent += line.trim() + '\n';
    }
  }

  // Write new CSV
  fs.writeFileSync(csvPath.replace('.csv', '_SCHEDULED.csv'), newContent);
  console.log("CSV generated: BLOG_ESTRATEGICO_2026_SCHEDULED.csv");

  // Insert into Supabase
  console.log(`Inserting ${postsToInsert.length} posts into Supabase...`);
  const { error } = await supabase.from('social_posts').insert(postsToInsert);
  
  if (error) {
    console.error("Error inserting posts:", error);
  } else {
    console.log("Sync successful!");
  }
}

run();
