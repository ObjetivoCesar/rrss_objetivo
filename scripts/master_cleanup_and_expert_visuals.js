const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const CSV_PATH = "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\BLOG_ESTRATEGICO_2026.csv";

// 🏆 METÁFORAS LÍMBICAS - VEREDICTO DEL COMITÉ (PSICÓLOGO, COPY, CLOSER, DIRECTOR)
const EXPERT_METAPHORS = {
  1: {
    title: "PUENTE DIGITAL",
    subtitle: "IA en Ecuador Real",
    scene: "Un majestuoso puente de energía azul neón cruzando un abismo oscuro hacia una ciudad futurista.",
    identity: "Silueta del volcán Cotopaxi de fondo bajo una lluvia de datos dorados.",
    branding: "Logo grabado en los pilares metálicos del puente.",
    style: 'Cyber-Tech'
  },
  2: {
    title: "EL SEMÁFORO EN VERDE",
    subtitle: "Pero la calle está vacía",
    scene: "Un semáforo solitario brillando en verde intenso en una calle nocturna empedrada y solitaria.",
    identity: "Arquitectura colonial del Centro Histórico de Quito con reflejos de lluvia.",
    branding: "Logo 'Objetivo' pirograbado en la base de piedra del semáforo.",
    style: 'Organic-Premium'
  },
  3: {
    title: "EL FARO DE ORO",
    subtitle: "Domina Google Maps",
    scene: "Un faro antiguo de metal dorado emitiendo un haz de luz láser potente que atraviesa las nubes.",
    identity: "Costa ecuatoriana al amanecer, con el mar de color azul zafiro.",
    branding: "Logo integrado en la lente de cristal del faro.",
    style: 'Cyber-Tech'
  },
  4: {
    title: "LATIDO DE CRISTAL",
    subtitle: "WhatsApp CRM con IA",
    scene: "Un corazón humano estilizado hecho de fibra óptica latiendo rítmicamente dentro de un smartphone.",
    identity: "Patrón de tejidos andinos proyectado como luz de fondo.",
    branding: "Logo grabado en el cristal del smartphone.",
    style: 'Cyber-Tech'
  },
  5: {
    title: "EL ORIGAMI MAESTRO",
    subtitle: "E-commerce sin fricción",
    scene: "Un fajo de billetes y facturas de papel plegándose mágicamente hasta convertirse en un pájaro de luz.",
    identity: "Entorno de oficina premium en Cumbayá, Quito.",
    branding: "Logo quemado en la mesa de madera sobre la que vuela el pájaro.",
    style: 'Organic-Premium'
  },
  6: {
    title: "ALQUIMIA NFC",
    subtitle: "El fin del papel",
    scene: "Una tarjeta de visita de papel arrugado convirtiéndose en oro fundido al tocar un anillo digital.",
    identity: "Skyline desenfocado del Malecón 2000 en Guayaquil.",
    branding: "Logo grabado en el anillo digital.",
    style: 'Cyber-Tech'
  },
  7: {
    title: "VIGILANTE ETERNO",
    subtitle: "No dejes de vender",
    scene: "Un reloj de arena donde la arena es luz líquida, suspendido en el aire frente a una ventana abierta a la noche.",
    identity: "La Virgen del Panecillo visible a lo lejos bajo la luna.",
    branding: "Logo tallado en el mármol del marco de la ventana.",
    style: 'Organic-Premium'
  },
  8: {
    title: "NÚCLEO DE FUSIÓN",
    subtitle: "Adiós al techo de Excel",
    scene: "Un engranaje de piedra volcánica gigante siendo fracturado por un núcleo de energía azul que emerge del centro.",
    identity: "Textura de piedra de los Andes en el engranaje.",
    branding: "Logo proyectado como holograma sobre la energía azul.",
    style: 'Cyber-Tech'
  },
  9: {
    title: "LA VÍA RÁPIDA",
    subtitle: "Arquitectura de Ventas",
    scene: "Un tren de levitación magnética de cristal recorriendo un túnel de luz infinito.",
    identity: "Línea del Ecuador iluminada como un raíl de oro en el suelo.",
    branding: "Logo en la proa del tren de cristal.",
    style: 'Cyber-Tech'
  },
  10: {
    title: "MINAS DE DATOS",
    subtitle: "Mercados Ecuador 2026",
    scene: "Picos de luz dorada emergiendo de un terreno oscuro como si fueran rascacielos de datos.",
    identity: "Mapa físico de Ecuador en relieve sobre una mesa táctil.",
    branding: "Logo de Objetivo flotando sobre el centro del mapa.",
    style: 'Cyber-Tech'
  },
  11: {
    title: "EL ESCUDO SAGRADO",
    subtitle: "Futuro de la PYME",
    scene: "Una cúpula de energía geométrica protegiendo a un pequeño brote de planta dorada de una tormenta electrónica.",
    identity: "Acentos de diseño precolombino en la estructura de la cúpula.",
    branding: "Logo grabado en la base metálica de la planta.",
    style: 'Organic-Premium'
  },
  12: {
    title: "RECONOCIMIENTO DE AURA",
    subtitle: "Señales de Confianza",
    scene: "Una mano humana estrechando una mano de luz, mientras un escáner de retina verde valida la conexión.",
    identity: "Sector financiero de la Av. República del Salvador, Quito.",
    branding: "Logo bordado en el puño de la camisa del ejecutivo.",
    style: 'Organic-Premium'
  },
  13: {
    title: "CUMBRE B2B",
    subtitle: "Domina Google y la IA",
    scene: "Un ejecutivo en la cima de una pirámide brutalista de mármol negro que toca las nubes.",
    identity: "Picos nevados de los Andes rodeando la pirámide.",
    branding: "Logo tallado en el mármol negro del trono en la cima.",
    style: 'Cyber-Tech'
  },
  14: {
    title: "BÓVEDA DE CRISTAL",
    subtitle: "Ciberseguridad PYME",
    scene: "Una esfera de cristal impenetrable rodeada de anillos de satélites láser que repelen ataques rojos.",
    identity: "Gráficos de datos con nombres de ciudades ecuatorianas en los anillos.",
    branding: "Logo de Objetivo en el centro de la esfera.",
    style: 'Cyber-Tech'
  },
  15: {
    title: "MIRADA DE HALCÓN",
    subtitle: "Networking para CEOs",
    scene: "Unas gafas de realidad aumentada minimalistas sobre un escritorio de cuero, proyectando conexiones globales.",
    identity: "Vista panorámica de Quito al atardecer a través de un gran ventanal.",
    branding: "Logo grabado en la patilla de las gafas.",
    style: 'Organic-Premium'
  },
  16: {
    title: "MENSAJE DE FUEGO",
    subtitle: "Email Marketing 2026",
    scene: "Una carta antigua envuelta en un aura de energía eléctrica que sale de un smartphone.",
    identity: "Sello de lacre con el símbolo del Sol de la cultura Tolita.",
    branding: "Logo integrado en el sello de lacre.",
    style: 'Organic-Premium'
  },
  17: {
    title: "LA LLAVE GOURMET",
    subtitle: "Guía Menús Digitales",
    scene: "Un plato de autor minimalista junto a una placa de obsidiana grabada con un QR que emite luz.",
    identity: "Detalles de vegetación amazónica fresca decorando el ambiente.",
    branding: "Logo de Objetivo grabado en la placa de obsidiana.",
    style: 'Organic-Premium'
  },
  18: {
    title: "LA CORTINA DE PAPEL",
    subtitle: "El costo de imprimir",
    scene: "Una cascada de recibos de papel cayendo como una pared frente a una cocina moderna y brillante.",
    identity: "Moneda de dólar con luz verde filtrada entre el papel.",
    branding: "Logo de Objetivo quemado en el mostrador de madera.",
    style: 'Organic-Premium'
  },
  19: {
    title: "EL HALO DEL SABOR",
    subtitle: "Vende más con Fotos",
    scene: "Un Bolón de Verde en primer plano cinematográfico con un halo de luz divina que lo hace irresistible.",
    identity: "Plato típico: Bolón de Verde con chicharrón y café de especialidad.",
    branding: "Logo grabado en la cerámica del plato.",
    style: 'Organic-Premium'
  },
  20: {
    title: "EL TIEMPO DERRETIDO",
    subtitle: "Elimina la Fila",
    scene: "Un reloj de pared deformándose (estilo Dalí) sobre una barra de bar llena de clientes felices sin esperar.",
    identity: "Ambiente de café bohemio en La Floresta, Quito.",
    branding: "Logo bordado en el delantal del barista.",
    style: 'Organic-Premium'
  },
  21: {
    title: "EL SALUDO ELÉCTRICO",
    subtitle: "Networking B2B NFC",
    scene: "Dos tarjetas de metal chocando y generando una onda expansiva de partículas de datos.",
    identity: "Puerto Santa Ana, Guayaquil, reflejado en el metal.",
    branding: "Logo grabado en la tarjeta de metal de primer plano.",
    style: 'Cyber-Tech'
  },
  22: {
    title: "LA PERLA EN EL LODAZAL",
    subtitle: "88% es Basura",
    scene: "Un vertedero de papel picado del que emerge una única tarjeta de cristal brillante e indestructible.",
    identity: "Luz fría de oficina corporativa de alta gama.",
    branding: "Logo de Objetivo brillando dentro del cristal.",
    style: 'Cyber-Tech'
  },
  23: {
    title: "EL LAZO DE LUZ",
    subtitle: "Captura de Leads 3s",
    scene: "Un rayo de energía siendo atrapado por un lazo de fibra óptica en un movimiento veloz.",
    identity: "Montañas de los Andes desenfocadas en un entorno de alta velocidad.",
    branding: "Logo de Objetivo grabado en el mango del lazo de fibra.",
    style: 'Cyber-Tech'
  },
  24: {
    title: "EL ALQUIMISTA",
    subtitle: "Del Evento al CRM",
    scene: "Una mano metálica futurista que convierte hojas de papel en barras de oro sólido al tocarlas.",
    identity: "Oficina de alta dirección en Quito con acabados de madera y metal.",
    branding: "Logo en relieve sobre las barras de oro.",
    style: 'Organic-Premium'
  }
};

function generateUniversalPrompt(id, meta) {
  const isCyber = meta.style === 'Cyber-Tech';
  
  return `Actúa como un Director de Arte de élite y fotógrafo publicitario. 
Genera una imagen fotorrealista 3D en formato 16:9. 
Estilo: ${meta.style}. ${isCyber ? 'Fondo azul medianoche a negro carbón con luz volumétrica, neón violeta y dorado. Tipografía Bold Sans-serif Blanca.' : 'Iluminación cálida cinematográfica, sombras suaves y bokeh elegante. Tipografía Serif Premium Crema/Gris.'} 
ESCENA: ${meta.scene} 
IDENTIDAD ECUADOR: ${meta.identity} 
Integra el logotipo transparente de "Objetivo" que te adjunto de forma NATURAL y FOTORREALISTA como: ${meta.branding} 
TEXTO (OBLIGATORIO): Renderiza sobre la imagen en el tercio superior izquierdo: 
- Título: "${meta.title}" 
- Subtítulo: "${meta.subtitle}" 
REGLA CRÍTICA: La imagen NO DEBE estar vacía. El texto y el logo deben ser parte integral de la composición. Máximo realismo corporativo.`;
}

async function masterProcess() {
  console.log("🚀 Iniciando Proceso Maestro: Limpieza H1 + Portadas Expertas...");
  
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });
  
  let h1CleanedCount = 0;
  let promptsUpdatedCount = 0;

  const updatedRecords = records.map((record) => {
    const id = parseInt(record.ID);
    
    // 1. LIMPIEZA H1
    if (record.Contenido_Markdown && record.Contenido_Markdown.trim().startsWith('# ')) {
      // Eliminamos la primera línea de H1
      record.Contenido_Markdown = record.Contenido_Markdown.replace(/^#\s+.*\n?/, '').trim();
      h1CleanedCount++;
    }

    // 2. GENERACIÓN DE PROMPTS EXPERTOS (Solo para los 24 artículos estratégicos)
    if (id >= 1 && id <= 24 && EXPERT_METAPHORS[id]) {
      record.Prompt_Portada_16_9 = generateUniversalPrompt(id, EXPERT_METAPHORS[id]);
      promptsUpdatedCount++;
    }

    return record;
  });

  const output = stringify(updatedRecords, { header: true });
  fs.writeFileSync(CSV_PATH, output);

  console.log(`✅ ¡Proceso completado con éxito!`);
  console.log(`🧹 H1s limpiados: ${h1CleanedCount}`);
  console.log(`🎨 Portadas Expertas generadas: ${promptsUpdatedCount}`);
}

masterProcess().catch(console.error);
