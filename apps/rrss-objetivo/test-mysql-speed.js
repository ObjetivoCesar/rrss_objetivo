const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function test() {
  console.log('Connecting to MySQL...');
  const start = Date.now();
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      connectTimeout: 10000
    });
    console.log(`Connected in ${Date.now() - start}ms`);
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM articles');
    console.log(`Query "SELECT COUNT(*) FROM articles" took ${Date.now() - start}ms. Count: ${rows[0].count}`);
    
    await connection.end();
  } catch (err) {
    console.error('MySQL Error:', err);
  }
}

test();
