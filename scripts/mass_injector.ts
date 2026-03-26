import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

async function main() {
  const csvPath = path.join(__dirname, '../BLOG_ESTRATEGICO_2026.csv');
  const str = fs.readFileSync(csvPath, 'utf8');

  // Parse CSV
  const records = parse(str, { skip_empty_lines: true, relax_quotes: true, relax_column_count: true });
  const rows = records as string[][];
  rows.shift(); // remove header

  console.log(`CSV cargado con ${rows.length} filas.`);

  // Load all markdown articles from docs/borradores
  const draftsDir = path.join(__dirname, '../docs/borradores');
  const files = fs.readdirSync(draftsDir).filter(f => f.endsWith('.md'));
  
  let allArticles: Array<{title: string, markdown: string}> = [];

  for (const file of files) {
    const filePath = path.join(draftsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Split articles if there are multiple in one file (marked by # Título)
    const blocks = content.split(/^#\s+/m).filter(b => b.trim().length > 0);
    
    for (const block of blocks) {
      if (block.trim().length < 200) continue; // Skip small fragments
      const lines = block.split('\n');
      const rawTitle = lines[0].trim();
      const markdown = '# ' + block.trim();
      allArticles.push({ title: rawTitle.replace(/\*+/g,'').trim(), markdown });
    }
  }

  console.log(`Encontrados ${allArticles.length} bloques H1 en los archivos Markdown locales.`);

  // Build final array to inject
  const toInject = [];
  
  for (const row of rows) {
    const csvTitle = row[2] ? row[2].trim() : '';
    if (!csvTitle) continue;
    
    // Encuentra el bloque markdown que haga match parcial con el título del CSV
    // Comparamos los primeros 15-20 caracteres ignorando acentos
    const csvTNormalize = csvTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 20);
    let match = allArticles.find(a => {
      const aTNormalize = a.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return aTNormalize.includes(csvTNormalize) || csvTNormalize.includes(aTNormalize.substring(0, 20));
    });

    // Match manual para los 4 rebeldes
    if (!match) {
      if (csvTitle.includes("Inteligencia Artificial") && csvTitle.includes("Caso Real")) {
        match = allArticles.find(a => a.title.includes("IA en Ecuador"));
      } else if (csvTitle.includes("Mi hijo maneja las redes")) {
        match = allArticles.find(a => a.title.includes("Mi hijo sabe de eso"));
      } else if (csvTitle.includes("Google Maps")) {
        match = allArticles.find(a => a.title.includes("Guia Definitiva de SEO Local"));
      } else if (csvTitle.includes("Excel")) {
        match = allArticles.find(a => a.title.includes("administrando tu empresa en Excel"));
      }
    }

    if (match) {
      toInject.push({
        csvRow: row,
        markdown: match.markdown
      });
    } else {
      console.log('⚠️ No se encontró Markdown local para la fila CSV:', csvTitle);
    }
  }

  console.log(`Match exitoso: ${toInject.length} artículos listos para inyección.`);

  const today = new Date();
  let successCount = 0;
  
  for (let i = 0; i < toInject.length; i++) {
    const item = toInject[i];
    const r = item.csvRow;
    const categoryName = r[1] || '';
    const title = r[2] || '';
    const hub_url = r[5] || '';
    const thumbnail = r[10] || '';

    // Spread dates: 90 days backwards
    const d = new Date(today.getTime());
    const daysAgo = Math.floor((toInject.length - 1 - i) * (90 / Math.max(1, toInject.length)));
    d.setDate(d.getDate() - daysAgo);

    let parent_silo = 'marketing-para-pymes';
    if (categoryName.toLowerCase().includes('automatizacion')) parent_silo = 'automatizacion-de-ventas';
    else if (categoryName.toLowerCase().includes('seo') || categoryName.toLowerCase().includes('posicionamiento')) parent_silo = 'posicionamiento-en-google';
    else if (categoryName.toLowerCase().includes('activaqr') || categoryName.toLowerCase().includes('networking')) parent_silo = 'activaqr';

    const payload = {
      title,
      category: '1',
      excerpt: '',
      metaDescription: '',
      image: thumbnail, // We map thumbnail here
      markdown: item.markdown,
      hub_url,
      parent_silo,
      published_at: d.toISOString()
    };

    console.log(`[${i+1}/${toInject.length}] Inyectando: "${title.substring(0,40)}..." (${d.toISOString().split('T')[0]})`);

    try {
      const res = await fetch('http://localhost:3000/api/seo-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'CONFLICT') {
          console.log(` ---> ⚠️ Ignorado: Ya existe en la DB (409).`);
        } else {
          console.error(` ---> ❌ Error:`, data);
        }
      } else {
        console.log(` ---> ✅ Guardado ID: ${data.insertId}`);
        successCount++;
      }
    } catch (e: any) {
      console.error(` ---> ❌ Fetch failed:`, e.message);
    }
  }

  console.log(`\nInyección finalizada. ${successCount} artículos nuevos insertados con éxito.`);
}

main().catch(console.error);
