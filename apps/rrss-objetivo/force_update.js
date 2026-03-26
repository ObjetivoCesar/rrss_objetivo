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

const FORCED_UPDATES = [
  { id: 'd2e9b1b4-bad9-4798-b0a8-a7bf12fe5b20', silo: 'activaqr-networking', hub: '/desarrollo-web/tarjeta-digital' },
  { id: 'e4cbb661-86f8-4f28-8e6b-e9e221183e93', silo: 'activaqr-networking', hub: '/desarrollo-web/tarjeta-digital' },
  { id: '56acd72f-0cf3-4778-8971-760f91ab5d5d', silo: 'activaqr-networking', hub: '/desarrollo-web/tu-contacto-profesional' },
  { id: '5fe40e74-f099-45b2-b4ae-9a3e011660b8', silo: 'activaqr-networking', hub: '/desarrollo-web/tarjeta-digital' },
  { id: 'a96e0334-1ca2-4cc4-9c77-3dafa3efb569', silo: 'activaqr-gastronomia', hub: '/desarrollo-web/tu-sucursal-online' },
  { id: 'e7c19fa1-96e1-4774-b48e-27802fe60c1f', silo: 'activaqr-gastronomia', hub: '/desarrollo-web/tu-sucursal-online' },
  { id: 'd5415cd7-af80-41b5-b970-b4a748a1485a', silo: 'activaqr-gastronomia', hub: '/desarrollo-web/tu-sucursal-online' },
  { id: 'ce0f17b8-7988-40bc-8a80-aa8dd7fa0546', silo: 'activaqr-gastronomia', hub: '/desarrollo-web/tu-sucursal-online' },
  { id: 'd47145f3-4ce2-4881-a034-ba380be62f98', silo: 'activaqr-networking', hub: '/desarrollo-web/tu-contacto-profesional' },
  { id: 'dbefaba9-50c2-44b1-893e-4876b4dffe0f', silo: 'activaqr-networking', hub: '/desarrollo-web/tarjeta-digital' }
];

async function forceUpdate() {
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

    for (const item of FORCED_UPDATES) {
      await connection.execute(
        'UPDATE articles SET parent_silo = ?, hub_url = ? WHERE id = ?',
        [item.silo, item.hub, item.id]
      );
      console.log('✅ ID ' + item.id + ' actualizado a ' + item.silo);
    }

    // El artículo extra "Clientes Recurrentes"
    await connection.execute(
        "UPDATE articles SET parent_silo = 'marketing-para-pymes', hub_url = '/analisis-estrategico' WHERE title LIKE '%Clientes Recurrentes%'"
    );
    console.log('✅ Artículo extra de Clientes Recurrentes actualizado.');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

forceUpdate();
