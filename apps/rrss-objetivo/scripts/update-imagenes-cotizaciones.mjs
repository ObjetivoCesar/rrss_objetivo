/**
 * update-imagenes-cotizaciones.mjs
 * Lee cada fila de la tabla `cotizaciones`, inyecta imagen_url + url_fondo
 * en el campo data (JSON) y actualiza el registro.
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

// Mapa: id → imagen de portada
const IMAGENES = {
  'doris-segarra-caricias-2026':
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=2067&auto=format&fit=crop',
  'omar-palacio-brazier-2026':
    'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop',
  'daniel-vivanco-central-market-2026':
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1974&auto=format&fit=crop',
  'nancy-torres-galtor-2026':
    'https://images.unsplash.com/photo-1581007871115-f14bc016e0a4?q=80&w=1965&auto=format&fit=crop',
  'vicente-flores-comercios-only-2026':
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop',
};

let ok = 0;
let fail = 0;

for (const [id, imgUrl] of Object.entries(IMAGENES)) {
  try {
    // Leer fila actual
    const [rows] = await conn.query('SELECT id, data FROM `cotizaciones` WHERE id = ? LIMIT 1', [id]);

    if (rows.length === 0) {
      console.log(`⚠️  ${id} — NO encontrado en la tabla. Saltando.`);
      fail++;
      continue;
    }

    const row = rows[0];
    let data;
    try {
      data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    } catch (e) {
      console.error(`❌ ${id} — Error parseando JSON: ${e.message}`);
      fail++;
      continue;
    }

    // Inyectar imagen en portada
    if (!data.portada) data.portada = {};
    data.portada.imagen_url = imgUrl;
    data.portada.url_fondo  = imgUrl;

    // Guardar de vuelta
    await conn.query(
      'UPDATE `cotizaciones` SET data = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(data), id]
    );

    console.log(`✅ ${id}`);
    console.log(`   → imagen_url = ${imgUrl.substring(0, 60)}...`);
    ok++;
  } catch (err) {
    console.error(`❌ ${id} — Error: ${err.message}`);
    fail++;
  }
}

console.log(`\n=== RESULTADO: ${ok} actualizadas, ${fail} fallidas ===`);
await conn.end();
