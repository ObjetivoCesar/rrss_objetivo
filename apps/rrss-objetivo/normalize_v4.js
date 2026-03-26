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

const MAPPING = [
  { title: 'IA en Ecuador', silo: 'automatizacion-de-ventas', img: 'ia-ecuador-casos-reales.webp', hub: '/analisis-estrategico' },
  { title: 'Mi hijo maneja las redes', silo: 'marketing-para-pymes', img: 'error-marketing-familiar-pymes.webp', hub: '/desarrollo-web/tu-negocio-24-7' },
  { title: 'Google Maps', silo: 'posicionamiento-en-google', img: 'guia-definitiva-seo-local.webp', hub: '/posicionamiento/auditoria-seo-rediseno' },
  { title: 'WhatsApp y CRM', silo: 'automatizacion-de-ventas', img: 'guia-whatsapp-crm-ia.webp', hub: '/desarrollo-web/tu-negocio-24-7' },
  { title: 'E-commerce y Catálogos', silo: 'automatizacion-de-ventas', img: 'ecommerce-catalogos-digitales-ventas.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'tarjetas de papel te hace ver obsoleto', silo: 'activaqr-networking', img: 'networking-digital-activaqr.webp', hub: '/desarrollo-web/tarjeta-digital' },
  { title: 'Síndrome de la Madrugada', silo: 'automatizacion-de-ventas', img: 'sindrome-madrugada-ventas.webp', hub: '/desarrollo-web/tu-negocio-24-7' },
  { title: 'Excel para gestionar su inventario', silo: 'automatizacion-de-ventas', img: 'chau-excel-gestion-empresarial.webp', hub: '/desarrollo-web/tu-empresa-online' },
  { title: 'Arquitectura de Conversión', silo: 'marketing-para-pymes', img: 'arquitectura-conversion-eficiencia.webp', hub: '/desarrollo-web/plataformas-y-embudos-operativos' },
  { title: 'Nuevos Mercados 2026', silo: 'marketing-para-pymes', img: 'nuevos-mercados-ecuador-2026.webp', hub: '/analisis-estrategico/estudio-factibilidad' },
  { title: 'Futuro de la PYME Automatización', silo: 'automatizacion-de-ventas', img: 'automatizacion-pyme-asequible.webp', hub: '/desarrollo-web/tu-empresa-online' },
  { title: 'Señales de Confianza', silo: 'posicionamiento-en-google', img: 'seales-confianza-seo-local.webp', hub: '/posicionamiento/seo-local-quito-ecuador' },
  { title: 'SEO B2B y Autoridad Digital', silo: 'posicionamiento-en-google', img: 'seo-b2b-autoridad-digital-ia.webp', hub: '/posicionamiento' },
  { title: 'Ciberseguridad PYME', silo: 'marketing-para-pymes', img: 'portada_ciberseguridad_2026.webp', hub: '/analisis-estrategico' },
  { title: 'Networking para CEOs', silo: 'activaqr-networking', img: 'networking-para-ceos.webp', hub: '/desarrollo-web/tu-contacto-profesional' },
  { title: 'Email Marketing 2026', silo: 'automatizacion-de-ventas', img: 'portada_email_2026.webp', hub: '/analisis-estrategico/estrategia-ganar-clientes' },
  { title: 'Menús Digitales y Pedidos Automáticos', silo: 'activaqr-gastronomia', img: 'guias-definitiva-menus-digitales-restaurantes.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'Costo Oculto de Imprimir Menús', silo: 'activaqr-gastronomia', img: 'costo-oculto-imprimir-menus.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'Ticket Promedio un 20%', silo: 'activaqr-gastronomia', img: 'aumentar-ticket-promedio-menu-fotografico.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'Elimina la Fila Pedidos', silo: 'activaqr-gastronomia', img: 'elimina-fila-pedidos-mesa.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'Nuevo Estándar del Networking B2B', silo: 'activaqr-networking', img: 'el-nuevo-estandar-networking-b2b.webp', hub: '/desarrollo-web/tarjeta-digital' },
  { title: 'Tarjetas de Papel Terminan en la Basura', silo: 'activaqr-networking', img: 'tarjetas-papel-basura-estadistica.webp', hub: '/desarrollo-web/tu-contacto-profesional' },
  { title: 'Capturar el Dato de tu Prospecto', silo: 'activaqr-networking', img: 'capturar-dato-evento-b2b-3-segundos.webp', hub: '/desarrollo-web/tarjeta-digital' },
  { title: 'Tarjeta de Presentación al Cierre', silo: 'activaqr-networking', img: 'networking-cierre-ventas-crm.webp', hub: '/desarrollo-web/tarjeta-digital' }
];

async function run() {
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

    console.log('--- Iniciando Normalización MySQL (ID matching) ---');
    const [rows] = await connection.execute('SELECT id, title FROM articles');
    
    for (const item of MAPPING) {
      const match = rows.find(r => r.title.toLowerCase().includes(item.title.toLowerCase()));
      if (match) {
        const fullImageUrl = 'https://cesarweb.b-cdn.net/' + item.img;
        const [result] = await connection.execute(
          'UPDATE articles SET parent_silo = ?, hub_url = ?, cover_image = ? WHERE id = ?',
          [item.silo, item.hub, fullImageUrl, match.id]
        );
        console.log(`✅ ID ${match.id} actualizado: ${item.title} -> ${item.silo} (${result.affectedRows} rows affected)`);
      } else {
        console.log(`⚠️ No se encontró en DB: ${item.title}`);
      }
    }

    // Caso especial "Clientes Recurrentes"
    await connection.execute(
        "UPDATE articles SET parent_silo = 'marketing-para-pymes', hub_url = '/analisis-estrategico' WHERE title LIKE '%Clientes Recurrentes%'"
    );

    console.log('--- Auditoría Post-Update ---');
    const [finalRows] = await connection.execute('SELECT id, title, parent_silo FROM articles');
    console.log(JSON.stringify(finalRows, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

run();
