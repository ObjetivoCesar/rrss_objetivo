import fetch from 'node-fetch';

async function run() {
  console.log('--- TEST: Soft Delete ---');
  
  const baseUrl = 'http://localhost:3000/api/campaigns';
  
  // Create a dummy objective
  console.log('1. Creando objetivo de prueba...');
  const createRes = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'objective',
      name: 'Test Soft Delete',
      description: 'ToDelete',
      emoji: '🗑️',
      color: '#ff0000'
    })
  });
  const objectives = await createRes.json();
  const createdObj = objectives.find((o: any) => o.name === 'Test Soft Delete');
  
  if (!createdObj) {
    console.log('❌ Falló al crear el objetivo de prueba.');
    return;
  }
  
  console.log(`   ✅ Creado con ID: ${createdObj.id}`);
  
  // Delete it
  console.log(`2. Eliminando (Soft Delete) el objetivo con ID ${createdObj.id}...`);
  const deleteRes = await fetch(`${baseUrl}/${createdObj.id}`, {
    method: 'DELETE'
  });
  
  if (deleteRes.ok) {
    console.log('   ✅ Endpoint DELETE respondió OK.');
  } else {
    console.log(`   ❌ Error deleting: ${deleteRes.status}`);
  }
  
  // Verify it's gone from GET
  console.log('3. Verificando que ya no aparece en el GET listado normal...');
  const getRes = await fetch(baseUrl);
  const currentObjectives = await getRes.json();
  const found = currentObjectives.find((o: any) => o.id === createdObj.id);
  
  if (!found) {
    console.log('✅ Éxito: El objetivo ha sido descartado (soft delete) del listado.');
  } else {
    console.log('❌ Error: El objetivo sigue apareciendo. Falló el soft delete.');
  }
}

run();
