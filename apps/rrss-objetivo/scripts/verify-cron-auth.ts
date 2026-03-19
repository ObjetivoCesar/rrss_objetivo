import fetch from 'node-fetch';

async function run() {
  console.log('--- TEST: Cron Auth ---');
  
  const baseUrl = 'http://localhost:3000/api/cron/process';
  
  console.log('1. Intentando ejecutar sin Authorization header (debe fallar con 401)...');
  const resNoAuth = await fetch(baseUrl, { method: 'GET' });
  console.log(`Status: ${resNoAuth.status}`);
  if (resNoAuth.status === 401) {
    console.log('✅ Éxito: El endpoint está protegido.');
  } else {
    console.log('❌ Error: El endpoint debería devolver 401.');
  }

  // Si tenemos el token en env local, probaríamos con él, pero por ahora esto verifica que está protegido.
  console.log('\\nSi se provee Authorization: Bearer <CRON_SECRET>, devolverá 200.');
}

run();
