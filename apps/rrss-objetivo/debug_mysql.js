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

async function debugUpdate() {
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
    
    console.log('--- TEST 1: Actualizar parent_silo ---');
    const [res1] = await connection.query('UPDATE articles SET parent_silo = "TEST_VALUE" WHERE id = ?', [targetId]);
    console.log('Resultado:', res1);
    
    let [rows] = await connection.query('SELECT parent_silo FROM articles WHERE id = ?', [targetId]);
    console.log('Valor en DB:', rows[0]);

    if (rows[0].parent_silo !== 'TEST_VALUE') {
      console.log('⚠️ FALLO: El valor no se guardó. Intentando actualizar el título para probar permisos.');
      const [res2] = await connection.query('UPDATE articles SET title = CONCAT(title, " [UPDATED]") WHERE id = ?', [targetId]);
      console.log('Resultado Título:', res2);
      
      [rows] = await connection.query('SELECT title FROM articles WHERE id = ?', [targetId]);
      console.log('Nuevo Título:', rows[0].title);
    }

  } catch (error) {
    console.error('Error Crítico:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

debugUpdate();
