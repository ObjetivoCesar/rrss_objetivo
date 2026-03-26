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
    let foundAny = false;
    
    // Categorías antiguas explícitas a buscar
    const oldCategories = ['/blog/automatizacion/', '/blog/marketing/', '/blog/posicionamiento/', '/blog/diseno-web/', '/blog/asesoria/'];
    
    rows.forEach(row => {
        if (!row.content) return;
        
        let localFound = false;
        
        // 1. Buscar menciones explícitas de silos viejos
        oldCategories.forEach(old => {
            if (row.content.includes(old)) {
                console.log(`\n❌ ROTO: [Silo Antiguo] En artículo "${row.title}"`);
                console.log(`   -> Contiene: ${old}`);
                localFound = true;
                foundAny = true;
            }
        });
        
        // 2. Buscar cualquier enlace de tipo markdown [texto](/blog/...)
        const regex = /\]\(\/blog\/[^\)]+\)/g;
        const matches = row.content.match(regex);
        if (matches) {
            matches.forEach(m => {
                const url = m.slice(2, -1); // quita ]( y )
                // Validar contra los 5 silos nuevos oficiales
                const validSilos = [
                    '/blog/marketing-para-pymes/', 
                    '/blog/automatizacion-de-ventas/', 
                    '/blog/posicionamiento-en-google/', 
                    '/blog/activaqr-gastronomia/', 
                    '/blog/activaqr-networking/'
                ];
                let isValid = validSilos.some(v => url.startsWith(v));
                
                if (!isValid) {
                    console.log(`\n❌ ROTO: [Silo No Registrado 2026] En artículo "${row.title}"`);
                    console.log(`   -> Enlace: ${url}`);
                    localFound = true;
                    foundAny = true;
                }
            });
        }
    });

    if (!foundAny) {
      console.log('✅ Escaneo completado. No se encontraron enlaces rotos en el contenido markdown.');
    } else {
      console.log('\n⚠️ Se encontraron enlaces rotos que requieren corrección.');
    }

  } catch (error) {
    console.error('Error Crítico:', error);
  } finally {
    if (connection) await connection.end();
  }
}

findBrokenLinks();
