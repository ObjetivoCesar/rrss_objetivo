
const mysql = require('mysql2/promise');
const fs = require('fs');

const mysqlConfig = {
  host: "mysql.us.stackcp.com",
  port: 42903,
  user: "paginaweb-cesarreyes-353039368e3b",
  password: "ZSAfOvstk2ID",
  database: "paginaweb-cesarreyes-353039368e3b",
};

// IDs a CONSERVAR (potencial real según GSC + análisis de Matriz Maestra)
const KEEP_IDS = new Set([
  // Artículos con tráfico o potencial alto de la Matriz
  'nichos-de-mercado-qué-son-y-cómo-reconocerlos',
  'nichos-de-mercado-qu-son-y-cmo-reconocerlos',
  'rendimiento-en-campañas',
  'rendimiento-en-campaas',
  'seo-y-campañas',
  'seo-y-campaas',
  'automatización-de-procesos-en-el-estudio-de-arquitectura',
  'automatizacin-de-procesos-en-el-estudio-de-arquitectura',
  'cómo-vender-algo-en-facebook',
  'cmo-vender-algo-en-facebook',
  'marketing-digital-para-emprendedores',
  'estrategias-de-marketing-digital',
  // Artículos de posicionamiento Google con potencial
  '16c0b310-815c-4c89-b1d8-b593d0414a8e', // Soy carpintero, no quiero un curso de SEO
  '21431a72-44d3-437c-890a-e8a2af38dc0e', // El Factor Secreto del Ranking #1 en Google Local
  'f573acb1-e376-4d3e-8718-2ffff6c5f552', // Por Qué Tu Competencia Aparece Primero en Google
  '8c020c45-df65-4dd6-a4f8-8add5adb628c', // Guía Definitiva de SEO Local
  '16f66868-3469-44f8-900b-a62c67ee536c', // ¿Por Qué Google Muestra Primero a Ciertos Restaurantes?
  '255ea927-189f-4215-94f0-1369e1b3e89a', // Cómo Aparecer en Google Cuando Buscan Restaurante
  'd12c7373-1f27-4e5f-90bc-e10122f34b73', // Cómo aparecer en Google cuando buscan restaurante en tu zona
  '8ab12dad-427f-46e7-9cac-97298cc160dc', // ¿Por qué Nadie Encuentra mi Restaurante en Internet?
  '2ebf37f9-8f11-409a-b954-158f5b1a22ff', // Por Qué Nadie Encuentra Mi Restaurante en Internet
  '3fedb586-210d-4bdb-99b7-33839449524e', // Por qué nadie encuentra tu restaurante
  'e344b48e-b175-4f45-bbb1-feb1771c696f', // Por qué nadie encuentra tu restaurante (chef)
  '7074ae3d-500f-44ef-b3a6-6b3db0c69a8e', // Por qué publicar en redes sociales no es lo mismo
  // Automatización con potencial
  '9440f3d6-ba9e-4abd-9f2e-371d2d965453', // La Razón Por La Que Pierdes Clientes en WhatsApp
  '598da66c-5068-48f0-867d-cebe7372abdb', // Cómo Convertir tu WhatsApp en un Sistema de Ventas
  '58d6b579-4f94-44e9-a94f-35d9f8d7c7f1', // La Tecnología Que Recupera Tu Tiempo
  '13912f6e-44ac-4e95-9ad1-37e1a6f9a8ee', // El Tiempo Que Estás Perdiendo Sin Saberlo
  '0e7a34fe-e5b3-4131-8e97-8d0d0de7f981', // El Gasto Mensual Que Puedes Eliminar Hoy Mismo
  // Marketing Pymes
  'tus-competidores-se-están-llevando-tus-clientes',
  'tus-competidores-se-estn-llevando-tus-clientes',
  'oportunidades-de-negocio',
  '3ddf260b-734d-4a3f-87ef-a2fcabf9130d', // Cómo conseguir más pacientes
  // Menús QR / Desarrollo web (posición César como innovador)
  '0c54775d-aa74-47d2-aee7-7c053576176c', // Código QR en Menús de Restaurante
  '60870d99-d89e-44c8-8913-bb3dd54b93a5', // Código QR en restaurantes qué es
  '9b7a301c-2e86-400c-83e2-ad49a67b2c37', // Cómo Hacer un Menú Digital para Restaurante Rápido
  'c35038df-02db-4932-b934-a758b52cba14', // Menú por WhatsApp ¿Enviar Foto o Enlace?
  'cabde557-a417-4122-94c5-d958c550106b', // Por qué enviar el menú por WhatsApp en PDF
  '3c470c12-6c15-40a5-896f-2560c62b181f', // Menú por WhatsApp: Por Qué Enviar Fotos o PDFs
  '1ded2a59-37c1-4c33-ac1a-803ad86260a8', // Cuánto cuesta un menú digital
  'c8387479-6377-4d8f-841c-cc3fbd1dcea2', // Cuánto Cuesta Tener un Menú Digital
  // Primero artículo MySQL (sin UUID)
  '', // El de sin-ID
]);

async function audit() {
  const connection = await mysql.createConnection(mysqlConfig);
  
  // 1. Ver el schema actual de la tabla articles
  const [cols] = await connection.execute(
    `SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles'`,
    [mysqlConfig.database]
  );
  console.log('=== COLUMNAS ACTUALES ===');
  cols.forEach(c => console.log(`  ${c.COLUMN_NAME}: ${c.DATA_TYPE}`));

  // 2. Verificar si las columnas nuevas ya existen
  const existingCols = cols.map(c => c.COLUMN_NAME);
  
  if (!existingCols.includes('hub_url')) {
    console.log('\nAgregando columna hub_url...');
    await connection.execute(`ALTER TABLE articles ADD COLUMN hub_url VARCHAR(255) NULL AFTER slug`);
    console.log('✅ hub_url agregada');
  } else {
    console.log('\n✅ hub_url ya existe');
  }
  
  if (!existingCols.includes('parent_silo')) {
    console.log('Agregando columna parent_silo...');
    await connection.execute(`ALTER TABLE articles ADD COLUMN parent_silo ENUM('marketing-para-pymes','automatizacion-de-ventas','posicionamiento-en-google') NULL AFTER hub_url`);
    console.log('✅ parent_silo agregada');
  } else {
    console.log('✅ parent_silo ya existe');
  }

  // 3. Obtener todos los IDs actuales
  const [allArticles] = await connection.execute('SELECT id, title, slug FROM articles');
  console.log(`\n=== ARTÍCULOS TOTALES: ${allArticles.length} ===`);
  
  // 4. Identificar qué se elimina
  const toDelete = allArticles.filter(a => !KEEP_IDS.has(a.id));
  const toKeep = allArticles.filter(a => KEEP_IDS.has(a.id));
  
  console.log(`✅ A CONSERVAR: ${toKeep.length}`);
  console.log(`🗑️ A ELIMINAR: ${toDelete.length}`);
  
  // Guardar log antes de eliminar
  const log = {
    timestamp: new Date().toISOString(),
    toKeep: toKeep.map(a => ({ id: a.id, title: a.title })),
    toDelete: toDelete.map(a => ({ id: a.id, title: a.title })),
  };
  fs.writeFileSync('/tmp/audit_delete_log.json', JSON.stringify(log, null, 2));
  console.log('\n📄 Log guardado en /tmp/audit_delete_log.json');
  
  // 5. DRY RUN — mostrar sin ejecutar
  console.log('\n=== DRY RUN: Los siguientes artículos SERÍAN eliminados ===');
  toDelete.slice(0, 10).forEach(a => console.log(`  [${a.id.substring(0,12)}] ${a.title}`));
  if (toDelete.length > 10) console.log(`  ... y ${toDelete.length - 10} más`);
  
  console.log('\n✅ DRY RUN completado. Para ejecutar la eliminación real, cambiar a DELETE_MODE=true');
  
  await connection.end();
}

audit().catch(console.error);
