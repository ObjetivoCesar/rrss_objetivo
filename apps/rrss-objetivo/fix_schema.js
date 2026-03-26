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

async function inspectSchema() {
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

    const [rows] = await connection.execute('SHOW COLUMNS FROM articles WHERE Field = "parent_silo" OR Field = "hub_url"');
    console.log(JSON.stringify(rows, null, 2));
    
    // Y un intento de ALTER para arreglarlo rápido
    console.log('--- Aplicando ALTER TABLE por si acaso ---');
    await connection.execute('ALTER TABLE articles MODIFY COLUMN parent_silo VARCHAR(255) NULL');
    await connection.execute('ALTER TABLE articles MODIFY COLUMN hub_url VARCHAR(255) NULL');
    console.log('✅ ALTER ejecutado (varchar 255)');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

inspectSchema();
