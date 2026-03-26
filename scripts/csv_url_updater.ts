import fs from 'fs';
import { parse } from 'csv-parse/sync';

async function main() {
  const csvPath = 'BLOG_ESTRATEGICO_2026.csv';
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true, relax_quotes: true });

  const baseUrl = 'https://www.cesarreyesjaramillo.com/blog';

  console.log("🚀 Generando enlaces finales en el CSV...");

  const headers = Object.keys(records[0]);
  if (!headers.includes('URL_Final')) headers.push('URL_Final');

  let csvOutput = headers.join(',') + '\n';

  for (const row of records) {
    const categoryName = row.Silo || '';
    const slug = row.Slug || '';

    let parent_silo = 'marketing-para-pymes';
    if (categoryName.toLowerCase().includes('automatizacion')) parent_silo = 'automatizacion-de-ventas';
    else if (categoryName.toLowerCase().includes('seo') || categoryName.toLowerCase().includes('posicionamiento')) parent_silo = 'posicionamiento-en-google';
    else if (categoryName.toLowerCase().includes('activaqr') || categoryName.toLowerCase().includes('networking')) parent_silo = 'activaqr';

    row.URL_Final = `${baseUrl}/${parent_silo}/${slug}`;

    const line = headers.map(h => {
      let val = row[h] || '';
      // Escapar comillas dobles y envolver en comillas si hay comas o saltos de línea
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
    
    csvOutput += line + '\n';
  }

  fs.writeFileSync(csvPath, csvOutput);
  console.log("✨ CSV actualizado con la columna 'URL_Final'.");
}

main().catch(console.error);
