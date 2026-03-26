import fs from 'fs';
import { parse } from 'csv-parse/sync';

async function main() {
  const csvPath = 'BLOG_ESTRATEGICO_2026.csv';
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true, relax_quotes: true });

  const headers = Object.keys(records[0]);
  const newColumns = ['Post_FB', 'Hook_TikTok', 'Script_Video', 'Story_Idea'];

  newColumns.forEach(col => {
    if (!headers.includes(col)) headers.push(col);
  });

  let csvOutput = headers.join(',') + '\n';

  for (const row of records) {
    const line = headers.map(h => {
      let val = row[h] || '';
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
    csvOutput += line + '\n';
  }

  fs.writeFileSync(csvPath, csvOutput);
  console.log("✨ CSV expandido con nuevas columnas para FB, TikTok, YT y Stories.");
}

main().catch(console.error);
