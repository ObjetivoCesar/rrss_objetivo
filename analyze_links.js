const fs = require('fs');
try {
  const csv = fs.readFileSync('c:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\BLOG_ESTRATEGICO_2026.csv', 'utf8');
  const lines = csv.split('\n');
  const hubs = new Set();
  lines.slice(1).forEach(l => {
      const cols = l.split(';'); // ¡Atención! Puede ser separado por punto y coma en español
      if(cols.length < 4) {
          // Intentar por comas si falla
          const colsComma = l.split(',');
          if (colsComma.length > 3) hubs.add(colsComma[3].replace(/"/g, '').trim());
      } else {
          hubs.add(cols[3].replace(/"/g, '').trim());
      }
  });
  console.log('HUB URLs in CSV:', Array.from(hubs));
} catch(e) { console.error(e) }
