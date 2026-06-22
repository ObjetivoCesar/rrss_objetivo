import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const BLOG_CSV = 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/BLOG_ESTRATEGICO_2026.csv';
const STRATEGY_CSV = 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/Estrategia_Posicionamiento_Mes1.csv';
const OUTPUT_CSV = 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/BLOG_ESTRATEGICO_CALENDARIO_2026.csv';

// Load existing block articles
const blogContent = fs.readFileSync(BLOG_CSV, 'utf-8');
const blogRecords = parse(blogContent, { columns: true, skip_empty_lines: true });

// Load Mes 1 Strategy
const strategyContent = fs.readFileSync(STRATEGY_CSV, 'utf-8');
// Use skip_empty_lines: true to avoid the 1000 empty lines
const strategyRecords = parse(strategyContent, { skip_empty_lines: true });

// Mapping Weeks 1-4 from Strategy
const mes1Mapping: any = {
  1: { id: 3, goal: "Mito: 'Tengo clientela fija' / Miedo a la fuga" },
  2: { id: 2, goal: "Mito: 'Mi sobrino lo maneja' / Estrategia vs Visual" },
  3: { id: 17, goal: "Mito: 'Las webs no se usan' / Fricción de PDF vs Link" },
  4: { id: 8, goal: "Mito: 'Estoy ocupado' / Excel vs Software" }
};

const newRows: any[] = [];

// Header structure
// Semana, Objetivo, Dia, Titulo, ID, PR_Mañana, PR_Noche, AQ_Mañana, AQ_Noche, Reel, Sinergia, Silo, Slug, Hub, Prompt

// Generate 12 Weeks
const usedIds = new Set([3, 2, 17, 8]);
const remainingArticles = blogRecords.filter((r: any) => !usedIds.has(parseInt(r.ID)));

// Find week rows precisely (they skip lines in the original xlsx)
const findWeekRow = (num: number) => {
    return strategyRecords.find((row: string[]) => row[0]?.includes(`Semana ${num}`));
};

for (let week = 1; week <= 12; week++) {
  let mainArticle: any;
  let goal = "";
  let weekRow: any;

  if (week <= 4) {
    const map = mes1Mapping[week];
    mainArticle = blogRecords.find((r: any) => parseInt(r.ID) === map.id);
    goal = map.goal;
    weekRow = findWeekRow(week);
  } else {
    mainArticle = remainingArticles.shift(); 
    goal = `Sinergia ${mainArticle?.Silo || 'General'}`;
  }

  if (!mainArticle) continue;

  // LUNES - Post de Expectativa
  newRows.push({
    Semana: week,
    Objetivo: goal,
    Dia: 'Lunes',
    Titulo: `Expectativa: ${mainArticle.Título}`,
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

  // MIERCOLES - Análisis (Artículo Deep Dive)
  newRows.push({
    Semana: week,
    Objetivo: goal,
    Dia: 'Miércoles',
    Titulo: `ANÁLISIS: ${mainArticle.Título}`,
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

  // VIERNES - Resultados / Prueba Social
  newRows.push({
    Semana: week,
    Objetivo: goal,
    Dia: 'Viernes',
    Titulo: `RESULTADOS: ${mainArticle.Título}`,
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

// Convert back to CSV
const outputContent = stringify(newRows, { header: true });
fs.writeFileSync(OUTPUT_CSV, outputContent);

console.log(`Calendario generado en ${OUTPUT_CSV}`);
