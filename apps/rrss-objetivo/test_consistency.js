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

async function test() {
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

    const targetId = 'd2e9b1b4-bad9-4798-b0a8-a7bf12fe5b20';
    console.log('--- Antes ---');
    let [rows] = await connection.execute('SELECT parent_silo FROM articles WHERE id = ?', [targetId]);
    console.log(rows[0]);

    console.log('--- Actualizando ---');
    await connection.execute('UPDATE articles SET parent_silo = ? WHERE id = ?', ['activaqr-networking', targetId]);

    console.log('--- Después ---');
    [rows] = await connection.execute('SELECT parent_silo FROM articles WHERE id = ?', [targetId]);
    console.log(rows[0]);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

test();
