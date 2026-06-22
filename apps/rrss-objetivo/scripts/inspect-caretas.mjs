import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'mysql.us.stackcp.com',
  port: 42903,
  user: 'paginaweb-cesarreyes-353039368e3b',
  password: 'ZSAfOvstk2ID',
  database: 'paginaweb-cesarreyes-353039368e3b',
});

const [tables] = await conn.query('SHOW TABLES');
const tableNames = tables.map(t => Object.values(t)[0]);
const quoteTable = tableNames.find(t => t.toLowerCase().includes('quot') || t.toLowerCase().includes('cotiz') || t.toLowerCase().includes('propues'));

if (quoteTable) {
  const [rows] = await conn.query(`SELECT id, data FROM \`${quoteTable}\` LIMIT 10`);
  rows.forEach(r => {
    console.log('--- ID:', r.id);
    const d = JSON.parse(r.data);
    console.log('KEYS:', Object.keys(d));
    if (d.etapas && d.etapas.length > 0) {
      console.log('ETAPA 0 KEYS:', Object.keys(d.etapas[0]));
    }
  });
} else {
  console.log('No table found');
}

await conn.end();
