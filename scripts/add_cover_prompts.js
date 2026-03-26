const fs = require('fs');
const path = require('path');

const csvPath = path.join('C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\BLOG_ESTRATEGICO_2026.csv');

const articles = {
  1: { style: 'CYBER-TECH', title: 'IA en ECUADOR', sub: 'Casos Reales de Éxito', scene: 'Un majestuoso puente láser brillante cruzando un cañón montañoso oscuro y brumoso hacia una ciudad corporativa futurista llena de luz.', ecu: 'Silueta estilizada de la ciudad de Quito en el horizonte.', branding: 'Logo grabado en placa de acero en la entrada del puente.' },
  2: { style: 'ORGANIC-PREMIUM', title: 'EL ERROR DEL SOBRINO', sub: 'Marketing vs Publicaciones', scene: 'Un frágil castillo de naipes desmoronándose sobre una mesa de cristal en una sala de juntas elegante.', ecu: 'Fondo difuminado de un centro de negocios premium en Cumbayá, Quito.', branding: 'Logo pirograbado en la madera de la mesa.' },
  3: { style: 'CYBER-TECH', title: 'GOOGLE MAPS LOCAL', sub: 'Domina tu Ciudad', scene: 'Un imponente pin de geolocalización de oro macizo iluminando como un faro un paisaje digital árido y oscuro.', ecu: 'La silueta de los Andes Ecuatorianos bajo un cielo nocturno estrellado.', branding: 'Logo proyectado como un holograma fotorrealista sobre el suelo cerca del pin.' },
  4: { style: 'CYBER-TECH', title: 'WHATSAPP + CRM IA', sub: 'Vende mientras duermes', scene: 'Un cerebro cibernético latiendo con luz violeta intensa dentro del esqueleto de cristal de un smartphone futurista.', ecu: 'Patrón topográfico digital de la geografía de Ecuador en el fondo.', branding: 'Logo integrado en la interfaz de la pantalla del smartphone.' },
  5: { style: 'CYBER-TECH', title: 'E-COMMERCE 2026', sub: 'Ventas sin Fricción', scene: 'Un grueso catálogo de productos en papel disolviéndose mágicamente en partículas de luz dorada ascendentes.', ecu: 'Entorno de showroom de lujo con estética quiteña moderna al fondo.', branding: 'Logo grabado en láser sobre la base de mármol donde reposa el catálogo.' },
  6: { style: 'ORGANIC-PREMIUM', title: 'TARJETAS DE PAPEL', sub: 'La era del cartón terminó', scene: 'Una tarjeta de presentación de cartón viejo ardiendo en llamas frías mientras de sus cenizas emerge una proyección NFC.', ecu: 'Malecón 2000 estilizado y desenfocado al fondo.', branding: 'Logo integrado en la proyección holográfica NFC.' },
  7: { style: 'CYBER-TECH', title: 'MADRUGADA DIGITAL', sub: 'No dejes de vender', scene: 'Un reloj de arena cristalino donde fluyen monedas de oro fluido bajo una luz de luna cibernética violeta.', ecu: 'El Nevado Chimborazo bajo la luz de la luna al fondo.', branding: 'Logo tallado en el cristal superior del reloj de arena.' },
  8: { style: 'CYBER-TECH', title: 'ADIÓS A EXCEL', sub: 'Sistemas que Escalan', scene: 'Un inmenso engranaje metálico oxidado siendo perforado y reemplazado por un núcleo de energía digital azul.', ecu: 'Textura de piedra volcánica andina en las superficies del engranaje.', branding: 'Logo iluminado en neón sobre el soporte del engranaje principal.' },
  9: { style: 'CYBER-TECH', title: 'ARQUITECTURA DE VENTAS', sub: 'Eficiencia Operativa', scene: 'Infraestructura de tubos transparentes por donde viajan veloces esferas doradas a velocidad luz.', ecu: 'Línea del Ecuador (Mitad del Mundo) integrada como una línea de luz guía.', branding: 'Logo grabado en los pilares de la infraestructura.' },
  10: { style: 'CYBER-TECH', title: 'NUEVOS MERCADOS', sub: 'Ecuador Digital 2026', scene: 'Mapa topográfico holográfico 3D sobre un escritorio, con pilares de luz dorada emergiendo.', ecu: 'Mapa 3D exacto del territorio ecuatoriano con realce en regiones clave.', branding: 'Logo proyectado en el centro del mapa 3D.' },
  11: { style: 'CYBER-TECH', title: 'AUTOMATIZACIÓN PYME', sub: 'Tecnología Asequible', scene: 'Un escudo de energía hexagonal brillante protegiendo un núcleo de luz frente a una tormenta binaria.', ecu: 'Acentos de diseño precolombino estilizados en el patrón del escudo.', branding: 'Logo integrado en el centro del escudo de energía.' },
  12: { style: 'CYBER-TECH', title: 'SEÑALES DE CONFIANZA', sub: 'El secreto de Google', scene: 'Panel de control minimalista con un indicador de confianza cargándose de rojo a verde deslumbrante.', ecu: 'Skyline nocturno de la Granados en Quito al fondo.', branding: 'Logo grabado en el marco del panel de control.' },
  13: { style: 'CYBER-TECH', title: 'AUTORIDAD B2B', sub: 'Domina Google y la IA', scene: 'Trono cibernético brutalista en la cima de una montaña de servidores apilados.', ecu: 'Silueta del volcán Cotopaxi digitalizado en el horizonte.', branding: 'Logo tallado en bajorrelieve sobre el trono.' },
  14: { style: 'CYBER-TECH', title: 'CIBERSEGURIDAD PYME', sub: 'Protege tus Datos', scene: 'Bóveda de seguridad digital esférica siendo blindada por capas de campos de fuerza violeta.', ecu: 'Código fuente que incluye nombres de provincias ecuatorianas en las capas de datos.', branding: 'Logo impreso en 3D sobre la cerradura central de la bóveda.' },
  15: { style: 'ORGANIC-PREMIUM', title: 'NETWORKING CEO', sub: 'Tu Oficina Digital', scene: 'Silueta de ejecutivo escudriñando el horizonte urbano con una lente de datos proyectada.', ecu: 'Vista panorámica desde un penthouse en la zona de la Carolina, Quito.', branding: 'Logo sutil en el pin de la solapa del traje del ejecutivo.' },
  16: { style: 'CYBER-TECH', title: 'EMAIL MARKETING', sub: 'El retorno del Rey', scene: 'Sobre físico transformándose en cascada de código con sellos de lacre 3D fundidos en oro.', ecu: 'Sellos de lacre con el símbolo del sol de la cultura Tolita.', branding: 'Logo de Objetivo en el sello de oro principal.' },
  17: { style: 'ORGANIC-PREMIUM', title: 'MENÚS DIGITALES 2026', sub: 'Guía para Restaurantes', scene: 'Plan macro de un plato de Ceviche de Camarón ecuatoriano perfecto y humeante junto a una placa de cristal QR.', ecu: 'Platillo típico: Ceviche de Camarón con chifle y maíz tostado.', branding: 'Logo grabado en el soporte de cristal del menú QR.' },
  18: { style: 'ORGANIC-PREMIUM', title: 'COSTO DE IMPRESIÓN', sub: 'Deja de quemar dinero', scene: 'Torre de billetes encendida en fuego verde frente a una impresora térmica vieja soltando papel roto.', ecu: 'Billetes de dólares (moneda local) con detalles de luz verde intensa.', branding: 'Logo pirograbado en la madera de la mesa del restaurante.' },
  19: { style: 'ORGANIC-PREMIUM', title: 'TICKET PROMEDIO', sub: 'Vende más con Fotos', scene: 'Un Bolón de Verde gourmet proyectado en 3D volumétrico sobre una mesa elegante de piedra negra.', ecu: 'Platillo típico: Bolón de Verde con queso y chicharrón.', branding: 'Logo grabado en la piedra de la mesa.' },
  20: { style: 'ORGANIC-PREMIUM', title: 'FILA CERO', sub: 'Pedidos desde la mesa', scene: 'Cronómetro analógico estallando y liberando rayos de luz hacia un icono de chef brillante.', ecu: 'Ambiente de pizzería o café gourmet en el sector de La Floresta, Quito.', branding: 'Logo integrado en el uniforme del chef holográfico.' },
  21: { style: 'ORGANIC-PREMIUM', title: 'NETWORKING B2B', sub: 'El nuevo estándar NFC', scene: 'Dos figuras de cristal facetado estrechando manos mecánicas generando un pulso de luz azul.', ecu: 'Entorno corporativo de la Av. República del Salvador en Quito.', branding: 'Logo grabado en la placa de identificación del ejecutivo.' },
  22: { style: 'ORGANIC-PREMIUM', title: 'EL 88% ES BASURA', sub: 'Tarjetas de Papel', scene: 'Mano ejecutiva sobre mesa de mármol oscuro sosteniendo una tarjeta arrugada frente a un smartphone brillante.', ecu: 'Lobby de hotel de lujo en Quito (ej. Casa Gangotena o Marriott).', branding: 'Logo visible en la pantalla del smartphone.' },
  23: { style: 'ORGANIC-PREMIUM', title: 'CAPTURA DE DATOS', sub: '3 Segundos para Ganar', scene: 'Relámpago púrpura golpeando pedestal y convirtiendo un contacto en una figura de oro puro.', ecu: 'Pedestal de piedra tallada con relieves clásicos andinos.', branding: 'Logo grabado en el pedestal de mármol.' },
  24: { style: 'ORGANIC-PREMIUM', title: 'CIERRE DE VENTAS', sub: 'Del Evento al CRM', scene: 'Embudo magnético oscuro succionando luz blanca y forjándola en lingotes de oro sólido.', ecu: 'Estética de oficina de alta dirección en el Puerto Santa Ana, Guayaquil.', branding: 'Logo en relieve sobre los lingotes de oro.' }
};

try {
  let content = fs.readFileSync(csvPath, 'utf8');
  let lines = content.replace(/\r\n/g, '\n').split('\n');

  const parseCSVLine = (line) => {
    const matches = line.match(/(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g);
    if (!matches) return [];
    return matches.map(m => {
      let val = m.startsWith(',') ? m.substring(1) : m;
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      return val.trim();
    });
  };

  const escapeCSV = (val) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  };

  let newLines = [];
  let headerCols = parseCSVLine(lines[0]);
  let promptIdx = headerCols.indexOf('Prompt_Portada_16_9');
  
  // Si no existe la columna, la añadimos al header
  if (promptIdx === -1) {
    headerCols.push('Prompt_Portada_16_9');
    promptIdx = headerCols.length - 1;
  }
  newLines.push(headerCols.map(escapeCSV).join(','));

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    let cols = parseCSVLine(rawLine);
    const id = parseInt(cols[0]);

    if (articles[id]) {
      const art = articles[id];
      const styleGuide = art.style === 'CYBER-TECH' ? 
        'Estilo: Cyber-Tech. Fondo azul medianoche a negro carbón con luz volumétrica, neón violeta y dorado. Tipografía Bold Sans-serif Blanca.' :
        'Estilo: Organic-Premium. Iluminación cálida cinematográfica, sombras suaves y bokeh elegante. Tipografía Serif Premium Crema/Gris.';
      
      const mockupRule = art.style === 'CYBER-TECH' ? 
        `Integra el logotipo transparente de "Objetivo" que te adjunto de forma NATURAL y FOTORREALISTA como: ${art.branding}` :
        `Integra el logotipo transparente de "Objetivo" que te adjunto de forma NATURAL y FOTORREALISTA como: ${art.branding}`;

      const finalPrompt = `Actúa como un Director de Arte de élite y fotógrafo publicitario. 
Genera una imagen fotorrealista 3D en formato 16:9. 
${styleGuide} 
ESCENA: ${art.scene} 
IDENTIDAD ECUADOR: ${art.ecu} 
${mockupRule} 
TEXTO (OBLIGATORIO): Renderiza sobre la imagen en el tercio superior izquierdo: 
- Título: "${art.title}" 
- Subtítulo: "${art.sub}" 
REGLA CRÍTICA: La imagen NO DEBE estar vacía. El texto y el logo deben ser parte integral de la composición. Máximo realismo corporativo.`;

      cols[promptIdx] = finalPrompt;
    }

    newLines.push(cols.map(escapeCSV).join(','));
  }

  const output = newLines.join('\n');
  fs.writeFileSync(csvPath, output, 'utf8');

  console.log('¡CSV actualizado masivamente con los 24 Prompts Pro 16:9 (Ecuador + Logo + Text)!');

} catch (err) {
  console.error("Error al procesar el CSV:", err);
}
