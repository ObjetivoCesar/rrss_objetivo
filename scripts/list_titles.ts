import pool from '../apps/rrss-objetivo/src/lib/mysql';

async function main() {
  const [rows] = await pool.query("SELECT title, slug FROM articles");
  console.log(JSON.stringify(rows, null, 2));
  await pool.end();
  process.exit(0);
}

main().catch(console.error);
