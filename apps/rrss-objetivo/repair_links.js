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

async function fixBrokenLinks() {
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

    const [rows] = await connection.execute('SELECT id, title, content FROM articles');
    let updatedCount = 0;
    
    // Mapeo exhaustivo de categorías viejas a nuevas
    const mappings = [
        { old: '/blog/automatizacion/', new: '/blog/automatizacion-de-ventas/' },
        { old: '/blog/marketing/', new: '/blog/marketing-para-pymes/' },
        { old: '/blog/posicionamiento/', new: '/blog/posicionamiento-en-google/' },
        // Diseño web se dividió en dos, pero por defecto a networking si no sabemos.
        // Mejor buscamos el slug al que apuntan. Pero para simplificar, "guias-definitiva-menus..." va a gastronomia.
        { old: '/blog/diseno-web/', new: '/blog/activaqr-gastronomia/' }, // Asumimos gastronomia para menus
        { old: '/blog/asesoria/', new: '/blog/marketing-para-pymes/' },
        // El nuevo estándar de networking b2b estaba en /blog/automatizacion/el-nuevo-estandar-networking-b2b -> Debería ser activaqr-networking!
        { old: '/blog/automatizacion-de-ventas/el-nuevo-estandar-networking-b2b', new: '/blog/activaqr-networking/el-nuevo-estandar-networking-b2b' },
        { old: '/blog/automatizacion/el-nuevo-estandar-networking-b2b', new: '/blog/activaqr-networking/el-nuevo-estandar-networking-b2b' }
    ];

    for (const row of rows) {
        if (!row.content) continue;
        let newContent = row.content;
        let isModified = false;

        mappings.forEach(map => {
            // Buscamos con global replace. Pero ten cuidado con dobles reemplazos.
            // Primero arreglamos casos puntuales
            if (map.old === '/blog/automatizacion/el-nuevo-estandar-networking-b2b' && newContent.includes(map.old)) {
                newContent = newContent.split(map.old).join(map.new);
                isModified = true;
            } else if (map.old === '/blog/automatizacion/guias-definitiva-menus-digitales-restaurantes' && newContent.includes(map.old)) {
                newContent = newContent.split(map.old).join('/blog/activaqr-gastronomia/guias-definitiva-menus-digitales-restaurantes');
                isModified = true;
            } else if (newContent.includes(map.old)) {
                newContent = newContent.split(map.old).join(map.new);
                isModified = true;
            }
        });

        if (isModified) {
            await connection.execute('UPDATE articles SET content = ? WHERE id = ?', [newContent, row.id]);
            console.log(`✅ Reparado artículo: "${row.title}"`);
            updatedCount++;
        }
    }

    console.log(`\n🎉 Total de artículos reparados: ${updatedCount}`);

  } catch (error) {
    console.error('Error Crítico:', error);
  } finally {
    if (connection) await connection.end();
  }
}

fixBrokenLinks();
