/**
 * inspect-cotizaciones-mysql.mjs
 * Conecta a la BD del sitio web de producción y muestra
 * las tablas disponibles + las cotizaciones existentes.
 */
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'mysql.us.stackcp.com',
  port: 42903,
  user: 'paginaweb-cesarreyes-353039368e3b',
  password: 'ZSAfOvstk2ID',
  database: 'paginaweb-cesarreyes-353039368e3b',
});

console.log('✅ Conectado a MySQL de producción\n');

// 1. Ver todas las tablas
const [tables] = await conn.query('SHOW TABLES');
console.log('📋 Tablas disponibles:');
tables.forEach(t => console.log(' -', Object.values(t)[0]));

// 2. Buscar tabla de cotizaciones
const tableNames = tables.map(t => Object.values(t)[0]);
const quoteTable = tableNames.find(t => t.toLowerCase().includes('quot') || t.toLowerCase().includes('cotiz') || t.toLowerCase().includes('propues'));

if (quoteTable) {
  console.log(`\n🎯 Tabla encontrada: ${quoteTable}`);
  
  // Ver columnas
  const [cols] = await conn.query(`DESCRIBE \`${quoteTable}\``);
  console.log('\n📐 Columnas:');
  cols.forEach(c => console.log(` - ${c.Field} (${c.Type})`));

  // Ver registros de las 5 cotizaciones
  console.log('\n📦 Registros de las 5 cotizaciones:');
  const slugs = [
    'doris-segarra-caricias-2026',
    'omar-palacio-brazier-2026',
    'daniel-vivanco-central-market-2026',
    'nancy-torres-galtor-2026',
    'vicente-flores-comercios-only-2026',
  ];
  for (const slug of slugs) {
    const [rows] = await conn.query(`SELECT * FROM \`${quoteTable}\` WHERE slug = ? LIMIT 1`, [slug]);
    if (rows.length > 0) {
      const r = rows[0];
      console.log(`\n  [${slug}]`);
      // Mostrar solo los campos relevantes de imagen
      const imgFields = Object.entries(r).filter(([k]) => 
        k.toLowerCase().includes('img') || k.toLowerCase().includes('image') || 
        k.toLowerCase().includes('foto') || k.toLowerCase().includes('fondo') ||
        k.toLowerCase().includes('portada') || k.toLowerCase().includes('url')
      );
      if (imgFields.length > 0) {
        imgFields.forEach(([k, v]) => console.log(`    ${k}: ${v || '(vacío)'}`));
      } else {
        // Mostrar todos si no hay campos de imagen claros
        Object.entries(r).forEach(([k, v]) => {
          if (typeof v === 'string' && v.length < 200) console.log(`    ${k}: ${v || '(vacío)'}`);
        });
      }
    } else {
      console.log(`\n  [${slug}] ⚠️ NO ENCONTRADO en la tabla`);
    }
  }
} else {
  console.log('\n⚠️ No se encontró tabla de cotizaciones. Revisando todas...');
  for (const t of tableNames) {
    console.log(`\nTabla: ${t}`);
    try {
      const [cols] = await conn.query(`DESCRIBE \`${t}\``);
      cols.slice(0, 5).forEach(c => console.log(` - ${c.Field}`));
    } catch(e) {}
  }
}

await conn.end();
