
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('/tmp/content_audit_data.json', 'utf8'));
const articles = data.mysqlArticles;

const silos = {
  marketing: { name: "Marketing para PYMES", keywords: ["negocio", "clientes", "marketing", "ventas", "lealtad", "crecer", "empresa", "facturación", "estratégico", "pymes"], items: [] },
  automatizacion: { name: "Automatización de Ventas", keywords: ["automatizar", "sistemas", "ajustar", "ahorrar tiempo", "whatsapp", "eficiencia", "herramientas", "automatización", "procesos"], items: [] },
  seo: { name: "Posicionamiento en Google", keywords: ["google", "seo", "posicionamiento", "ranking", "visible", "invisible", "búsqueda", "internet", "encontrar", "ciudad"], items: [] },
  activaqr: { name: "ActivaQR (Producto)", keywords: ["menú", "menu", "qr", "nfc", "tarjetas digitales", "catálogo", "whatsapp", "tarjeta digital", "tarjeta de presentación"], items: [] },
  otros: { name: "Otros / Legacy", keywords: [], items: [] }
};

articles.forEach(article => {
  const title = article.title.toLowerCase();
  let assigned = false;
  
  // SEO has high priority for these specific keywords
  if (title.includes("google") || title.includes("seo") || title.includes("ranking")) {
    silos.seo.items.push(article);
    assigned = true;
  } else if (title.includes("automatizar") || title.includes("sistema") || title.includes("eficiencia")) {
    silos.automatizacion.items.push(article);
    assigned = true;
  } else if (title.includes("menú") || title.includes("menu") || title.includes("qr") || title.includes("tarjeta digital") || title.includes("catálogo")) {
    silos.activaqr.items.push(article);
    assigned = true;
  } else if (title.includes("negocio") || title.includes("cliente") || title.includes("marketing")) {
    silos.marketing.items.push(article);
    assigned = true;
  } else {
    silos.otros.items.push(article);
  }
});

let report = "# Reporte de Auditoría de Contenidos - Clasificación Estratégica\n\n";
report += "Clasificación automática de los 107 artículos detectados en el sistema.\n\n";

for (const key in silos) {
  const silo = silos[key];
  report += `## ${silo.name} (${silo.items.length} artículos)\n\n`;
  report += "| ID | Título | Acción Recomendada |\n";
  report += "| :--- | :--- | :--- |\n";
  silo.items.forEach(article => {
    let action = "Reescribir con tono Donna";
    if (key === 'activaqr') action = "Enlazar a activaqr.com/blog";
    if (key === 'otros') action = "Evaluar eliminación o redirección";
    report += `| ${article.id.substring(0,8)} | ${article.title} | ${action} |\n`;
  });
  report += "\n";
}

fs.writeFileSync('/tmp/audit_report.md', report);
console.log("Reporte generado en /tmp/audit_report.md");
