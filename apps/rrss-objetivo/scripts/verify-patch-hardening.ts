import fetch from 'node-fetch';

async function run() {
  console.log('--- TEST: PATCH Hardening ---');
  
  const baseUrl = 'http://localhost:3000/api/campaigns';
  
  // Create a dummy objective
  console.log('1. Creando campaña temporal para test...');
  const createRes = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'campaign',
      name: 'Test Patch Object',
      description: 'ToDelete',
      objective_id: 'some-id-we-dont-need-bc-we-just-need-an-id' 
      // Si la DB falla al crear pq el objective_id no existe, asumiremos q un ID valido de campaña es necesario.
      // Así que buscamos una existente.
    })
  });
  
  let campaignId = '';
  const listRes = await fetch(baseUrl);
  const data = await listRes.json();
  const someCampaign = data[0]?.campaigns?.[0]; // just grab any campaign
  
  if (someCampaign) {
    campaignId = someCampaign.id;
    console.log(`Usaremos la campaña existente ID: ${campaignId}`);
  } else {
    console.log('No hay campañas para probar. Crea una primero.');
    return;
  }
  
  console.log('2. Intentando inyectar un campo no permitido (created_at)...');
  const patchRes = await fetch(`${baseUrl}/${campaignId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'campaign',
      created_at: '2025-01-01T00:00:00Z',
      id: 'hacked-id'
    })
  });
  
  if (patchRes.status === 200 || patchRes.status === 201) {
    console.log('❌ Error crítico: El endpoint permitió la actualización de campos restringidos (O ignoro silenciosamente pero devolvió 200, verificar payload).');
  } else if (patchRes.status === 400 || patchRes.status === 403) {
    const errorJson = await patchRes.json();
    console.log(`✅ Éxito: La solicitud fue rechazada con status ${patchRes.status}`);
    console.log(`   Mensaje: ${errorJson.error || JSON.stringify(errorJson)}`);
  } else {
    console.log(`ℹ️ Status inesperado: ${patchRes.status}`);
  }
}

run();
