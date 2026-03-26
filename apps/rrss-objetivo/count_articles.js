const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const env = fs.readFileSync(envPath, 'utf8');
        env.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
}

async function countArticles() {
  loadEnv();
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [totalRows] = await connection.execute('SELECT COUNT(*) as total FROM articles');
    console.log(`TOTAL_ARTICLES_IN_DB: ${totalRows[0].total}`);

    const [categoryRows] = await connection.execute('SELECT parent_silo, COUNT(*) as count FROM articles GROUP BY parent_silo');
    console.log('ARTICLES_BY_CATEGORY:');
    categoryRows.forEach(r => console.log(`- ${r.parent_silo || 'Sin Categoría'}: ${r.count}`));

    const [lastRows] = await connection.execute('SELECT title, published_at FROM articles ORDER BY published_at DESC LIMIT 5');
    console.log('TOP_5_RECENT:');
    lastRows.forEach(r => console.log(`- ${r.title} (${r.published_at})`));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

countArticles();
