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

async function captureWarnings() {
  loadEnv();
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true
    });

    const targetId = 'd2e9b1b4-bad9-4798-b0a8-a7bf12fe5b20';
    
    // Ejecutar update
    await connection.query('UPDATE articles SET parent_silo = "activaqr-networking" WHERE id = ?', [targetId]);
    
    // Inmediatamente mostrar warnings en la misma conexión
    const [warnings] = await connection.query('SHOW WARNINGS');
    console.log('Advertencias de MySQL:');
    console.log(JSON.stringify(warnings, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

captureWarnings();
