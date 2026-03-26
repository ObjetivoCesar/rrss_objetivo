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

async function verifyAndFix() {
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

    // Restaurar título y actualizar el que faltaba
    const targetId = 'd2e9b1b4-bad9-4798-b0a8-a7bf12fe5b20';
    await connection.execute(
      'UPDATE articles SET title = ?, parent_silo = ?, hub_url = ?, cover_image = ? WHERE id = ?',
      [
        'De la Tarjeta de Presentación al Cierre de Ventas Integración CRM', 
        'activaqr-networking', 
        '/desarrollo-web/tarjeta-digital', 
        'https://cesarweb.b-cdn.net/networking-cierre-ventas-crm.webp', 
        targetId
      ]
    );

    console.log('✅ Título restaurado y artículo actualizado.');
    console.log('--- VOLCADO FINAL DE LA TABLA ---');
    
    const [rows] = await connection.execute('SELECT id, title, parent_silo, hub_url FROM articles');
    console.log(JSON.stringify(rows, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

verifyAndFix();
