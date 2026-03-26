const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

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

async function run() {
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

    const [cols] = await connection.execute("SHOW COLUMNS FROM articles");
    const fields = cols.map(c => c.Field);
    console.log('Columnas encontradas:', fields);

    if (!fields.includes('parent_silo')) {
      console.log('⚠️ Agregando columna parent_silo...');
      await connection.execute("ALTER TABLE articles ADD COLUMN parent_silo VARCHAR(100) NULL AFTER slug");
    }
    if (!fields.includes('hub_url')) {
      console.log('⚠️ Agregando columna hub_url...');
      await connection.execute("ALTER TABLE articles ADD COLUMN hub_url VARCHAR(255) NULL AFTER parent_silo");
    }

    console.log('✅ Columnas verificadas/agregadas.');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

run();
