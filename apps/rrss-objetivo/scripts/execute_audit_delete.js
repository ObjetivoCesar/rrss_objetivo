
const mysql = require('mysql2/promise');

const mysqlConfig = {
  host: "mysql.us.stackcp.com",
  port: 42903,
  user: "paginaweb-cesarreyes-353039368e3b",
  password: "ZSAfOvstk2ID",
  database: "paginaweb-cesarreyes-353039368e3b",
};

// IDs a CONSERVAR (potencial real según GSC + Matriz Maestra)
const KEEP_IDS = new Set([
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
  '16c0b310-815c-4c89-b1d8-b593d0414a8e',
  '21431a72-44d3-437c-890a-e8a2af38dc0e',
  'f573acb1-e376-4d3e-8718-2ffff6c5f552',
  '8c020c45-df65-4dd6-a4f8-8add5adb628c',
  '16f66868-3469-44f8-900b-a62c67ee536c',
  '255ea927-189f-4215-94f0-1369e1b3e89a',
  'd12c7373-1f27-4e5f-90bc-e10122f34b73',
  '8ab12dad-427f-46e7-9cac-97298cc160dc',
  '2ebf37f9-8f11-409a-b954-158f5b1a22ff',
  '3fedb586-210d-4bdb-99b7-33839449524e',
  'e344b48e-b175-4f45-bbb1-feb1771c696f',
  '7074ae3d-500f-44ef-b3a6-6b3db0c69a8e',
  '9440f3d6-ba9e-4abd-9f2e-371d2d965453',
  '598da66c-5068-48f0-867d-cebe7372abdb',
  '58d6b579-4f94-44e9-a94f-35d9f8d7c7f1',
  '13912f6e-44ac-4e95-9ad1-37e1a6f9a8ee',
  '0e7a34fe-e5b3-4131-8e97-8d0d0de7f981',
  'tus-competidores-se-están-llevando-tus-clientes',
  'tus-competidores-se-estn-llevando-tus-clientes',
  'oportunidades-de-negocio',
  '3ddf260b-734d-4a3f-87ef-a2fcabf9130d',
  '0c54775d-aa74-47d2-aee7-7c053576176c',
  '60870d99-d89e-44c8-8913-bb3dd54b93a5',
  '9b7a301c-2e86-400c-83e2-ad49a67b2c37',
  'c35038df-02db-4932-b934-a758b52cba14',
  'cabde557-a417-4122-94c5-d958c550106b',
  '3c470c12-6c15-40a5-896f-2560c62b181f',
  '1ded2a59-37c1-4c33-ac1a-803ad86260a8',
  'c8387479-6377-4d8f-841c-cc3fbd1dcea2',
  '',
]);

// Mapa de interlinking (id -> {silo, hub_url})
const ARTICLE_MAPPING = {
  // Silo: posicionamiento-en-google → Hub: auditoría SEO
  '16c0b310-815c-4c89-b1d8-b593d0414a8e': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  '21431a72-44d3-437c-890a-e8a2af38dc0e': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  'f573acb1-e376-4d3e-8718-2ffff6c5f552': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  '8c020c45-df65-4dd6-a4f8-8add5adb628c': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  '16f66868-3469-44f8-900b-a62c67ee536c': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  '255ea927-189f-4215-94f0-1369e1b3e89a': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  'd12c7373-1f27-4e5f-90bc-e10122f34b73': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  '8ab12dad-427f-46e7-9cac-97298cc160dc': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  '2ebf37f9-8f11-409a-b954-158f5b1a22ff': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  '3fedb586-210d-4bdb-99b7-33839449524e': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  'e344b48e-b175-4f45-bbb1-feb1771c696f': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  'seo-y-campañas': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  'seo-y-campaas': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  'rendimiento-en-campañas': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },
  'rendimiento-en-campaas': { silo: 'posicionamiento-en-google', hub: '/posicionamiento/auditoria-seo-rediseno' },

  // Silo: automatizacion-de-ventas → Hub: tu-negocio-24-7
  '9440f3d6-ba9e-4abd-9f2e-371d2d965453': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tu-negocio-24-7' },
  '598da66c-5068-48f0-867d-cebe7372abdb': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tu-contacto-profesional' },
  '58d6b579-4f94-44e9-a94f-35d9f8d7c7f1': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tu-negocio-24-7' },
  '13912f6e-44ac-4e95-9ad1-37e1a6f9a8ee': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tu-negocio-24-7' },
  '0e7a34fe-e5b3-4131-8e97-8d0d0de7f981': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tu-negocio-24-7' },
  'automatización-de-procesos-en-el-estudio-de-arquitectura': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tu-empresa-online' },
  'automatizacin-de-procesos-en-el-estudio-de-arquitectura': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tu-empresa-online' },
  // Menús → /desarrollo-web/tarjeta-digital (César como innovador)
  '0c54775d-aa74-47d2-aee7-7c053576176c': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tarjeta-digital' },
  '60870d99-d89e-44c8-8913-bb3dd54b93a5': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tarjeta-digital' },
  '9b7a301c-2e86-400c-83e2-ad49a67b2c37': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tarjeta-digital' },
  'c35038df-02db-4932-b934-a758b52cba14': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tu-contacto-profesional' },
  'cabde557-a417-4122-94c5-d958c550106b': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tu-contacto-profesional' },
  '3c470c12-6c15-40a5-896f-2560c62b181f': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tu-contacto-profesional' },
  '1ded2a59-37c1-4c33-ac1a-803ad86260a8': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tarjeta-digital' },
  'c8387479-6377-4d8f-841c-cc3fbd1dcea2': { silo: 'automatizacion-de-ventas', hub: '/desarrollo-web/tarjeta-digital' },

  // Silo: marketing-para-pymes → Hub: estrategia, análisis
  'tus-competidores-se-están-llevando-tus-clientes': { silo: 'marketing-para-pymes', hub: '/analisis-estrategico/estrategia-ganar-clientes' },
  'tus-competidores-se-estn-llevando-tus-clientes': { silo: 'marketing-para-pymes', hub: '/analisis-estrategico/estrategia-ganar-clientes' },
  '3ddf260b-734d-4a3f-87ef-a2fcabf9130d': { silo: 'marketing-para-pymes', hub: '/analisis-estrategico/estrategia-ganar-clientes' },
  'oportunidades-de-negocio': { silo: 'marketing-para-pymes', hub: '/analisis-estrategico' },
  'marketing-digital-para-emprendedores': { silo: 'marketing-para-pymes', hub: '/analisis-estrategico/estrategia-ganar-clientes' },
  'estrategias-de-marketing-digital': { silo: 'marketing-para-pymes', hub: '/analisis-estrategico/estrategia-ganar-clientes' },
  'cómo-vender-algo-en-facebook': { silo: 'marketing-para-pymes', hub: '/analisis-estrategico/estrategia-ganar-clientes' },
  'cmo-vender-algo-en-facebook': { silo: 'marketing-para-pymes', hub: '/analisis-estrategico/estrategia-ganar-clientes' },
  '7074ae3d-500f-44ef-b3a6-6b3db0c69a8e': { silo: 'marketing-para-pymes', hub: '/posicionamiento' },
  'nichos-de-mercado-qué-son-y-cómo-reconocerlos': { silo: 'marketing-para-pymes', hub: '/analisis-estrategico/estudio-factibilidad' },
  'nichos-de-mercado-qu-son-y-cmo-reconocerlos': { silo: 'marketing-para-pymes', hub: '/analisis-estrategico/estudio-factibilidad' },
};

async function executeAudit() {
  const connection = await mysql.createConnection(mysqlConfig);
  
  const [allArticles] = await connection.execute('SELECT id, title FROM articles');
  const toDelete = allArticles.filter(a => !KEEP_IDS.has(a.id));
  
  console.log(`Eliminando ${toDelete.length} artículos legacy...`);
  let deleted = 0;
  for (const article of toDelete) {
    await connection.execute('DELETE FROM articles WHERE id = ?', [article.id]);
    deleted++;
  }
  console.log(`✅ ${deleted} artículos eliminados`);

  // Asignar hub_url y parent_silo a los artículos conservados
  console.log('\nAsignando categorías estratégicas...');
  let assigned = 0;
  for (const [id, mapping] of Object.entries(ARTICLE_MAPPING)) {
    const [result] = await connection.execute(
      'UPDATE articles SET hub_url = ?, parent_silo = ? WHERE id = ?',
      [mapping.hub, mapping.silo, id]
    );
    if (result.affectedRows > 0) assigned++;
  }
  console.log(`✅ ${assigned} artículos con hub_url y parent_silo asignados`);

  // Verificación final
  const [remaining] = await connection.execute('SELECT COUNT(*) as total FROM articles');
  const [withHub] = await connection.execute('SELECT COUNT(*) as total FROM articles WHERE hub_url IS NOT NULL');
  console.log(`\n=== ESTADO FINAL ===`);
  console.log(`Total artículos: ${remaining[0].total}`);
  console.log(`Con hub_url: ${withHub[0].total}`);
  console.log(`Sin hub_url (necesitan revisión): ${remaining[0].total - withHub[0].total}`);
  
  await connection.end();
}

executeAudit().catch(console.error);
