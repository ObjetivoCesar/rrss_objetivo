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

async function findBrokenLinks() {
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

    const [rows] = await connection.execute('SELECT title, slug, content FROM articles');
    
    // Categorías antiguas que ya no existen o fueron cambiadas
    const oldCategories = ['/blog/automatizacion/', '/blog/marketing/', '/blog/posicionamiento/', '/blog/diseno-web/', '/blog/asesoria/'];
    
    rows.forEach(row => {
        let hasBroken = false;
        oldCategories.forEach(old => {
            if (row.content && row.content.includes(old)) {
                console.log(`⚠️ Artículo: ${row.title}`);
                console.log(`   Contiene enlace sospechoso: ${old}`);
                hasBroken = true;
            }
        });
        
        // También buscar cualquier cosa que empiece con /blog/
        if (row.content) {
            const matches = row.content.match(/\/blog\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+/g);
            if (matches) {
                matches.forEach(m => {
                    // Validar si el silo no es uno de los 5 nuevos
                    const validSilos = ['/blog/marketing-para-pymes/', '/blog/automatizacion-de-ventas/', '/blog/posicionamiento-en-google/', '/blog/activaqr-gastronomia/', '/blog/activaqr-networking/'];
                    let isValid = false;
                    validSilos.forEach(v => {
                        if (m.startsWith(v)) isValid = true;
                    });
                    if (!isValid) {
                        console.log(`❌ ENLACE ROTO ENCONTRADO en "${row.title}": ${m}`);
                    }
                });
            }
        }
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

findBrokenLinks();
