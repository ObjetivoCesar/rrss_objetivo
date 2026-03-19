const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkImages() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectTimeout: 10000
  });

  // Check article_images table
  console.log('--- article_images table ---');
  const [imgSchema] = await connection.query('DESCRIBE article_images');
  console.log(JSON.stringify(imgSchema, null, 2));

  // Check a few existing cover_image values  
  console.log('\n--- cover_image URLs from articles ---');
  const [rows] = await connection.query("SELECT id, SUBSTRING(title, 1, 50) as title, SUBSTRING(cover_image, 1, 150) as img FROM articles WHERE cover_image IS NOT NULL AND cover_image != '' LIMIT 5");
  rows.forEach(r => console.log(`ID:${r.id} | ${r.title} | IMG: ${r.img}`));

  // Check the article we just published
  console.log('\n--- Our article ---');
  const [ours] = await connection.query("SELECT id, title, cover_image FROM articles WHERE slug LIKE '%empresa-no-crece%'");
  console.log(JSON.stringify(ours, null, 2));

  await connection.end();
}

checkImages().catch(e => { console.error(e.message); process.exit(1); });
