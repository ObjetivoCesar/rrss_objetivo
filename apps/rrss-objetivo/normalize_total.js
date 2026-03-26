const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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

function normalizeTitle(title) {
    return title.toLowerCase()
        .replace(/[¿?¡!:]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

const MAPPING = [
  { title: 'Cómo usar la Inteligencia Artificial', silo: 'automatizacion-de-ventas', img: 'ia-ecuador-casos-reales.webp', hub: '/analisis-estrategico' },
  { title: 'Mi hijo maneja las redes', silo: 'marketing-para-pymes', img: 'error-marketing-familiar-pymes.webp', hub: '/desarrollo-web/tu-negocio-24-7' },
  { title: 'Por qué no apareces en Google Maps', silo: 'posicionamiento-en-google', img: 'guia-definitiva-seo-local.webp', hub: '/posicionamiento/auditoria-seo-rediseno' },
  { title: 'Guía Definitiva de WhatsApp y CRM', silo: 'automatizacion-de-ventas', img: 'guia-whatsapp-crm-ia.webp', hub: '/desarrollo-web/tu-negocio-24-7' },
  { title: 'E-commerce y Catálogos Digitales', silo: 'automatizacion-de-ventas', img: 'ecommerce-catalogos-digitales-ventas.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'Networking en 2026', silo: 'activaqr-networking', img: 'networking-digital-activaqr.webp', hub: '/desarrollo-web/tarjeta-digital' },
  { title: 'El Síndrome de la Madrugada', silo: 'automatizacion-de-ventas', img: 'sindrome-madrugada-ventas.webp', hub: '/desarrollo-web/tu-negocio-24-7' },
  { title: 'Por qué las empresas que usan Excel', silo: 'automatizacion-de-ventas', img: 'chau-excel-gestion-empresarial.webp', hub: '/desarrollo-web/tu-empresa-online' },
  { title: 'Arquitectura de Conversión', silo: 'marketing-para-pymes', img: 'arquitectura-conversion-eficiencia.webp', hub: '/desarrollo-web/plataformas-y-embudos-operativos' },
  { title: 'Nuevos Mercados 2026', silo: 'marketing-para-pymes', img: 'nuevos-mercados-ecuador-2026.webp', hub: '/analisis-estrategico/estudio-factibilidad' },
  { title: 'El Futuro de la PYME', silo: 'automatizacion-de-ventas', img: 'automatizacion-pyme-asequible.webp', hub: '/desarrollo-web/tu-empresa-online' },
  { title: 'Señales de Confianza', silo: 'posicionamiento-en-google', img: 'seales-confianza-seo-local.webp', hub: '/posicionamiento/seo-local-quito-ecuador' },
  { title: 'SEO B2B y Autoridad Digital', silo: 'posicionamiento-en-google', img: 'seo-b2b-autoridad-digital-ia.webp', hub: '/posicionamiento' },
  { title: 'Ciberseguridad PYME', silo: 'marketing-para-pymes', img: 'portada_ciberseguridad_2026.webp', hub: '/analisis-estrategico' },
  { title: 'Networking para CEOs', silo: 'activaqr-networking', img: 'networking-para-ceos.webp', hub: '/desarrollo-web/tu-contacto-profesional' },
  { title: 'Email Marketing 2026', silo: 'automatizacion-de-ventas', img: 'portada_email_2026.webp', hub: '/analisis-estrategico/estrategia-ganar-clientes' },
  { title: 'Guía Definitiva de Menús Digitales', silo: 'activaqr-gastronomia', img: 'guias-definitiva-menus-digitales-restaurantes.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'El Costo Oculto de Imprimir Menús', silo: 'activaqr-gastronomia', img: 'costo-oculto-imprimir-menus.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'Cómo Aumentar el Ticket Promedio', silo: 'activaqr-gastronomia', img: 'aumentar-ticket-promedio-menu-fotografico.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'Elimina la Fila', silo: 'activaqr-gastronomia', img: 'elimina-fila-pedidos-mesa.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'El Nuevo Estándar del Networking B2B', silo: 'activaqr-networking', img: 'el-nuevo-estandar-networking-b2b.webp', hub: '/desarrollo-web/tarjeta-digital' },
  { title: 'El 88% de las Tarjetas de Papel', silo: 'activaqr-networking', img: 'tarjetas-papel-basura-estadistica.webp', hub: '/desarrollo-web/tu-contacto-profesional' },
  { title: 'Cómo Capturar el Dato de tu Prospecto', silo: 'activaqr-networking', img: 'capturar-dato-evento-b2b-3-segundos.webp', hub: '/desarrollo-web/tarjeta-digital' },
  { title: 'De la Tarjeta de Presentación al Cierre', silo: 'activaqr-networking', img: 'networking-cierre-ventas-crm.webp', hub: '/desarrollo-web/tarjeta-digital' }
];

async function normalize() {
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

    console.log('--- Obteniendo artículos de la DB ---');
    const [rows] = await connection.execute('SELECT id, title FROM articles');
    
    console.log('--- Iniciando Normalización MySQL ---');
    for (const item of MAPPING) {
      const normMapTitle = normalizeTitle(item.title);
      const dbArticle = rows.find(r => normalizeTitle(r.title).includes(normMapTitle));
      
      if (dbArticle) {
        const fullImageUrl = 'https://cesarweb.b-cdn.net/' + item.img;
        const [result] = await connection.execute(
          'UPDATE articles SET parent_silo = ?, cover_image = ?, hub_url = ? WHERE id = ?',
          [item.silo, fullImageUrl, item.hub, dbArticle.id]
        );
        console.log('✅ Actualizado ID ' + dbArticle.id + ': ' + item.title + ' -> ' + item.silo);
      } else {
        console.log('⚠️ No se encontró en DB: ' + item.title);
      }
    }

    console.log('\n--- Sincronizando CSV Maestro ---');
    const csvPath = path.join(process.cwd(), '..', 'BLOG_ESTRATEGICO_2026.csv');
    if (fs.existsSync(csvPath)) {
        let csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n');
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            // Manejo básico de CSV (solo por comas)
            const columns = lines[i].split(',');
            if (columns.length < 3) continue;
            
            const title = columns[2];
            const match = MAPPING.find(m => normalizeTitle(title).includes(normalizeTitle(m.title)));
            if (match) {
                columns[1] = match.silo; 
                columns[10] = 'https://cesarweb.b-cdn.net/' + match.img;
                lines[i] = columns.join(',');
            }
        }
        fs.writeFileSync(csvPath, lines.join('\n'));
        console.log('✅ CSV Actualizado.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

normalize();
