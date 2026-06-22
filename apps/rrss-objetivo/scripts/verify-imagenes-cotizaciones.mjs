/**
 * verify-imagenes-cotizaciones.mjs
 * Lee las 5 filas de la tabla cotizaciones y confirma
 * que imagen_url y url_fondo quedaron guardados correctamente.
 */
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'mysql.us.stackcp.com',
  port: 42903,
  user: 'paginaweb-cesarreyes-353039368e3b',
  password: 'ZSAfOvstk2ID',
  database: 'paginaweb-cesarreyes-353039368e3b',
});

const IDS = [
  'doris-segarra-caricias-2026',
  'omar-palacio-brazier-2026',
  'daniel-vivanco-central-market-2026',
  'nancy-torres-galtor-2026',
  'vicente-flores-comercios-only-2026',
];

for (const id of IDS) {
  const [rows] = await conn.query('SELECT id, data, updated_at FROM `cotizaciones` WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) { console.log(`⚠️  ${id} — NO encontrado`); continue; }

  const data = JSON.parse(rows[0].data);
  const p = data.portada || {};

  const ok_img    = p.imagen_url && p.imagen_url.startsWith('http');
  const ok_fondo  = p.url_fondo  && p.url_fondo.startsWith('http');

  console.log(`\n${ok_img && ok_fondo ? '✅' : '❌'} ${id}`);
  console.log(`   imagen_url : ${p.imagen_url || '(vacío)'}`);
  console.log(`   url_fondo  : ${p.url_fondo  || '(vacío)'}`);
  console.log(`   updated_at : ${rows[0].updated_at}`);
}

await conn.end();
console.log('\n✅ Verificación completada.');
