/**
 * publish-5-cotizaciones-imagenes.mjs
 * Republica las 5 cotizaciones al webhook del sitio web
 * con las imágenes de portada correctas (imagen_url + url_fondo).
 */

const WEBHOOK_URL = 'https://cesarreyesjaramillo.com/api/webhooks/cotizaciones';
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer CesarQuotes2026',
};

async function publish(body) {
  console.log(`\n🚀 Publicando: ${body.id}`);
  try {
    const resp = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
    });
    if (resp.ok) {
      const data = await resp.text();
      console.log(`  ✅ Éxito: ${data.substring(0, 120)}`);
    } else {
      const text = await resp.text();
      console.error(`  ❌ Error ${resp.status}: ${text.substring(0, 200)}`);
    }
  } catch (err) {
    console.error(`  ❌ Error de red: ${err.message}`);
  }
}

// ── 1. DORIS SEGARRA — CARICIAS (tienda ropa interior)
const imgCaricias = 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=2067&auto=format&fit=crop';
const caricias = {
  id: 'doris-segarra-caricias-2026',
  portada: {
    etiqueta: 'Propuesta de Tienda Online y Automatización',
    titulo_principal: 'Caricias merece estar donde sus clientas están.',
    titulo_destacado: 'Las 24 horas del día, los 7 días.',
    subtitulo: 'Preparado para Doris Segarra | Junio 2026',
    preparado_para: 'Doris Segarra',
    preparado_por: 'César Reyes Jaramillo',
    fecha: 'Junio 2026',
    imagen_url: imgCaricias,
    url_fondo: imgCaricias,
    url_logo_cliente: '',
  },
  introduccion: {
    titulo: 'Su tienda de ropa interior merece un sistema que venda solo.',
    parrafos: [
      "Doris, cuenta con una tienda de ropa interior llamada 'Caricias' y busca tener un espacio digital donde sus clientas puedan ver el catálogo completo, comprar sin dificultad y que además le permita posicionarse mejor que la competencia. Esta propuesta está diseñada en etapas progresivas. Usted decide hasta dónde llegar, cuándo avanzar y quién ejecuta cada fase.",
      'Mi rol es asegurar que cada paso sea técnicamente correcto, estratégicamente coherente y medible en resultados reales.',
    ],
  },
  etapas: [
    {
      numero: '1',
      etiqueta_tiempo: 'Etapa Uno · 2-3 semanas',
      nombre: 'Ecommerce Completo para Caricias',
      eslogan: '"Su tienda en el teléfono de cada clienta, las 24 horas."',
      precio: '$1,000',
      precio_subtitulo: 'hasta 40 páginas',
      descripcion: 'Tu tienda de ropa interior merece estar donde tus clientas están: en su teléfono, las 24 horas. Catálogo completo con hasta 40 páginas, pasarela de pagos y gestión de inventario.',
      entregables: ['Sitio web de hasta 40 páginas', 'Catálogo Digital Completo por categorías, talles y colores', 'Pasarela de Pagos Integrada (transferencias, depósitos, tarjeta)', 'Gestión de Inventario en tiempo real', 'Diseño profesional que transmite calidad', 'Blindaje Legal LOPDP incluido', 'Pasarela de pagos Payphone incluida'],
      nota_especial: 'Incluye configuración completa, puesta en marcha y capacitación.',
      detalles_pie: ['⏱ 2-3 semanas', '📋 Facturación: RUC 1103421531001'],
    },
    {
      numero: '2',
      etiqueta_tiempo: 'Etapa Dos · Gestión continua',
      nombre: 'Manejo de Página Web y Posicionamiento',
      eslogan: '"Su negocio siempre visible, siempre actualizado."',
      precio: 'Desde $250',
      precio_subtitulo: 'al mes',
      descripcion: 'Manejo profesional de su página web y posicionamiento en redes sociales. No incluye reels ni publicaciones tradicionales. El servicio cubre la gestión técnica y la optimización continua de su presencia digital.',
      entregables: ['Manejo de página web', 'Posicionamiento desde redes', 'Optimización continua', 'Reportes de rendimiento'],
      nota_especial: 'No incluye reels ni publicaciones tradicionales.',
      detalles_pie: ['📈 Posicionamiento continuo', '📋 Facturación: RUC 1103421531001'],
    },
    {
      numero: '3',
      etiqueta_tiempo: 'Etapa Tres · Automatización',
      nombre: 'Automatización de WhatsApp Business',
      eslogan: '"Su WhatsApp trabajando 24/7, vendiendo mientras usted duerme."',
      precio: '$500',
      precio_subtitulo: 'pago único',
      descripcion: 'Su WhatsApp como herramienta de ventas y atención, trabajando 24/7. La automatización responde consultas, envía catálogos y segmenta clientas automáticamente. El costo de la API de WhatsApp es cubierto directamente por el cliente.',
      entregables: ['Respuestas Automáticas Inteligentes', 'Catálogo por WhatsApp', 'Segmentación de Clientas', 'Base de datos de clientes frecuentes', 'Capacitación completa'],
      nota_especial: 'El costo mensual de la API de WhatsApp es cubierto directamente por el cliente.',
      detalles_pie: ['🤖 Automatización completa', '📊 Sin costo mensual del servicio'],
    },
  ],
  cierre: {
    titulo: 'El siguiente paso',
    texto: 'Le propongo una breve sesión de 30 minutos para revisar juntos esta propuesta, resolver cualquier duda y definir por dónde empezamos.',
    frase_final: 'Usted no necesita solo una página web. Necesita un <span>sistema que venda solo.</span>',
  },
};

// ── 2. OMAR — PALACIO DEL BRAZIER (restaurante parrilla)
const imgBrazier = 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop';
const palacioDelBrazier = {
  id: 'omar-palacio-brazier-2026',
  portada: {
    etiqueta: 'Propuesta de Catálogo Digital y Ecommerce',
    titulo_principal: 'Palacio del Brazier merece una presencia digital.',
    titulo_destacado: 'Que el dueño decida hasta dónde llegar.',
    subtitulo: 'Preparado para el Sr. Omar (Administrador) | Junio 2026',
    preparado_para: 'Sr. Omar (Administrador)',
    preparado_por: 'César Reyes Jaramillo',
    fecha: 'Junio 2026',
    imagen_url: imgBrazier,
    url_fondo: imgBrazier,
    url_logo_cliente: '',
  },
  introduccion: {
    titulo: 'Dos opciones, un mismo objetivo: que el negocio venda más.',
    parrafos: [
      "Omar, me comentas que estás administrando el 'Palacio del Brazier' y que quieres presentar una propuesta al dueño del negocio. Entiendo perfectamente: necesitas algo concreto, con opciones claras y que sea fácil de explicar.",
      'Le presento dos alternativas diseñadas específicamente para este tipo de negocio. La recomendación es empezar con la opción más accesible y una vez que el dueño vea resultados, dar el salto a la opción completa.',
    ],
  },
  etapas: [
    {
      numero: '1',
      etiqueta_tiempo: 'Opción 1 · 1-2 semanas',
      nombre: 'Catálogo Digital',
      eslogan: '"El primer paso, el más accesible, el que funciona."',
      precio: '$200',
      precio_subtitulo: 'primer año / $100 renovación',
      descripcion: 'El primer paso para que el negocio tenga presencia digital. Catálogo profesional hasta 20 productos, código QR y pedidos por WhatsApp. Primer año $200, renovación $100.',
      entregables: ['Catálogo Digital hasta 20 productos', 'Código QR en punto de venta', 'WhatsApp como canal de ventas', 'Gestión de inventario en 10 segundos', 'Diseño funcional y profesional', 'Capacitación para el dueño'],
      nota_especial: 'Es la mejor opción para presentar al dueño y probar que funciona antes de invertir más. Primer año $200, renovación $100.',
      detalles_pie: ['⏱ 1-2 semanas', '📋 Facturación: RUC 1103421531001'],
    },
    {
      numero: '2',
      etiqueta_tiempo: 'Opción 2 · 7-15 días',
      nombre: 'Sitio Web Completo',
      eslogan: '"Su tienda online bajo su propia marca. Para crecer en serio."',
      precio: '$1,000',
      precio_subtitulo: 'hasta 40 páginas',
      descripcion: 'Si el dueño quiere ir más allá y tener su tienda online bajo su propia marca, con pasarela de pagos y gestión de inventario completa. Hasta 40 páginas, 100 productos, blindaje legal LOPDP y pasarela Payphone incluidos.',
      entregables: ['Sitio web hasta 40 páginas', 'Tienda online hasta 100 productos', 'Pasarela de pagos Payphone incluida', 'Blindaje Legal LOPDP incluido', 'Gestión de Inventario en tiempo real', 'Reportes de ventas detallados', 'SEO desde el día 1', 'Marca propia sin intermediarios'],
      nota_especial: 'Incluye diseño, desarrollo, configuración, puesta en marcha completa y capacitación.',
      detalles_pie: ['⏱ 7-15 días hábiles', '🛒 Escalable'],
    },
  ],
  cierre: {
    titulo: 'El siguiente paso',
    texto: 'Le propongo una breve sesión de 20 minutos para ajustar los detalles y que puedas presentar esto con confianza al dueño.',
    frase_final: 'No necesita una página web básica. Necesita un <span>sistema que venda</span> — y puede empezar con $200.',
  },
};

// ── 3. DANIEL VIVANCO — CENTRAL MARKET (bodega centro Loja)
const imgCentralMarket = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1974&auto=format&fit=crop';
const centralMarket = {
  id: 'daniel-vivanco-central-market-2026',
  portada: {
    etiqueta: 'Propuesta de Catálogo Digital',
    titulo_principal: 'Central Market merece estar en el teléfono de sus clientes.',
    titulo_destacado: 'En pleno centro de Loja, las 24 horas.',
    subtitulo: 'Preparado para el Sr. Daniel Vivanco | Junio 2026',
    preparado_para: 'Sr. Daniel Vivanco',
    preparado_por: 'César Reyes Jaramillo',
    fecha: 'Junio 2026',
    imagen_url: imgCentralMarket,
    url_fondo: imgCentralMarket,
    url_logo_cliente: '',
  },
  introduccion: {
    titulo: 'Una bodega en el centro merece un catálogo que trabaje solo.',
    parrafos: [
      "Daniel, me comentas que tienes una bodega llamada 'Central Market' en pleno centro de Loja (Rocafuerte y 18 de Noviembre) y que te gustó la idea del catálogo digital. Entiendo perfectamente: tienes un negocio con movimiento constante y necesitas que tus productos estén al alcance de tus clientes incluso cuando no están físicamente en tu local.",
      'Esta propuesta es directa, funcional y se pone en marcha en pocos días.',
    ],
  },
  etapas: [
    {
      numero: '1',
      etiqueta_tiempo: 'Implementación · 1-2 semanas',
      nombre: 'Catálogo Digital para Central Market',
      eslogan: '"Deja de perder ventas por no estar en el momento correcto."',
      precio: '$200',
      precio_subtitulo: 'primer año / $100 renovación',
      descripcion: 'El catálogo digital que necesitas para dejar de perder ventas. Hasta 20 productos organizados y accesibles desde el teléfono de cada cliente. Primer año $200, renovación $100.',
      entregables: ['Catálogo Digital hasta 20 productos', 'Código QR para tu local', 'Pedidos por WhatsApp estructurados', 'Control de stock en 10 segundos', 'Actualizaciones sin costo', 'Capacitación para que manejes todo'],
      nota_especial: 'Incluye diseño del catálogo con tu marca, instalación del QR y configuración completa. Primer año $200, renovación $100.',
      detalles_pie: ['⏱ 1-2 semanas', '📋 Facturación: RUC 1103421531001'],
    },
  ],
  comparativa: {
    titulo: 'Lo que ganas',
    filas: [
      { antes: 'El cliente pregunta por un producto, no lo tienes, se va a otro lado', despues: 'El cliente ve el catálogo y pide lo que hay disponible' },
      { antes: 'Pierdes ventas porque no estás en el momento correcto', despues: 'Tu catálogo está 24/7 en el teléfono de tus clientes' },
      { antes: 'Dependes de que el cliente venga al local', despues: 'Tus clientes pueden pedir por WhatsApp y pasar a recoger' },
    ],
  },
  cierre: {
    titulo: 'El siguiente paso',
    texto: 'Le propongo una breve sesión de 20 minutos para que puedas tener tu catálogo funcionando esta semana.',
    frase_final: 'Central Market tiene ubicación privilegiada. Con este catálogo, <span>cada persona que pase</span> frente a tu bodega tendrá todos tus productos en su bolsillo.',
  },
};

// ── 4. NANCY TORRES — GALTOR (bodega gran volumen)
const imgGaltor = 'https://images.unsplash.com/photo-1581007871115-f14bc016e0a4?q=80&w=1965&auto=format&fit=crop';
const galtor = {
  id: 'nancy-torres-galtor-2026',
  portada: {
    etiqueta: 'Propuesta de Sistema Completo de Digitalización',
    titulo_principal: 'Galtor merece un sistema a la altura de su volumen.',
    titulo_destacado: 'Contacto digital + Ecommerce + Automatización.',
    subtitulo: 'Preparado para la Sra. Nancy Torres | Junio 2026',
    preparado_para: 'Sra. Nancy Torres',
    preparado_por: 'César Reyes Jaramillo',
    fecha: 'Junio 2026',
    imagen_url: imgGaltor,
    url_fondo: imgGaltor,
    url_logo_cliente: '',
  },
  introduccion: {
    titulo: 'Una bodega grande necesita un sistema que escale con ella.',
    parrafos: [
      "Nancy, me comentas que tienes una bodega grande llamada 'Galtor' en la 18 de Noviembre entre Rocafuerte y Miguel Riofrío, y que te encantó la idea del contacto digital, el ecommerce y la automatización. Es un negocio de alto volumen y entiendo que necesitas algo que te ayude a manejar esa operación de forma más inteligente.",
      'Esta propuesta cubre las tres áreas que mencionaste, en etapas progresivas para que puedas decidir hasta dónde llegar.',
    ],
  },
  etapas: [
    {
      numero: '1',
      etiqueta_tiempo: 'Etapa Uno · 1 semana',
      nombre: 'Contacto Digital Profesional',
      eslogan: '"Que tus clientes nunca te olviden y te encuentren siempre."',
      precio: '$35',
      precio_subtitulo: 'anual',
      descripcion: 'El primer paso para que tus clientes nunca te olviden y te encuentren siempre. Tu marca instalada en el teléfono de cada cliente con foto, redes y botón de WhatsApp.',
      entregables: ['Marca instalada en el teléfono de cada cliente', 'Logo, fotos, ubicación, redes sociales', 'Presencia en Google cuando busquen tu zona', 'Código QR personalizado', 'Actualizaciones sin costo desde tu celular'],
      nota_especial: 'La base de cualquier estrategia digital seria.',
      detalles_pie: ['⏱ 1 semana', '📋 Facturación: RUC 1103421531001'],
    },
    {
      numero: '2',
      etiqueta_tiempo: 'Etapa Dos · 7-15 días',
      nombre: 'Sitio Web Completo para Galtor',
      eslogan: '"Una tienda online seria para una bodega seria."',
      precio: '$1,000',
      precio_subtitulo: 'hasta 40 páginas',
      descripcion: 'Una tienda online seria para una bodega seria. Hasta 40 páginas, hasta 100 productos, pasarela de pagos Payphone y blindaje legal LOPDP incluidos.',
      entregables: ['Sitio web hasta 40 páginas', 'Tienda online hasta 100 productos', 'Pasarela de pagos Payphone incluida', 'Blindaje Legal LOPDP incluido', 'Gestión de Inventario en tiempo real', 'Pedidos Online desde la web', 'Reportes de Ventas detallados', 'SEO desde el día 1'],
      nota_especial: 'Inversión que se paga sola cuando dejes de perder ventas por desorganización.',
      detalles_pie: ['⏱ 7-15 días hábiles', '📈 Escalable'],
    },
    {
      numero: '3',
      etiqueta_tiempo: 'Etapa Tres · Automatización',
      nombre: 'Automatización de WhatsApp Business',
      eslogan: '"Su WhatsApp como herramienta de ventas, trabajando 24/7."',
      precio: '$500',
      precio_subtitulo: 'pago único',
      descripcion: 'Tu WhatsApp como herramienta de ventas y atención, trabajando 24/7. La automatización responde consultas, envía catálogos y segmenta clientes automáticamente.',
      entregables: ['Respuestas Automáticas Inteligentes', 'Catálogo por WhatsApp', 'Segmentación de Clientes', 'Base de Datos de Clientes', 'Campañas Dirigidas por segmento', 'Capacitación completa'],
      nota_especial: 'El costo mensual de la API de WhatsApp es cubierto directamente por el cliente.',
      detalles_pie: ['🤖 Automatización completa', '📊 Sin costo mensual del servicio'],
    },
  ],
  comparativa: {
    titulo: 'Comparativa de Valor',
    filas: [
      { antes: 'Seguimiento manual: tu tiempo + errores = pierdes ventas', despues: 'Sistema completo Galtor: $40/mes = ventas organizadas, clientes controlados' },
    ],
  },
  cierre: {
    titulo: 'El siguiente paso',
    texto: 'Le propongo una breve sesión de 30 minutos para revisar los detalles y ajustar la propuesta a sus prioridades.',
    frase_final: 'Galtor es un negocio con potencial enorme. Con este sistema completo, puede manejar <span>más ventas</span>, atender mejor y tener control total.',
  },
};

// ── 5. VICENTE FLORES — COMERCIOS ONLY (almacén variedad)
const imgComerciosOnly = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop';
const comerciosOnly = {
  id: 'vicente-flores-comercios-only-2026',
  portada: {
    etiqueta: 'Propuesta de Catálogo Digital y Ecommerce',
    titulo_principal: 'Comercios Only merece mostrar toda su variedad.',
    titulo_destacado: 'Trajes, calzado, mochilas y sombreros — todo en un solo lugar.',
    subtitulo: 'Preparado para el Sr. Vicente Flores | Junio 2026',
    preparado_para: 'Sr. Vicente Flores',
    preparado_por: 'César Reyes Jaramillo',
    fecha: 'Junio 2026',
    imagen_url: imgComerciosOnly,
    url_fondo: imgComerciosOnly,
    url_logo_cliente: '',
  },
  introduccion: {
    titulo: 'Variedad, calidad y todo en un solo lugar — eso es Comercios Only.',
    parrafos: [
      "Vicente, me comentas que tienes un almacén llamado 'Comercios Only' con una variedad increíble: trajes, calzado, mochilas y sombreros. Es un negocio con mucho potencial y entiendo que necesitas una presencia digital que refleje esa variedad sin perder la esencia de tu marca.",
      'Le presento dos opciones para que elija la que mejor se ajuste a sus necesidades y presupuesto.',
    ],
  },
  etapas: [
    {
      numero: '1',
      etiqueta_tiempo: 'Opción 1 · 1-2 semanas',
      nombre: 'Catálogo Digital',
      eslogan: '"El primer paso: muestra tu variedad sin complicarte."',
      precio: '$200',
      precio_subtitulo: 'primer año / $100 renovación',
      descripcion: 'El primer paso para que tus productos estén donde tus clientes están. Organizamos toda tu variedad — trajes, calzado, mochilas y sombreros — en categorías claras y fáciles de navegar. Primer año $200, renovación $100.',
      entregables: ['Catálogo Digital hasta 20 productos', 'Código QR en tu local', 'Pedidos por WhatsApp estructurados', 'Control de stock por categoría', 'Actualizaciones sin costo', 'Capacitación para manejo propio'],
      nota_especial: 'La forma más rápida de mostrarle a tu cliente que tienes exactamente lo que buscan — antes de que entren al local. Primer año $200, renovación $100.',
      detalles_pie: ['⏱ 1-2 semanas', '📋 Facturación: RUC 1103421531001'],
    },
    {
      numero: '2',
      etiqueta_tiempo: 'Opción 2 · 7-15 días',
      nombre: 'Sitio Web Completo',
      eslogan: '"Tu marca, tu tienda, tu sistema de ventas 24/7."',
      precio: '$1,000',
      precio_subtitulo: 'hasta 40 páginas',
      descripcion: 'Si quieres ir más allá y tener tu tienda online bajo el nombre de Comercios Only, con pasarela de pagos y gestión de inventario completa. Hasta 40 páginas, 100 productos, blindaje legal LOPDP y pasarela Payphone incluidos.',
      entregables: ['Sitio web hasta 40 páginas', 'Tienda Online Profesional', 'Catálogo por Categorías (trajes, calzado, mochilas, sombreros)', 'Gestión de Inventario por categoría, talles y colores', 'Pasarela de Pagos Payphone incluida', 'Blindaje Legal LOPDP incluido', 'Reportes de Ventas por categoría', 'Marca propia sin intermediarios'],
      nota_especial: 'Con 40 páginas tienes espacio de sobra para toda tu variedad de productos.',
      detalles_pie: ['⏱ 7-15 días hábiles', '🛒 Escalable'],
    },
  ],
  comparativa: {
    titulo: 'Lo que ganaría Comercios Only',
    filas: [
      { antes: 'El cliente entra al almacén, ve algo, pregunta por tallas y se va si no hay', despues: 'El cliente ve el catálogo completo, sabe qué hay disponible y pide lo que necesita' },
      { antes: 'Dependes del tráfico en el local', despues: 'Tu catálogo está en el teléfono de cada cliente, disponible 24/7' },
      { antes: 'No sabes qué productos preguntan más', despues: 'Tienes reportes claros de qué vende y qué no' },
    ],
  },
  cierre: {
    titulo: 'El siguiente paso',
    texto: 'Le propongo una breve sesión de 20 minutos para ajustar los detalles y que puedas tener tu catálogo funcionando esta semana.',
    frase_final: 'Comercios Only tiene propuesta de valor clara. Empezar con el Catálogo de $200 te permite <span>probar que funciona</span> y luego escalar al Ecommerce.',
  },
};

// ── EJECUTAR
async function main() {
  console.log('=== PUBLICANDO 5 COTIZACIONES CON IMÁGENES ===\n');
  await publish(caricias);
  await publish(palacioDelBrazier);
  await publish(centralMarket);
  await publish(galtor);
  await publish(comerciosOnly);
  console.log('\n=== PROCESO COMPLETADO ===');
}

main();
