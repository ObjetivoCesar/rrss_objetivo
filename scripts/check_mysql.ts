import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar env de la app
dotenv.config({ path: path.join(__dirname, '../apps/rrss-objetivo/.env.local') });
dotenv.config({ path: path.join(__dirname, '../apps/rrss-objetivo/.env') });

import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const [rows] = await pool.query('SELECT id, slug FROM articles');
    console.log('Resultados:', JSON.stringify(rows, null, 2));

    process.exit(0);
  } catch (e: any) {
    console.error('❌ Error de Base de Datos:', e.message);
    if (e.code) console.error('Código:', e.code);
    process.exit(1);
  }
}

main().catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
});
