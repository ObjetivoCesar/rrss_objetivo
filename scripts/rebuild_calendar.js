const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const BLOG_CSV = 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/BLOG_ESTRATEGICO_2026.csv';
const STRATEGY_CSV = 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/Estrategia_Posicionamiento_Mes1.csv';
const OUTPUT_CSV = 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/BLOG_ESTRATEGICO_CALENDARIO_2026.csv';

// Load existing block articles
const blogContent = fs.readFileSync(BLOG_CSV, 'utf-8');
const blogRecords = parse(blogContent, { columns: true, skip_empty_lines: true });

// Load Mes 1 Strategy
const strategyContent = fs.readFileSync(STRATEGY_CSV, 'utf-8');
const strategyRecords = parse(strategyContent, { skip_empty_lines: true });

// Mapping Weeks 1-4 from Strategy
const mes1Mapping = {
  1: { id: 3, goal: "Mito: 'Tengo clientela fija' / Miedo a la fuga" },
  2: { id: 2, goal: "Mito: 'Mi sobrino lo maneja' / Estrategia vs Visual" },
  3: { id: 17, goal: "Mito: 'Las webs no se usan' / Fricción de PDF vs Link" },
  4: { id: 8, goal: "Mito: 'Estoy ocupado' / Excel vs Software" }
};

const newRows = [];

// Generate 12 Weeks
const usedIds = new Set([3, 2, 17, 8]);
const remainingArticles = blogRecords.filter((r) => !usedIds.has(parseInt(r.ID)));

const findWeekRow = (num) => {
    return strategyRecords.find((row) => row[0] && row[0].includes(`Semana ${num}`));
};

for (let week = 1; week <= 12; week++) {
  let mainArticle;
  let goal = "";
  let weekRow;

  if (week <= 4) {
    const map = mes1Mapping[week];
    mainArticle = blogRecords.find((r) => parseInt(r.ID) === map.id);
    goal = map.goal;
    weekRow = findWeekRow(week);
  } else {
    mainArticle = remainingArticles.shift(); 
    goal = `Sinergia ${mainArticle ? mainArticle.Silo : 'General'}`;
  }

  if (!mainArticle) continue;

  // LUNES
  newRows.push({
    Semana: week,
    Objetivo: goal,
    Dia: 'Lunes',
    Titulo_Post: `Expectativa: ${mainArticle.Título}`,
    Artículo_ID: mainArticle.ID,
    Post_Mañana: (weekRow) ? weekRow[4] : `¿Tu negocio está preparado para ${mainArticle.Silo}? El Miércoles revelamos el sistema.`, 
    Historia_Noche: (weekRow) ? weekRow[5] : `Vota: ¿Crees que ${mainArticle.Silo} es prioridad hoy?`,
    Reel_Cesar: "-",
    Sinergia_CRM: (weekRow) ? weekRow[7] : "Capturar prospectos interesados.",
    Silo: mainArticle.Silo,
    Slug: mainArticle.Slug,
    Hub: mainArticle.Hub_URL,
    Prompt: mainArticle.Prompt_Portada_16_9
  });

  // MIERCOLES
  newRows.push({
    Semana: week,
    Objetivo: goal,
    Dia: 'Miércoles',
    Titulo_Post: `ANÁLISIS: ${mainArticle.Título}`,
    Artículo_ID: mainArticle.ID,
    Post_Mañana: mainArticle.Post_IG || mainArticle.Post_FB,
    Historia_Noche: mainArticle.Story_Idea || "Nuevo análisis disponible. Link en Bio.",
    Reel_Cesar: mainArticle.Script_Video || "Gancho de autoridad sobre " + mainArticle.Silo,
    Sinergia_CRM: "Link a: " + mainArticle.Hub_URL,
    Silo: mainArticle.Silo,
    Slug: mainArticle.Slug,
    Hub: mainArticle.Hub_URL,
    Prompt: mainArticle.Prompt_Portada_16_9
  });

  // VIERNES
  newRows.push({
    Semana: week,
    Objetivo: goal,
    Dia: 'Viernes',
    Titulo_Post: `RESULTADOS: ${mainArticle.Título}`,
    Artículo_ID: mainArticle.ID,
    Post_Mañana: "Caso aplicado. Menos fricción, más ventas.",
    Historia_Noche: "Demo en vivo en Stories 🔥",
    Reel_Cesar: (weekRow && weekRow[6] !== '-') ? weekRow[6] : "Demostración de resultados con " + mainArticle.Silo,
    Sinergia_CRM: "Cerrar citas de diagnóstico.",
    Silo: mainArticle.Silo,
    Slug: mainArticle.Slug,
    Hub: mainArticle.Hub_URL,
    Prompt: mainArticle.Prompt_Portada_16_9
  });
}

const outputContent = stringify(newRows, { header: true });
fs.writeFileSync(OUTPUT_CSV, outputContent);

console.log(`Calendario generado en ${OUTPUT_CSV}`);
