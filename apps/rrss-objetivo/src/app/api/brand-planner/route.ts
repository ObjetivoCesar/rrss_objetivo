import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Resolver rutas de forma dinámica
const resolvePath = (relPath: string) => {
  const pathsToTry = [
    // Local/Monorepo
    path.join(process.cwd(), "..", "..", relPath),
    // Vercel serverless functions (donde el cwd puede variar)
    path.join(process.cwd(), relPath),
    // Ruta absoluta local de respaldo
    path.join("c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo", relPath)
  ];

  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return pathsToTry[0];
};

const CSV_PATH = resolvePath("Jarvis/SEMANA-01-MARCA-PERSONAL.csv");
const MD_PATH = resolvePath("Jarvis/SEMANA-01-MARCA-PERSONAL.md");

// Helper robusto para parsear archivos CSV tolerando saltos de línea internos en las celdas
function parseCSV(text: string) {
  const result: string[][] = [];
  let row: string[] = [];
  let current = "";
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      // Manejar comilla doble de escape ("")
      if (insideQuote && nextChar === '"') {
        current += '"';
        i++; // Saltar la siguiente comilla
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(current.trim());
      current = "";
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      // Fin de línea real fuera de comillas
      if (char === '\r' && nextChar === '\n') {
        i++; // Saltar \n
      }
      row.push(current.trim());
      if (row.some(val => val !== "")) {
        result.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  // Agregar la última fila pendiente si existe
  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.some(val => val !== "")) {
      result.push(row);
    }
  }

  if (result.length === 0) return [];

  // Transformar a objetos con la cabecera
  const headers = result[0];
  const dataRows = [];
  for (let i = 1; i < result.length; i++) {
    const rowData = result[i];
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = rowData[idx] || "";
    });
    dataRows.push(obj);
  }
  
  return dataRows;
}

// Helper para convertir JSON de vuelta a CSV
function writeCSV(data: any[]) {
  const headers = ["Día", "Fecha", "Hora", "Formato", "Hook / Tema", "Descripción Visual", "Copy Sugerido", "CTA", "Guion Grabación", "SEO Keywords"];
  let csvText = headers.map(h => `"${h}"`).join(",") + "\n";
  
  data.forEach(row => {
    csvText += headers.map(h => {
      const val = (row[h] || "").replace(/"/g, '""');
      return `"${val}"`;
    }).join(",") + "\n";
  });
  
  return csvText;
}

// GET: Cargar el CSV
export async function GET() {
  try {
    if (!fs.existsSync(CSV_PATH)) {
      return NextResponse.json({ error: "No se encuentra el archivo CSV de planificación." }, { status: 404 });
    }
    const text = fs.readFileSync(CSV_PATH, "utf-8");
    const data = parseCSV(text);
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Modificar una celda y sincronizar tanto CSV como MD
export async function POST(req: NextRequest) {
  try {
    const { rowIndex, column, newValue } = await req.json();

    if (!fs.existsSync(CSV_PATH)) {
      return NextResponse.json({ error: "El archivo CSV de planificación no existe." }, { status: 404 });
    }

    const text = fs.readFileSync(CSV_PATH, "utf-8");
    const data = parseCSV(text);

    if (rowIndex < 0 || rowIndex >= data.length) {
      return NextResponse.json({ error: "Index de fila fuera de rango." }, { status: 400 });
    }

    // Actualizar el valor en la memoria de la base de datos CSV
    const oldRow = { ...data[rowIndex] };
    data[rowIndex][column] = newValue;

    // Guardar el nuevo CSV de forma atómica en el disco
    const newCSVText = writeCSV(data);
    fs.writeFileSync(CSV_PATH, newCSVText, "utf-8");

    // Sincronizar en caliente el archivo MD si afecta al guion (Hook / Tema, Copy Sugerido o Guion Grabación)
    if (fs.existsSync(MD_PATH) && (column === "Hook / Tema" || column === "Copy Sugerido" || column === "Descripción Visual" || column === "Guion Grabación")) {
      let mdText = fs.readFileSync(MD_PATH, "utf-8");
      
      const day = data[rowIndex]["Día"]?.toUpperCase();
      
      // Buscar la sección del día en el MD (ej: ## 📅 LUNES o ## 📅 MARTES)
      const daySectionHeader = `## 📅 ${day}`;
      
      if (mdText.includes(daySectionHeader)) {
        // Dividir el archivo MD por secciones para reescribir solo el fragmento de ese día
        const sections = mdText.split("## 📅 ");
        const updatedSections = sections.map(section => {
          if (section.startsWith(day)) {
            let sectionLines = section.split("\n");
            
            if (column === "Copy Sugerido") {
              const searchIndex = sectionLines.findIndex(line => line.includes(oldRow["Copy Sugerido"]) || line.includes("Copy Sugerido:"));
              if (searchIndex !== -1) {
                sectionLines[searchIndex] = `> **[Copy Sugerido]** "${newValue}"`;
              }
            } else if (column === "Hook / Tema") {
              const searchIndex = sectionLines.findIndex(line => line.includes(oldRow["Hook / Tema"]) || line.includes("Hook:"));
              if (searchIndex !== -1) {
                sectionLines[searchIndex] = `> **[Hook / Tema]** "${newValue}"`;
              }
            } else if (column === "Guion Grabación") {
              // Buscar e inyectar el guion de grabación en la sección correspondiente en el Markdown
              const searchIndex = sectionLines.findIndex(line => line.includes("Guion de Grabación:") || line.includes("Guion de Grabación"));
              if (searchIndex !== -1) {
                // Inyectar el guion nuevo con formato Markdown
                const formattedNewValue = newValue.split("\n").map((l: string) => `> ${l}`).join("\n");
                sectionLines[searchIndex + 1] = formattedNewValue;
              }
            }
            return sectionLines.join("\n");
          }
          return section;
        });
        
        mdText = updatedSections.join("## 📅 ");
        fs.writeFileSync(MD_PATH, mdText, "utf-8");
      }
    }

    return NextResponse.json({ success: true, updatedRow: data[rowIndex] });
  } catch (error: any) {
    console.error("BRAND PLANNER API POST ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
