const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.join('=').trim();
  }
});

async function describeArticles() {
  try {
    const connection = await mysql.createConnection({
      host: env.MYSQL_HOST,
      port: parseInt(env.MYSQL_PORT || '3306'),
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      connectTimeout: 5000,
    });

    const [rows] = await connection.query('DESCRIBE articles');
    console.log("=== ESTRUCTURA DE LA TABLA articles ===");
    console.log(rows);
    
    const [sample] = await connection.query('SELECT * FROM articles LIMIT 3');
    console.log("=== MUESTRA DE DATOS ===");
    console.log(sample);
    
    await connection.end();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

describeArticles();
