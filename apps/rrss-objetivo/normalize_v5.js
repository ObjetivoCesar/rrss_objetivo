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
  { title: 'Cómo usar la Inteligencia Artificial en mi negocio en Ecuador (Caso Real)', silo: 'marketing-para-pymes', img: 'ia-ecuador-casos-reales.webp', hub: '/analisis-estrategico' },
  { title: 'Mi hijo maneja las redes El error estratégico que está quebrando a las PYMEs', silo: 'marketing-para-pymes', img: 'error-marketing-familiar-pymes.webp', hub: '/desarrollo-web/tu-negocio-24-7' },
  { title: 'Guía Definitiva de WhatsApp y CRM con IA en Ecuador (2026)', silo: 'automatizacion-de-ventas', img: 'guia-whatsapp-crm-ia.webp', hub: '/desarrollo-web/tu-negocio-24-7' },
  { title: 'E-commerce y Catálogos Digitales Cómo Vender sin Fricción en 2026', silo: 'automatizacion-de-ventas', img: 'ecommerce-catalogos-digitales-ventas.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'Networking en 2026 Por qué entregar tarjetas de papel te hace ver obsoleto', silo: 'activaqr-networking', img: 'networking-digital-activaqr.webp', hub: '/desarrollo-web/tarjeta-digital' },
  { title: 'El Síndrome de la Madrugada Cuánto dinero pierdes mientras tu negocio duerme', silo: 'automatizacion-de-ventas', img: 'sindrome-madrugada-ventas.webp', hub: '/desarrollo-web/tu-negocio-24-7' },
  { title: 'Por qué las empresas que usan Excel para gestionar su inventario siempre llegan tarde', silo: 'automatizacion-de-ventas', img: 'chau-excel-gestion-empresarial.webp', hub: '/desarrollo-web/tu-empresa-online' },
  { title: 'Arquitectura de Conversión y Eficiencia Operativa para PYMES', silo: 'marketing-para-pymes', img: 'arquitectura-conversion-eficiencia.webp', hub: '/desarrollo-web/plataformas-y-embudos-operativos' },
  { title: 'Nuevos Mercados 2026 Dónde está el dinero en el Ecuador Digital', silo: 'marketing-para-pymes', img: 'nuevos-mercados-ecuador-2026.webp', hub: '/analisis-estrategico/estudio-factibilidad' },
  { title: 'El Futuro de la PYME Automatización Asequible en 2026', silo: 'automatizacion-de-ventas', img: 'automatizacion-pyme-asequible.webp', hub: '/desarrollo-web/tu-empresa-online' },
  { title: 'Señales de Confianza El secreto de Google para negocios locales', silo: 'posicionamiento-en-google', img: 'seales-confianza-seo-local.webp', hub: '/posicionamiento/seo-local-quito-ecuador' },
  { title: 'SEO B2B y Autoridad Digital Dominando Google y la IA en Ecuador', silo: 'posicionamiento-en-google', img: 'seo-b2b-autoridad-digital-ia.webp', hub: '/posicionamiento' },
  { title: 'Ciberseguridad PYME Protegiendo los datos de tus clientes en Ecuador', silo: 'marketing-para-pymes', img: 'portada_ciberseguridad_2026.webp', hub: '/analisis-estrategico' },
  { title: 'Networking para CEOs Tu perfil digital es tu nueva oficina', silo: 'activaqr-networking', img: 'networking-para-ceos.webp', hub: '/desarrollo-web/tu-contacto-profesional' },
  { title: 'Email Marketing 2026 Por qué no ha muerto y cómo usarlo en Ecuador', silo: 'automatizacion-de-ventas', img: 'portada_email_2026.webp', hub: '/analisis-estrategico/estrategia-ganar-clientes' },
  { title: 'Guía Definitiva de Menús Digitales y Pedidos Automáticos para Restaurantes (2026)', silo: 'activaqr-gastronomia', img: 'guias-definitiva-menus-digitales-restaurantes.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'El Costo Oculto de Imprimir Menús Físicos Cada Mes', silo: 'activaqr-gastronomia', img: 'costo-oculto-imprimir-menus.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'Cómo Aumentar el Ticket Promedio un 20% Usando Fotografías en tu Menú QR', silo: 'activaqr-gastronomia', img: 'aumentar-ticket-promedio-menu-fotografico.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'Elimina la Fila Pedidos desde la Mesa Directo a la Cocina', silo: 'activaqr-gastronomia', img: 'elimina-fila-pedidos-mesa.webp', hub: '/desarrollo-web/tu-sucursal-online' },
  { title: 'El Nuevo Estándar del Networking B2B Tarjetas Inteligentes y CRM (2026)', silo: 'activaqr-networking', img: 'el-nuevo-estandar-networking-b2b.webp', hub: '/desarrollo-web/tarjeta-digital' },
  { title: 'El 88% de las Tarjetas de Papel Terminan en la Basura', silo: 'activaqr-networking', img: 'tarjetas-papel-basura-estadistica.webp', hub: '/desarrollo-web/tu-contacto-profesional' },
  { title: 'Cómo Capturar el Dato de tu Prospecto en 3 Segundos Durante un Evento', silo: 'activaqr-networking', img: 'capturar-dato-evento-b2b-3-segundos.webp', hub: '/desarrollo-web/tarjeta-digital' },
  { title: 'De la Tarjeta de Presentación al Cierre de Ventas Integración CRM', silo: 'activaqr-networking', img: 'networking-cierre-ventas-crm.webp', hub: '/desarrollo-web/tarjeta-digital' }
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

    console.log('--- Iniciando Normalización MySQL ---');
    for (const item of MAPPING) {
      const fullImageUrl = 'https://cesarweb.b-cdn.net/' + item.img;
      const [result] = await connection.execute(
        'UPDATE articles SET parent_silo = ?, hub_url = ?, cover_image = ? WHERE title = ?',
        [item.silo, item.hub, fullImageUrl, item.title]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ Actualizado: ${item.title}`);
      } else {
        console.log(`⚠️ No se encontró exacto: ${item.title}`);
      }
    }

    // Caso especial "Clientes Recurrentes"
    await connection.execute(
        "UPDATE articles SET parent_silo = 'marketing-para-pymes', hub_url = '/analisis-estrategico' WHERE title LIKE '%Clientes Recurrentes%'"
    );
    console.log('✅ Clientes Recurrentes actualizado.');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

run();
