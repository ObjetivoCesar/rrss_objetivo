/**
 * delete-draft-article.js
 * Elimina el artículo de prueba directamente desde MySQL usando las credenciales del .env
 */

const mysql  = require('mysql2/promise');
const dotenv = require('dotenv');
const path   = require('path');

dotenv.config({ path: path.join(__dirname, '../apps/rrss-objetivo/.env.local') });

const SLUG_TO_DELETE = 'como-impulsar-tus-negocios-locales-2026';

async function main() {
  const connection = await mysql.createConnection({
    host:     process.env.MYSQL_HOST,
    port:     parseInt(process.env.MYSQL_PORT || '3306'),
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  console.log('✅ Conectado a MySQL');

  // Primero, verificamos si el artículo existe
  const [rows] = await connection.execute(
    'SELECT id, title, slug FROM articles WHERE slug = ?',
    [SLUG_TO_DELETE]
  );

  if (rows.length === 0) {
    console.log(`ℹ️  No se encontró ningún artículo con slug: "${SLUG_TO_DELETE}"`);
    await connection.end();
    return;
  }

  console.log(`\n🔍 Artículo encontrado:`);
  console.log(`   ID:    ${rows[0].id}`);
  console.log(`   Slug:  ${rows[0].slug}`);
  console.log(`   Title: ${rows[0].title}`);

  // Eliminar el artículo
  const [result] = await connection.execute(
    'DELETE FROM articles WHERE slug = ?',
    [SLUG_TO_DELETE]
  );

  if (result.affectedRows > 0) {
    console.log(`\n🗑️  Artículo eliminado correctamente (${result.affectedRows} fila(s) borrada(s))`);
  } else {
    console.log(`\n⚠️  No se eliminó nada — el artículo no existía o ya fue borrado`);
  }

  await connection.end();
  console.log('\n✅ Conexión cerrada. Verifica que la URL ya devuelva 404:');
  console.log('   https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/como-impulsar-tus-negocios-locales-2026');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
