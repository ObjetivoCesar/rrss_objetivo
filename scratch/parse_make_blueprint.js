const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Automatización de RRSS Objetivo.blueprint.json');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const blueprint = JSON.parse(content);
  
  console.log("=== MAKE SCENARIO BLUEPRINT ANALYSIS ===");
  console.log("Name:", blueprint.name || "Unknown");
  
  const flow = blueprint.flow || [];
  console.log("\n=== FLOW MODULES ===");
  flow.forEach((node, index) => {
    console.log(`[${index + 1}] ID: ${node.id} | Module: ${node.module} | Label: ${node.metadata?.label || node.label || 'None'}`);
    if (node.routes) {
      console.log(`    -> Contains Router routes:`);
      node.routes.forEach((route, rIndex) => {
        console.log(`       Route [${rIndex + 1}]:`);
        route.flow.forEach((rNode, rnIndex) => {
          console.log(`          [${rnIndex + 1}] ID: ${rNode.id} | Module: ${rNode.module} | Label: ${rNode.metadata?.label || rNode.label || 'None'}`);
        });
      });
    }
  });

} catch (error) {
  console.error("Error reading blueprint:", error.message);
}
