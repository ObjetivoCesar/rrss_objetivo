const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

// Parser customizado para manejar comillas y saltos de línea internos
function parseCSV(str) {
    let ObjectRows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < str.length && str[i + 1] === '"') {
                    currentCell += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                currentCell += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentCell);
                currentCell = '';
            } else if (char === '\n' || char === '\r') {
                if (char === '\r' && i + 1 < str.length && str[i+1] === '\n') {
                    i++;
                }
                currentRow.push(currentCell);
                ObjectRows.push(currentRow);
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
    }
    if (currentCell !== '' || currentRow.length > 0) {
        currentRow.push(currentCell);
        if (currentRow.length > 0) ObjectRows.push(currentRow);
    }
    return ObjectRows;
}

async function run() {
  console.log("--- INICIANDO CARGA DEFINITIVA DE CALENDARIO ---");

  // 1. HARD DELETE
  console.log("Borrando físicamente los posts agendados entre el 28 de marzo y 20 de abril...");
  const { error: delError, count } = await supabase
    .from('social_posts')
    .delete({ count: 'exact' })
    .gte('scheduled_for', '2026-03-27T00:00:00Z') // Delete slightly wide range just in case
    .lte('scheduled_for', '2026-04-21T00:00:00Z');

  if (delError) {
    console.error("Error en hard delete:", delError);
    return;
  }
  console.log(`Deleted posts result: Done. (Count tracking depending on API response format)`);

  // 2. PARSE CSV ORIGINAL
  const csvPath = 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/BLOG_ESTRATEGICO_2026.csv';
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  
  const parsedRows = parseCSV(fileContent);
  const headers = parsedRows[0];
  const dataRows = parsedRows.slice(1);

  console.log(`CSV Original procesado correctamente. Filas leídas: ${dataRows.length}`);

  const postsToInsert = [];

  for (const row of dataRows) {
      if (row.length < 5) continue; // Skip empty rows

      const id = parseInt(row[0]);
      if (isNaN(id)) continue; 

      const scheduleEntry = grid.find(g => g.id === id);
      if (scheduleEntry) {
        const scheduledAt = `${scheduleEntry.date}T${scheduleEntry.time}:00-05:00`;
        
        // Col 12: Post FB, 13: IG, 14: LI, 15: X
        // Vamos a usar LinkedIn if available, else Title (Col 2), else Facebook
        const title = row[2];
        const liPost = row[14];
        const fbPost = row[12];
        const textToUse = liPost ? liPost : (fbPost ? fbPost : title);
        
        const mediaUrl = row[10] || '';
        const categoryLabel = row[3]; // Pilar or Cluster
        
        postsToInsert.push({
            content_text: textToUse,
            scheduled_for: scheduledAt,
            platforms: ['facebook', 'instagram', 'linkedin'],
            status: 'pending', // IMPORTANT: pending ensures the scheduler picks it up
            media_urls: mediaUrl ? [mediaUrl] : [],
            category_id: categoryLabel === 'Pilar' ? 'educativo' : 'carrusel',
            metadata: {
                csv_id: id,
                grid_label: scheduleEntry.label,
                silo: row[1]
            }
        });
      }
  }

  // 3. INSERT INTO SUPABASE
  console.log(`Insertando ${postsToInsert.length} posts a Supabase...`);
  const { error: insertError } = await supabase.from('social_posts').insert(postsToInsert);

  if (insertError) {
      console.error("Error en inserción:", insertError);
  } else {
      console.log(`✅ ¡ÉXITO! ${postsToInsert.length} posts programados correctamente.`);
      console.log("Puedes verificar el calendario ahora.");
  }
}

run();
