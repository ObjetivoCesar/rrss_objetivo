/**
 * Donna Reasoner Smoke Test
 * Hace POST a /api/chat con mensajes naturales y reporta qué skill detectó el backend.
 * Leer los logs del servidor para ver los detalles internos.
 */

const BASE_URL = 'http://localhost:3000';

const TEST_CASES = [
  {
    id: 1,
    label: 'Láminas LinkedIn → carousel-engine',
    expected_skill: 'carousel-engine',
    message: 'arma unas láminas para LinkedIn explicando qué es n8n y por qué las PYMEs lo necesitan',
  },
  {
    id: 2,
    label: 'Video canal → video-script-engine',
    expected_skill: 'video-script-engine',
    message: 'necesito un guion para mi canal de YouTube explicando el método de automatización que usamos con nuestros clientes',
  },
  {
    id: 3,
    label: 'Texto rígido → humanizer',
    expected_skill: 'humanizer',
    message: 'quiero que ese texto suene más como yo, está muy rígido y genérico, no parece que lo escribí yo',
  },
  {
    id: 4,
    label: 'Rankear Google → seo-master',
    expected_skill: 'seo-master',
    message: 'quiero que Google me empiece a mostrar cuando alguien busca automatización para pymes en Ecuador',
  },
  {
    id: 5,
    label: 'Portada carrusel → visual-slides-pro',
    expected_skill: 'visual-slides-pro',
    message: 'crea el mockup de la primera lámina del carrusel de ActivaQR para Instagram, fondo oscuro y colores de marca',
  },
  {
    id: 6,
    label: 'Retrospectiva → revision-dominical',
    expected_skill: 'revision-dominical',
    message: 'hagamos una retrospectiva rápida, qué contenido tenemos mal planteado y qué deberíamos depurar del sistema',
  },
  {
    id: 7,
    label: 'Idea webinar → donna-memory',
    expected_skill: 'donna-memory',
    message: 'anota esto en la bóveda: quiero organizar un webinar en mayo sobre IA para PYMEs, sin precio definido todavía',
  },
  {
    id: 8,
    label: 'Posicionamiento marca → posicionamiento-marca (siempre en DNA)',
    expected_skill: 'posicionamiento-marca',
    message: '¿cómo queda nuestro posicionamiento frente a los coaches de productividad que también hablan de IA?',
  },
  {
    id: 9,
    label: 'Despedida → FAREWELL / save_session (Antigravity)',
    expected_skill: 'FAREWELL',
    message: 'cerremos la sesión y guarda todo lo que hicimos hoy',
  },
];

async function runTest(tc) {
  const startTime = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: tc.message }],
        provider: 'gemini',
      }),
    });

    const elapsed = Date.now() - startTime;
    const body = await res.json();

    const status = res.status === 200 ? '✅' : '❌';
    const hasText = body?.text ? '📝 tiene_respuesta' : '⚠️  sin_texto';
    const hasError = body?.error ? `ERROR: ${body.error.substring(0, 80)}` : '';

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Test #${tc.id}: ${tc.label}`);
    console.log(`  HTTP: ${status} ${res.status} (${elapsed}ms)`);
    console.log(`  Esperado: "${tc.expected_skill}"`);
    console.log(`  Resp: ${hasText} ${hasError}`);
    if (body?.text) {
      console.log(`  Preview: "${body.text.substring(0, 120).replace(/\n/g, ' ')}..."`);
    }
    if (body?.uiAction) {
      console.log(`  UI Action: ${JSON.stringify(body.uiAction).substring(0, 100)}`);
    }
  } catch (err) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Test #${tc.id}: ${tc.label}`);
    console.log(`  ❌ FETCH ERROR: ${err.message}`);
  }
}

async function main() {
  console.log('🧪 DONNA REASONER SMOKE TEST — Iniciando...');
  console.log(`📡 Servidor: ${BASE_URL}`);
  console.log(`📋 Tests a ejecutar: ${TEST_CASES.length}`);
  console.log('\n⚠️  IMPORTANTE: Observa los logs del servidor (terminal npm run dev)');
  console.log('    Busca: [Donna Reasoner] Plan JSON detectado: {...}');
  console.log('    Busca: [Donna Intent] Cargando Skill Dinámica: X');
  console.log('    Busca: [Antigravity] 👋 Despedida detectada...\n');

  // Ejecutar tests SECUENCIALMENTE para poder leer los logs en orden
  for (const tc of TEST_CASES) {
    await runTest(tc);
    // Pausa entre requests para no saturar el servidor y poder leer logs claramente
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\n\n✅ Smoke test completado. Revisa los logs del servidor para ver qué skill detectó Donna en cada mensaje.');
  console.log('Si "detected_skill" no aparece en algún test, el Reasoner no lo detectó y cayó al fallback de keywords.');
}

main().catch(console.error);
