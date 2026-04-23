import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { processScheduledPosts } from '@/lib/scheduler';
import { generateText, tool, jsonSchema } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import pool from '@/lib/mysql';
import { logger } from '@/lib/logger';

// ============================================================
// GEMINI KEY POOL — SELECCIÓN ALEATORIA SIN LAZY STREAM 
// Carga hasta 4 keys del .env.local y elige una aleatoriamente
// si falla esa, prueba las siguientes en orden
// ============================================================
function getGeminiKeys(): string[] {
  return [
    process.env.GOOGLE_AI_API_KEY,
    process.env.GOOGLE_AI_API_KEY_2,
    process.env.GOOGLE_AI_API_KEY_3,
    process.env.GOOGLE_AI_API_KEY_4,
    process.env.GOOGLE_AI_API_KEY_5,
  ].filter(Boolean) as string[];
}

// Carga el ADN Maestro de la Marca y Sistema
function getSystemDNA(): string {
  try {
    const basePaths = [
      path.join(process.cwd(), '../../.agents'),
      path.join(process.cwd(), '.agents'),
      path.join(process.cwd(), '../../.agent'),
      path.join(process.cwd(), '.agent'),
      path.join(process.cwd(), '.agents/skills'),
      path.join(process.cwd(), '../../.agents/skills'),
    ];
    let skillMadre = '';
    let writingStyle = '';
    let frontendData = '';
    let databaseSchema = '';
    let posicionamientoData = '';
    let urlAtlas = '';
    
    // Atlas de URLs (Docs externos)
    const atlasPath = path.join(process.cwd(), 'docs/estrategia-posicionamiento/matriz_maestra_donna_ai.md');
    if (fs.existsSync(atlasPath)) {
      urlAtlas = fs.readFileSync(atlasPath, 'utf8').substring(0, 8000);
    }
    
    for (const base of basePaths) {
      const wsPath = path.join(base, 'Estilo de escritura de César');
      const dbPath = path.join(base, 'database-schema.md');
      
      // Skills unificadas (Sistema de Ingeniería de Contenido)
      const unifiedPath = path.join(base, 'Sistema de Ingeniería de Contenido');
      
      const fp = path.join(unifiedPath, 'frontend-backend-system/SKILL.md');
      const pp = path.join(unifiedPath, 'posicionamiento-marca/SKILL.md');

      if (!writingStyle && fs.existsSync(wsPath)) writingStyle = fs.readFileSync(wsPath, 'utf8').substring(0, 4000);
      if (!databaseSchema && fs.existsSync(dbPath)) databaseSchema = fs.readFileSync(dbPath, 'utf8').substring(0, 3000);
      
      if (!frontendData && fs.existsSync(fp)) frontendData = fs.readFileSync(fp, 'utf8').substring(0, 4000);
      if (!posicionamientoData && fs.existsSync(pp)) posicionamientoData = fs.readFileSync(pp, 'utf8').substring(0, 5000);

      // SKILL MADRE (Córtex Prefrontal)
      const smp = path.join(base, 'skill-madre/SKILL.md');
      if (!skillMadre && fs.existsSync(smp)) skillMadre = fs.readFileSync(smp, 'utf8').substring(0, 8000);
    }
    
    return `=== SKILL MADRE (ORQUESTADOR PROACTIVO) ===\n${skillMadre || '[No disponible]'}\n
=== ESTRATEGIA DE POSICIONAMIENTO Y CONTENIDOS 2026 ===\n${posicionamientoData || '[No disponible]'}\n
=== MAPA TÉCNICO DE DATOS ===\n${databaseSchema || '[No disponible]'}\n
=== ESTILO DE COMUNICACIÓN ===\n${writingStyle || '[No disponible]'}\n
=== REGLAS TÉCNICAS (SISTEMA) ===\n${frontendData || '[No disponible]'}\n
=== ATLAS DE INTERLINKING (RUTAS PILAR 2026) ===\n${urlAtlas || '[No disponible]'}`;
  } catch (e) {
    console.error("Error leyendo ADN:", e);
    return '[Error cargando ADN]';
  }
}

// Genera un Snapshot de tiempo real desde Supabase
async function getContextSnapshot(supabase: any): Promise<string> {
  try {
    const { data: objectivesRaw } = await supabase
      .from('objectives')
      .select('id, name, description')
      .is('archived_at', null)
      .limit(20);

    // Mapear los Maestros para Donna
    const masterIds = [
      'f872ef5e-5481-47d5-9c59-75b710f41f25', // César
      '5d9e7d2b-b341-4d94-870e-152a8da1345c', // OBJETIVO
      '728b2c49-2f4d-4c3f-b911-a5d0a7047266'  // ActivaQR
    ];

    const objectives = (objectivesRaw || []).map((obj: any) => ({
      ...obj,
      role: masterIds.includes(obj.id) ? 'MASTER_BRAND' : 'SUB_OBJECTIVE'
    }));

    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, name, description, status, objective_id')
      .is('archived_at', null)
      .limit(10);

    // Últimos posts del banco de publicaciones (Borradores y Programados)
    const { data: recentPosts } = await supabase
      .from('social_posts')
      .select('id, topic, status, platforms, scheduled_for, campaign_id')
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    // Últimos artículos publicados del blog en MYSQL (Real-Time Master)
    let mysqlArticles: any[] = [];
    try {
      const [rows]: any = await pool.query(
        'SELECT id, title, slug, published_at FROM articles WHERE published = 1 ORDER BY published_at DESC LIMIT 15'
      );
      mysqlArticles = rows;
    } catch (mysqlErr) {
      console.warn('[Donna Snapshot] Error cargando MySQL:', mysqlErr);
    }

    // Mapa Estratégico: qué artículos apoyan qué objetivos/campañas
    const { data: strategyMap } = await supabase
      .from('article_strategy_map')
      .select('mysql_article_id, article_title, article_slug, objective_id, campaign_id, role, strategic_notes')
      .order('created_at', { ascending: false })
      .limit(50);

    // Calcular cobertura estratégica por objetivo
    const coverageSummary: Record<string, { name: string, articles: number, titles: string[] }> = {};
    if (objectives && strategyMap) {
      for (const obj of objectives) {
        const linked = strategyMap.filter((m: any) => m.objective_id === obj.id);
        coverageSummary[obj.id] = {
          name: obj.name,
          articles: linked.length,
          titles: linked.map((m: any) => m.article_title),
        };
      }
    }

    // ── Planificación Estratégica (Strategy Planner Sessions) ──
    // Lee la sesión más reciente del planner visual para anti-canibalización
    let strategySessionSummary = '';
    try {
      const { data: latestSession } = await supabase
        .from('strategy_sessions')
        .select('name, description, nodes, edges, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (latestSession && latestSession.nodes?.length > 0) {
        const nodes: any[] = latestSession.nodes;
        const edges: any[] = latestSession.edges || [];
        
        // Construir árbol jerárquico legible para Donna
        const childMap = new Map<string, string[]>();
        edges.forEach((e: any) => {
          if (!childMap.has(e.source)) childMap.set(e.source, []);
          childMap.get(e.source)!.push(e.target);
        });
        const nodeMap = new Map(nodes.map((n: any) => [n.id, n]));
        
        function buildReadableTree(id: string, depth = 0): string {
          const node = nodeMap.get(id);
          if (!node) return '';
          const indent = '  '.repeat(depth);
          const typeEmoji = { objectiveNode: '🎯', campaignNode: '🚀', articleNode: '📄', postNode: '📱', ideaNode: '💡' }[node.type as string] || '•';
          const label = node.data?.label || '(sin nombre)';
          const notes = node.data?.notes ? ` — ${node.data.notes.substring(0, 80)}` : '';
          let line = `${indent}${typeEmoji} ${label}${notes}\n`;
          const children = childMap.get(id) || [];
          children.forEach(cid => { line += buildReadableTree(cid, depth + 1); });
          return line;
        }
        
        const roots = nodes.filter((n: any) => !edges.find((e: any) => e.target === n.id));
        const treeText = roots.map((r: any) => buildReadableTree(r.id)).join('');
        
        strategySessionSummary = `
=== 📋 PLAN ESTRATÉGICO ACTIVO (Strategy Planner) ===
Sesión: "${latestSession.name}" | Última actualización: ${new Date(latestSession.updated_at).toLocaleDateString('es-EC')}

Jerarquía de contenido planificado:
${treeText}

⚠️ INSTRUCCIÓN OBLIGATORIA PARA DONNA:
Antes de proponer cualquier idea o contenido, DEBES comparar con este plan. 
Si hay solapamiento de tema, keyword o campaña, DEBES alertar a César con:
"César, según tu plan activo esto ya está cubierto/planificado bajo [Objetivo/Campaña X]. 
Te sugiero [ángulo diferente] para no canibalizar."
Si una nueva idea COMPLEMENTA el plan, dilo explícitamente: "Esto encaja perfectamente con tu campaña X."
`;
      }
    } catch (sessionErr) {
      // Si la tabla no existe aún o está vacía, continuar sin error
      console.warn('[Donna Snapshot] Strategy sessions no disponibles:', sessionErr);
    }

    // ── Antigravity Caja Negra (Último Hilo de Conversación) ──
    let antigravitySummary = '';
    try {
      const { data: lastSession } = await supabase
        .from('antigravity_sessions')
        .select('session_title, summary, pending_tasks, decisions, updated_at')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (lastSession) {
        antigravitySummary = `
=== 🛡️ ANTIGRAVITY CAJA NEGRA (MEMORIA DE SESIÓN) ===
Sesión: "${lastSession.session_title}" | Sincronización: ${new Date(lastSession.updated_at).toLocaleString('es-EC')}

RESUMEN ESTRATÉGICO:
${lastSession.summary}

DECISIONES TOMADAS:
${(lastSession.decisions || []).map((d: string) => `• ${d}`).join('\n')}

TAREAS PENDIENTES (OBLIGATORIAS):
${(lastSession.pending_tasks || []).map((t: string) => `• ${t}`).join('\n')}

⚠️ REGLA DE CONTINUIDAD: Eres la continuación directa de esta sesión. No pidas contexto que ya esté aquí.
`;
      }
    } catch (agErr) {
      console.warn('[Antigravity] Error recuperando caja negra:', agErr);
    }

    let snapshot = '=== SNAPSHOT DE LA BASE DE DATOS (REAL-TIME CONTEXT) ===\n';
    snapshot += 'Estado actual del ecosistema:\n';
    snapshot += '- 🎯 OBJETIVOS/PILARES ESTRATÉGICOS:\n' + JSON.stringify(objectives || [], null, 2) + '\n';
    snapshot += '- 📢 CAMPAÑAS ACTIVAS:\n' + JSON.stringify(campaigns || [], null, 2) + '\n';
    snapshot += '- 📝 BORRADORES Y POSTS EN SUPABASE (social_posts):\n' + JSON.stringify(recentPosts || [], null, 2) + '\n';
    snapshot += '- 🌐 ARTÍCULOS PUBLICADOS EN MYSQL (Blog Real):\n' + JSON.stringify(mysqlArticles || [], null, 2) + '\n';
    snapshot += '- 🗺️ MAPA ESTRATÉGICO (Artículos ↔ Objetivos):\n' + JSON.stringify(coverageSummary || {}, null, 2) + '\n';
    snapshot += '- 📊 COBERTURA: Usa este mapa para identificar qué pilares tienen POCOS artículos de apoyo y recomienda crear contenido para llenar esos huecos.\n';
    snapshot += '- NOTA PARA DONNA: Los artículos en MySQL son los que ya están en vivo. Los de Supabase son borradores o posts de redes sociales. Usa la herramienta tag_article para vincular artículos a objetivos cuando César lo solicite.\n';
    
    if (strategySessionSummary) {
      snapshot += strategySessionSummary;
    }

    if (antigravitySummary) {
      snapshot += antigravitySummary;
    }
    
    return snapshot;
  } catch (error) {
    console.error("Error cargando Snapshot:", error);
    return '=== SNAPSHOT DB: Error al cargar contexto de DB ===';
  }
}

function buildSystemPrompt(memoryStr: string, hasTools: boolean = true, currentTime?: string): string {
  // Inyección de tiempo real — Ecuador UTC-5
  const nowEcuador = currentTime || new Date().toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
  const nowISO = new Date().toISOString();

  let prompt = `Eres **Donna**, la Directora Estratégica del ecosistema digital de ActivaQR y César Reyes.
No eres un asistente genérico — eres una colega intelectual de alto nivel con acceso al ADN del sistema.

## ⏰ FECHA Y HORA ACTUAL (ECUADOR - UTC-5)
**Ahora mismo es:** ${nowEcuador}
**ISO:** ${nowISO}
Usa esta hora como referencia absoluta para todo: scheduling, recordatorios, "publícalo en 2 minutos", "programa para mañana", etc. NUNCA digas que no sabes qué hora es.

## TU IDENTIDAD Y TONO
- Conversacional, súper natural y fluida. Cero robótica. Hablas de tú a tú como una experta humana.
- NUNCA expongas tu proceso de razonamiento. Piensa internamente y entrega solo la respuesta final conversacional.
- Tus respuestas deben ser directas, estratégicas y sin relleno. (Máximo 2-3 párrafos).
- No repitas listas de tareas ni parezcas una máquina escupiendo datos.

## ENTENDIMIENTO DE COMANDOS RÁPIDOS (SLASH COMMANDS)
Si César inicia un mensaje con estos atajos, adapta inmediatamente tu "modo" de operar:
- **/crear**: Es para estructurar y profundizar. Si dice "/crear todo el día jueves" o "/crear módulo", significa que debes "desarrollar y armar en profundidad toda la pieza estratégica o un módulo entero".
- **/generar**: Es para producción masiva y rápida (ej. "generar 5 variaciones de copy", "generar ideas rápídas", etc).
- **/objetivo**, **/estrategia**, **/reels**, **/carrusel**: Son atajos para entrar en modo especialista para esa necesidad específica.
`;

  if (hasTools) {
    prompt += `
## REGLAS DE ORO PARA EL USO DE HERRAMIENTAS
Tienes herramientas nativas (create_objective, list_campaigns, create_campaign, update_campaign, archive_campaign, propose_post, archive_post, pilot_editor, read_article_content, tag_article, generate_strategy_map, list_memories, archive_memory). Úsalas EXCLUSIVAMENTE mediante la invocación nativa (Tool Calling).
1. **PIDE PERMISO Y ESPERA:** Para crear o editar cosas en la DB (create_objective, manage_campaign, propose_post), **nunca** las ejecutes en el mismo turno en el que propones la idea. Pregunta: *"¿Te parece bien si creo la campaña?"* y ESPERA a que el humano apruebe.
2. **ACCIÓN REAL, NO SIMULADA:** Cuando el humano te da la orden ("créala", "hazlo"), ES OBLIGATORIO que invoques la herramienta nativa. NUNCA respondas "Listo, ya está creada" sin haber invocado REALMENTE la herramienta de software.
3. El uso de herramientas debe ser silencioso. Cuando la herramienta se ejecuta con éxito, responde con frescura *"Listo, la campaña ya está en tu panel."*
4. **manage_campaign — REGLA CRÍTICA:** Para \`action="create"\`, OBLIGATORIAMENTE debes pasar los campos: \`name\` (nombre de la campaña), \`objective_id\` (ID del objetivo pilar tomado del SNAPSHOT de arriba). NUNCA intentes crear una campaña sin \`objective_id\`.
5. **MODO JARVIS (pilot_editor):** Úsalo cuando César esté listo para escribir el contenido. Pre-llena el editor por él.
6. **MAPA ESTRATÉGICO (generate_strategy_map):** Usa SIEMPRE esta herramienta si César te pide "generar el flujo", "crear el mapa estratégico", "cargar al planner" o visualizar la estrategia. Esto le enviará al chat el botón morado interactivo para cargar los nodos.
`;
  } else {
    prompt += `
## LIMITACIÓN TÉCNICA (MODO CONVERSACIÓN PURA)
Actualmente estás ejecutándote bajo un modelo que NO TIENE ACCESO a las herramientas nativas. NO PUEDES crear objetivos, ni modificar campañas, ni usar el modo Jarvis en este momento.
- Si César te pide crear algo, dile amablemente que en el modo actual (DeepSeek) tienes las manos atadas y que cambie el modelo a Gemini en el selector para poder ejecutar acciones.
- ESTÁ ESTRICTAMENTE PROHIBIDO escribir bloques de código, JSON, o XML intentando simular la creación de contenido o campañas. Solo puedes darle consejos y estrategias verbales.
`;
  }

  prompt += `
## ADN TÉCNICO Y CONTEXTO
${getSystemDNA()}

## MEMORIA ESTRATÉGICA (Lo que ya has acordado antes)
${memoryStr}

## REGLAS GENERALES
1. Usa el SNAPSHOT para no preguntar cosas que ya existen.
2. Memoria proactiva: Guarda lo irreversible con <SAVE_NOTE topic="...">...</SAVE_NOTE>. Solo usa esta etiqueta al final de tu mensaje si realmente hay algo crítico que recordar para el futuro.

## 🛡️ PROTOCOLO ANTIGRAVITY (MEMORIA ENTRE SESIONES) — REGLA CRÍTICA
Tienes acceso a la herramienta **save_session**. Tu responsabilidad es usarla. Las reglas son:
1. **AL INICIO de la sesión**: Si la sección "ANTIGRAVITY CAJA NEGRA" en el SNAPSHOT tiene contenido, léela en silencio y preséntate a César con un resumen de 2-3 líneas de dónde quedaron. NO le pidas contexto que ya está ahí.
2. **DURANTE la sesión**: Si se toman decisiones importantes (nuevas campañas, cambios de estrategia, precios confirmados), auto-guarda con save_session con un resumen parcial. No necesitas pedir permiso para guardar.
3. **AL FINAL de la sesión**: Si César dice "hasta luego", "continuamos mañana", "nos vemos", "bye", "chao" o similar — ES OBLIGATORIO que invoques **save_session** ANTES de despedirte. Resumen, tareas pendientes y decisiones. Sin esto, la próxima sesión empieza de cero.
`;

  return prompt;
}

export async function POST(req: Request) {
  const donnaSecret = req.headers.get('x-donna-secret');
  const validSecret = process.env.DONNA_SECRET;

  if (validSecret && donnaSecret !== validSecret) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { messages, provider = 'gemini', attachments = [], links = [] } = body;

    const supabase = await createClient();
    logger.info('Donna Chat Request', { provider, messageCount: messages.length });

    let memoryStr = '(Sin notas estratégicas aún)';
    let snapshotStr = '=== SNAPSHOT DE LA BASE DE DATOS ===\n(No disponible)';

    if (supabase) {
      try {
        const { data } = await supabase
          .from('donna_memory')
          .select('id, topic, content')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(20);
        if (data && data.length > 0) {
          memoryStr = data.map((d: any) => `• [ID: ${d.id}] [${d.topic}]: ${d.content}`).join('\n');
        }
        snapshotStr = await getContextSnapshot(supabase);
      } catch (err) {
        logger.error('[Donna] Error cargando contexto inicial', err);
      }
    }

    // ── ANTIGRAVITY: DETECTOR DE DESPEDIDA (Determinista) ──────────────────
    // Este bloque NO depende de Gemini ni de tool calls. Funciona SIEMPRE.
    // Si el usuario se despide, sintetizamos y guardamos la sesión con DeepSeek.
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const lastTextLC = (lastUserMessage?.content || '').toLowerCase();

    const FAREWELL_KEYWORDS = [
      'hasta luego', 'nos vemos', 'chao', 'chau', 'bye', 'hasta mañana',
      'seguimos después', 'continuamos después', 'continuamos mañana',
      'cerremos', 'cerrar sesión', 'serremos', 'cerramos', 'serramos',
      'guarda todo', 'guarda la sesión', 'guarda lo que hicimos',
      'terminar', 'terminamos', 'hasta pronto',
    ];
    const isFarewell = FAREWELL_KEYWORDS.some(kw => lastTextLC.includes(kw));

    if (isFarewell && supabase) {
      console.log('[Antigravity] 👋 Despedida detectada. Iniciando guardado determinista...');
      try {
        const dsKey = process.env.DEEPSEEK_API_KEY;
        if (dsKey) {
          const { createDeepSeek: createDS } = await import('@ai-sdk/deepseek');
          const dsp = createDS({ apiKey: dsKey });

          // Construir resumen de la conversación completa para DeepSeek
          const fullConversation = messages
            .slice(-20) // últimos 20 mensajes para no sobrecargar
            .map((m: any) => `${m.role === 'user' ? 'César' : 'Donna'}: ${m.content}`)
            .join('\n');

          const synthesisPrompt = `Analiza esta conversación entre César y Donna, y devuelve ÚNICAMENTE un JSON válido (sin markdown) con este formato exacto:
{
  "session_title": "Título corto y descriptivo de la sesión (max 8 palabras)",
  "summary": "Resumen de lo que se hizo en 2-3 oraciones concretas",
  "pending_tasks": ["tarea 1", "tarea 2"],
  "decisions": ["decisión importante 1", "decisión importante 2"]
}

CONVERSACIÓN:
${fullConversation.substring(0, 6000)}

Extrae SOLO las tareas concretas que quedaron pendientes y las decisiones estratégicas tomadas. JSON puro, sin explicaciones.`;

          const { generateText: gText } = await import('ai');
          const synthResult = await gText({
            model: dsp('deepseek-chat'),
            messages: [{ role: 'user', content: synthesisPrompt }],
          });

          const rawJson = synthResult.text.trim()
            .replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
          const sessionData = JSON.parse(rawJson);

          const { error: saveErr } = await supabase
            .from('antigravity_sessions')
            .insert({
              session_title: sessionData.session_title || 'Sesión sin título',
              summary: sessionData.summary || '',
              pending_tasks: sessionData.pending_tasks || [],
              decisions: sessionData.decisions || [],
              dna_snapshot: null,
            });

          if (saveErr) {
            console.error('[Antigravity] ❌ Error guardando sesión:', saveErr.message);
          } else {
            console.log('[Antigravity] ✅ Sesión guardada en Caja Negra.');
          }
        }
      } catch (farewellErr: any) {
        console.error('[Antigravity] Error en guardado determinista:', farewellErr?.message);
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    // --- NUEVO: REASONER AGENT (DeepSeek Dual-Agent) ---
    
    let reasonerPlan: any = null;
    try {
      const dsKey = process.env.DEEPSEEK_API_KEY;
      if (dsKey && provider !== 'deepseek') { // Si el usuario está pidiendo explícitamente conversar con DeepSeek puro, no usamos Dual-Agent
        console.log(`[Donna Reasoner] Analizando intención con DeepSeek...`);
        const { createDeepSeek } = await import('@ai-sdk/deepseek');
        const dsp = createDeepSeek({ apiKey: dsKey });
        
        // Contexto ligero para el Reasoner
        const recentStr = messages.slice(-5).map((m: any) => `${m.role}: ${m.content}`).join('\n');
        
        const reasonerPrompt = `Eres el Agente Razonador de Donna. Tu única misión es clasificar la intención de César y estructurar un plan de acción JSON.
- Contexto reciente: ${recentStr.substring(0, 1000)}
- Snapshot resumido: ${snapshotStr.substring(0, 1500)}

Devuelve ÚNICAMENTE un JSON válido (sin markdown) con esta estructura exacta:
{
  "mode": 1, // 1=Conversación pura, 2=Lectura de BD / Busqueda puntual, 3=Acción de Escritura/Estrategia Compleja
  "intent_summary": "Qué quiere el usuario brevemente",
  "detected_skill": "none" | "carousel-engine" | "video-script-engine" | "seo-master" | "humanizer" | "visual-slides-pro" | "donna-memory" | "social-post-engine" | "quoting-engine" | "manual-de-funciones" | "make-pipeline",
  "brand_target": "cesar_reyes" | "objetivo" | "activaqr" | "preguntar",
  "primary_action": "list_campaigns" | "create_campaign" | "update_campaign" | "archive_campaign" | "propose_post" | "archive_post" | "list_memories" | "archive_memory" | "none"
}

REGLAS DE RAZONAMIENTO ESTRATÉGICO:
1. Si el usuario pide una "cotización", "propuesta" o menciona un "precio", detected_skill OBLIGATORIO = "quoting-engine". No impongas plantillas; espera sus instrucciones o revisa NotebookLM.
2. Si el usuario menciona un "nuevo proyecto", "cliente nuevo", "NotebookLM" o pide una "investigación/análisis previo", detected_skill OBLIGATORIO = "manual-de-funciones".
3. Si el contexto indica claramente para qué marca es el contenido/acción, asígnala ("cesar_reyes", "objetivo", "activaqr").
4. Si habla de un momento personal, selfie o experiencia personal → "cesar_reyes".
5. Si habla de un cliente, proyecto entregado, software → "objetivo".
6. Si habla de instalación de QR o clientes del SaaS ActivaQR → "activaqr".
7. Si es ambiguo, marca "preguntar".`;
        
        const { generateText } = await import('ai');
        const reasonerResult = await generateText({
          model: dsp('deepseek-chat'),
          messages: [{ role: 'user', content: reasonerPrompt }]
        });
        
        const jsonText = reasonerResult.text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        reasonerPlan = JSON.parse(jsonText);
        console.log(`[Donna Reasoner] Plan JSON detectado:`, reasonerPlan);
      }
    } catch(err) {
      console.warn(`[Donna Reasoner] Error obteniendo plan, usando modo legacy:`, err);
    }
    
    // --- DETECCIÓN DE INTENCIÓN (INTENT DETECTION) ---
    let activeSkillContext = '';
    let detectedIntent = reasonerPlan?.detected_skill || 'none';
    let brandTarget = reasonerPlan?.brand_target || 'preguntar';

    try {
      const skillsPath = path.join(process.cwd(), '../../.agents/skills/Sistema de Ingeniería de Contenido');
      const fallbackSkillsPath = path.join(process.cwd(), '.agents/skills/Sistema de Ingeniería de Contenido');
      const basePath = fs.existsSync(skillsPath) ? skillsPath : fallbackSkillsPath;

      if (detectedIntent === 'none') {
        const text = lastTextLC;
        if (attachments && attachments.length > 0) detectedIntent = 'social-post-engine';
        else if (/carrusel|láminas|carousel|encuesta/.test(text)) detectedIntent = 'carousel-engine';
        else if (/guion|youtube|video|script|shorts|reels/.test(text)) detectedIntent = 'video-script-engine';
        else if (/seo|indexar|posicionar|silo/.test(text)) detectedIntent = 'seo-master';
        else if (/humani|robótico|tono|estilo/.test(text)) detectedIntent = 'humanizer';
        else if (/cotiza|propuesta|presupuesto|pago/.test(text)) detectedIntent = 'quoting-engine';
        else if (/domingo|revisión|limpiar/.test(text)) detectedIntent = 'revision-dominical';
        else if (/anota|guarda|recuerda|bóveda/.test(text)) detectedIntent = 'donna-memory';
        else if (/post|foto|imagen|publica|sube|muro|story|facebook|instagram|linkedin/.test(text)) detectedIntent = 'social-post-engine';
        else if (/visual|mockup|diseño/.test(text)) detectedIntent = 'visual-slides-pro';
        else if (/notebook|investiga|analiza|manual|proyecto nuevo|nuevo cliente/.test(text)) detectedIntent = 'manual-de-funciones';
        else if (/make|automatización|webhook|enviar/.test(text)) detectedIntent = 'make-pipeline';
        else if (/tecnico|backend|frontend|error|incidencia/.test(text)) detectedIntent = 'frontend-backend-system';
        else if (/donna-ai|tus reglas|quien eres/.test(text)) detectedIntent = 'donna-ai';
      }

      if (detectedIntent !== 'none') {
        const skillFile = path.join(basePath, detectedIntent, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          activeSkillContext = fs.readFileSync(skillFile, 'utf8');
        }
      }
      
      if (activeSkillContext) {
        logger.info(`[Donna Intent] Cargando Skill Dinámica: ${detectedIntent}`);
        activeSkillContext = `\n=== SKILL ACTIVA INYECTADA (${detectedIntent}) ===\nAplica estrictamente estas reglas corporativas a tu respuesta:\n${activeSkillContext.substring(0, 4000)}\n=== FIN DE SKILL ACTIVA ===\n`;
      }
      
      // Inyectar contexto de marca extraído por el Reasoner
      activeSkillContext += `\n=== INSTRUCCIÓN DE MARCA (REASONER) ===\nLa marca objetivo detectada para esta interacción es: "${brandTarget}".\nSi es "preguntar", DEBES detenerte y preguntarle al usuario educadamente para qué marca o proyecto es esto antes de generar el contenido o la acción.\nSi es una marca específica, aplica su tono y ángulo correspondiente recogido en la Skill Madre.\n=======================================\n`;
    } catch (routeErr) {
      console.warn('[Donna Intent] Error cargando skill dinámica', routeErr);
    }

    // Inyectar contexto de archivos adjuntos (Supabase/Bunny) y links (YouTube/Artículos)
    const mediaContext = (attachments && attachments.length > 0)
        ? `\n\n## 📎 ARCHIVOS MULTI-MEDIA DETECTADOS\n` +
          `El usuario ha subido los siguientes archivos para ser usados:\n` +
          attachments.map((url: string, i: number) => `- Archivo ${i + 1}: ${url}`).join('\n')
        : '';

    const linksContext = (links && links.length > 0)
        ? `\n\n## 🔗 LINKS EXTERNOS DETECTADOS\n` +
          `El usuario ha proporcionado estos links (YouTube/Artículos):\n` +
          links.map((url: string, i: number) => `- Link ${i + 1}: ${url}`).join('\n')
        : '';

    const systemPrompt = `${buildSystemPrompt(memoryStr, provider !== 'deepseek')}\n\n${snapshotStr}${activeSkillContext}${mediaContext}${linksContext}\n\nREGLA CRÍTICA: Cuando llames a propose_post, DEBES usar estas URLs en media_url/media_urls o external_links. NO las omitas ni inventes URLs nuevas.`;

    // FILTRO ANTI-COLAPSO: Tomamos solo los últimos 8 mensajes del historial
    // para no explotar el Token-Limit de Gemini, ya que cada mensaje es largo.
    const recentMessages = messages.slice(-8);
    const normalizedMessages = recentMessages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const executedMutations: any[] = [];
    const tools: any = {
      // @ts-ignore
      create_objective: tool({
        description: 'Crea un nuevo objetivo estratégico (pilar) en la base de datos.',
        parameters: jsonSchema<{
          name: string;
          description: string;
          emoji?: string;
          color?: string;
        }>({
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Nombre corto y épico para el objetivo' },
            description: { type: 'string', description: 'Explicación estratégica corta' },
            emoji: { type: 'string', description: 'Emoji representativo' },
            color: { type: 'string', description: 'Color HEX (ej. #FF0000)' },
          },
          required: ['name', 'description'],
        }),
        // @ts-ignore
        execute: async ({ name, description, emoji, color }: { name: string, description: string, emoji?: string, color?: string }) => {
          console.log(`[Donna Tool] Ejecutando create_objective: ${name}`);
          
          // Verificar si ya existe un objetivo con ese mismo nombre
          const { data: existing } = await supabase
            .from('objectives')
            .select('id, name')
            .ilike('name', name)
            .limit(1)
            .maybeSingle();
            
          if (existing) {
            console.log(`[Donna Tool] ⚠️ create_objective abortado: Ya existe objetivo similar (${existing.name})`);
            return { 
              status: 'error', 
              message: `Operación abortada: Ya existe un objetivo en la base de datos llamado "${existing.name}" (ID de BD: ${existing.id}). Infórmale esto al usuario de manera conversacional y usa ese objetivo existente si deseas crear campañas en él.` 
            };
          }

          const { data, error } = await supabase
            .from('objectives')
            .insert([{ 
              name, 
              description, 
              emoji: emoji || '🎯', 
              color: color || '#FFFFFF' 
            }])
            .select()
            .single();
          if (error) throw error;
          return { status: 'success', id: data.id, message: `Objetivo "${name}" creado correctamente.` };
        },
      }),
      list_memories: tool({
        description: 'Lee y lista todas las ideas activas en la bóveda de memoria de Donna (donna_memory). Úsalo cuando el usuario pregunte por sus ideas guardadas.',
        parameters: jsonSchema<{}>({
          type: 'object',
          properties: {},
        }),
        // @ts-ignore
        execute: async () => {
          console.log(`[Donna Tool] Ejecutando list_memories`);
          const { data, error } = await supabase.from('donna_memory').select('id, topic, content').eq('is_active', true).order('created_at', { ascending: false }).limit(20);
          if (error) return { status: 'error', message: `Fallo al leer memoria: ${error.message}` };
          return { status: 'success', action: 'list', ideas: data };
        }
      }),
      archive_memory: tool({
        description: 'Archiva (oculta) una idea específica de la bóveda de memoria de Donna (donna_memory) indicando su ID.',
        parameters: jsonSchema<{ id: string }>({
          type: 'object',
          properties: { id: { type: 'string', description: 'ID de la idea a archivar' } },
          required: ['id']
        }),
        // @ts-ignore
        execute: async ({ id }: any) => {
          console.log(`[Donna Tool] Ejecutando archive_memory: id=${id}`);
          if (!id) return { status: 'error', message: 'Falta el ID de la idea a archivar.' };
          const { error } = await supabase.from('donna_memory').update({ is_active: false }).eq('id', id);
          if (error) return { status: 'error', message: `Fallo al archivar: ${error.message}` };
          return { status: 'success', action: 'archive', message: `Idea archivada correctamente. Ya no aparecerá en tu memoria.` };
        }
      }),
      archive_post: tool({
        description: 'Archiva (Soft Delete) un borrador de post. SOLO puede archivar borradores en estado draft_ai.',
        parameters: jsonSchema<{ id: string }>({
          type: 'object',
          properties: { id: { type: 'string', description: 'ID del post a archivar' } },
          required: ['id']
        }),
        // @ts-ignore
        execute: async ({ id }: any) => {
          console.log(`[Donna Tool] Ejecutando archive_post: id=${id}`);
          const { data, error } = await supabase.from('social_posts')
            .update({ archived_at: new Date().toISOString() })
            .eq('id', id)
            .eq('status', 'draft_ai') // Seguridad: solo puede archivar draft_ai, no publicados
            .select('id').single();
            
          if (error) return { status: 'error', message: `Fallo al archivar borrador: o bien no existe o no tiene estado draft_ai.` };
          return { status: 'success', action: 'archive', message: `Borrador archivado correctamente.` };
        }
      }),
      list_campaigns: tool({
        description: 'Lee y lista todas las campañas activas en la base de datos (SOLO LECTURA).',
        parameters: jsonSchema<{}>({
          type: 'object',
          properties: {},
        }),
        // @ts-ignore
        execute: async () => {
          console.log(`[Donna Tool] Ejecutando list_campaigns`);
          const { data, error } = await supabase
            .from('campaigns')
            .select('id, name, description, status, expected_posts, objective_id, created_at')
            .is('archived_at', null)
            .order('created_at', { ascending: false });
          if (error) return { status: 'error', message: `Error leyendo campañas: ${error.message}` };
          return { status: 'success', action: 'list', campaigns: data };
        }
      }),
      create_campaign: tool({
        description: 'Crea una nueva campaña en la base de datos. Es OBLIGATORIO pasar el name y objective_id (del snapshot).',
        parameters: jsonSchema<{
          name: string;
          objective_id: string;
          description?: string;
          expected_posts?: number;
          status?: string;
        }>({
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Nombre de la campaña (REQUERIDO)' },
            objective_id: { type: 'string', description: 'ID UUID del objetivo pilar al que pertenece (REQUERIDO — obtenerlo del SNAPSHOT)' },
            description: { type: 'string', description: 'Descripción o brief estratégico' },
            expected_posts: { type: 'number', description: 'Cantidad de posts esperados' },
            status: { type: 'string', enum: ['active', 'paused', 'completed'], description: 'Estado de la campaña' },
          },
          required: ['name', 'objective_id'],
        }),
        // @ts-ignore
        execute: async ({ name, description, objective_id, expected_posts, status }: any) => {
          console.log(`[Donna Tool] Ejecutando create_campaign: name=${name} | objective_id=${objective_id}`);
          if (!name || !objective_id) return { status: 'error', message: 'Faltan campos obligatorios: name y objective_id.' };
          const insertData: any = { name, objective_id, status: status || 'active' };
          if (description) insertData.description = description;
          if (expected_posts) insertData.expected_posts = expected_posts;
          
          const { data, error } = await supabase.from('campaigns').insert([insertData]).select().single();
          if (error) return { status: 'error', message: `Error de BD: ${error.message}` };
          return { status: 'success', id: data.id, action: 'create', message: `Campaña "${name}" creada correctamente en el objetivo referenciado.` };
        }
      }),
      update_campaign: tool({
        description: 'Modifica los campos de una campaña existente en la base de datos.',
        parameters: jsonSchema<{
          id: string;
          name?: string;
          description?: string;
          objective_id?: string;
          expected_posts?: number;
          status?: string;
        }>({
          type: 'object',
          properties: {
             id: { type: 'string', description: 'ID de la campaña (REQUERIDO)' },
            name: { type: 'string', description: 'Nuevo nombre' },
            description: { type: 'string', description: 'Nueva descripción' },
            objective_id: { type: 'string', description: 'Nuevo ID de objetivo' },
            expected_posts: { type: 'number', description: 'Nueva cantidad esperada' },
            status: { type: 'string', enum: ['active', 'paused', 'completed'], description: 'Nuevo estado' },
          },
          required: ['id'],
        }),
        // @ts-ignore
        execute: async ({ id, name, description, objective_id, expected_posts, status }: any) => {
          console.log(`[Donna Tool] Ejecutando update_campaign: id=${id}`);
          if (!id) return { status: 'error', message: 'ID de campaña requerido para actualizar.' };
          const updates: any = {};
          if (name) updates.name = name;
          if (description !== undefined) updates.description = description;
          if (objective_id) updates.objective_id = objective_id;
          if (expected_posts !== undefined) updates.expected_posts = expected_posts;
          if (status) updates.status = status;
          
          const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single();
          if (error) return { status: 'error', message: `Error al actualizar: ${error.message}` };
          return { status: 'success', id: data.id, action: 'update', message: `Campaña actualizada correctamente.` };
        }
      }),
      archive_campaign: tool({
        description: 'Archiva (Soft Delete) una campaña de la base de datos.',
        parameters: jsonSchema<{ id: string }>({
          type: 'object',
          properties: { id: { type: 'string', description: 'ID de la campaña a archivar (REQUERIDO)' } },
          required: ['id'],
        }),
        // @ts-ignore
        execute: async ({ id }: any) => {
          console.log(`[Donna Tool] Ejecutando archive_campaign: id=${id}`);
          if (!id) return { status: 'error', message: 'ID requerido para archivar.' };
          const { data, error } = await supabase.from('campaigns')
            .update({ status: 'archived', archived_at: new Date().toISOString() })
            .eq('id', id).select().single();
          if (error) return { status: 'error', message: `Error al archivar: ${error.message}` };
          return { status: 'success', id: data.id, action: 'archive', message: `Campaña archivada (soft delete) correctamente.` };
        }
      }),
      // @ts-ignore
      propose_post: tool({
        description: 'Propone un post para RRSS. Úsalo para crear borradores (César aprueba) o publicaciones directas (si es urgente). Soporta múltiples imágenes, videos y links externos.',
        parameters: jsonSchema<{
          content: string;
          platforms: string[];
          campaign_id?: string;
          objective_id?: string;
          scheduled_for?: string;
          media_url?: string;
          media_urls?: string[];
          external_links?: string[];
          is_instant?: boolean;
          topic?: string;
        }>({
          type: 'object',
          properties: {
            content: { type: 'string', description: 'Cuerpo del post (copy estratégico)' },
            platforms: { type: 'array', items: { type: 'string' }, description: 'Plataformas destino (ej: ["instagram"], ["linkedin"], ["instagram", "facebook"]). IMPORTANTE: DEBE coincidir al 100% con lo que el usuario pidió y lo que dices en el texto.' },
            campaign_id: { type: 'string', description: 'ID de la campaña vinculada' },
            objective_id: { type: 'string', description: 'ID del objetivo (César, OBJETIVO, ActivaQR)' },
            scheduled_for: { type: 'string', description: 'Fecha ISO programada' },
            media_url: { type: 'string', description: 'URL de la imagen principal' },
            media_urls: { type: 'array', items: { type: 'string' }, description: 'Lista de URLs de imágenes/videos para carruseles' },
            external_links: { type: 'array', items: { type: 'string' }, description: 'Lista de links a artículos o videos de YouTube' },
            is_instant: { type: 'boolean', description: 'Verdadero si el usuario quiere publicar "ahora"' },
            topic: { type: 'string', description: 'Asunto o título corto del post' }
          },
          required: ['content', 'platforms'],
        }),
        execute: async ({ content, platforms, campaign_id, objective_id, scheduled_for, media_url, media_urls, external_links, is_instant, topic }: any) => {
          console.log(`[Donna Tool] Ejecutando propose_post (is_instant=${!!is_instant}, scheduled_for=${scheduled_for})`); 
          
          let finalScheduledFor: string;
          if (is_instant) {
            finalScheduledFor = new Date().toISOString();
          } else if (scheduled_for) {
            finalScheduledFor = scheduled_for;
          } else {
            finalScheduledFor = new Date().toISOString();
          }

          const status = is_instant ? 'pending' : 'draft_ai';

          // IMPORTANTE: Se usa supabaseAdmin para saltarse cualquier restricción de RLS
          const { data, error } = await supabaseAdmin
            .from('social_posts')
            .insert([{ 
              content_text: content || '',
              platforms,
              campaign_id: campaign_id || null,
              objective_id: objective_id || null,
              status,
              scheduled_for: finalScheduledFor,
              media_url: media_url || (media_urls && media_urls[0]) || (attachments && attachments[0]) || null,
              media_urls: media_urls || attachments || [],
              external_links: external_links || [],
              topic: topic || 'Post Generado por Donna'
            }])
            .select('id, status, scheduled_for')
            .single();

          if (error) throw error;

          // ── PUBLICACIÓN INSTANTÁNEA ──────────
          if (is_instant) {
            console.log(`[Donna Tool] 🚀 Publicación INSTANTÁNEA para post ${data.id}. Disparando el scheduler.`);
            setImmediate(async () => {
              try {
                await processScheduledPosts();
              } catch (e) {
                console.error(`[Donna Tool] ❌ Error processScheduledPosts:`, e);
              }
            });
          }

          let msg: string;
          if (is_instant) {
            msg = `🚀 ¡Listo! Post enviado a publicación INMEDIATA. Make.com lo procesará instantes.`;
          } else if (scheduled_for && new Date(scheduled_for) > new Date()) {
            msg = `⏱️ ¡Perfecto! Post programado correctamente para el ${new Date(scheduled_for).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}.`;
          } else {
            msg = `✅ Borrador guardado. Dime cuando quieras publicarlo.`;
          }

          const result = { status: 'success', id: data.id, message: msg, scheduled_for: finalScheduledFor };
          executedMutations.push({ tool: 'propose_post', result });
          return result;
        },
      }),

      // @ts-ignore
      pilot_editor: tool({
        description: 'MODO JARVIS: Pre-llena el Editor de Contenido con contexto estratégico y abre la página automáticamente. Úsalo cuando el usuario quiere crear posts o contenido.',
        parameters: jsonSchema<{
          central_idea: string;
          objective_id?: string;
          campaign_id?: string;
          target_month?: string;
          suggested_platforms?: string[];
        }>({
          type: 'object',
          properties: {
            central_idea: { type: 'string', description: 'La idea central o brief para el lote de contenido' },
            objective_id: { type: 'string', description: 'ID del objetivo estratégico del snapshot' },
            campaign_id: { type: 'string', description: 'ID de la campaña del snapshot' },
            target_month: { type: 'string', description: 'Mes objetivo (ej. Marzo)' },
            suggested_platforms: { type: 'array', items: { type: 'string' }, description: 'Plataformas sugeridas (instagram, linkedin, etc.)' },
          },
          required: ['central_idea'],
        }),
        // @ts-ignore
        execute: async ({ central_idea, objective_id, campaign_id, target_month, suggested_platforms }: {
          central_idea: string, objective_id?: string, campaign_id?: string, target_month?: string, suggested_platforms?: string[]
        }) => {
          console.log(`[Donna Tool] Ejecutando pilot_editor: ${central_idea.substring(0, 60)}...`);
          // Esta herramienta no escribe en DB — devuelve un payload para la UI
          return {
            status: 'ui_action',
            action: 'pilot_editor',
            payload: {
              central_idea,
              objective_id: objective_id || null,
              campaign_id: campaign_id || null,
              target_month: target_month || 'Marzo',
              suggested_platforms: suggested_platforms || ['instagram'],
            },
          };
        },
      }),
      // @ts-ignore
      generate_strategy_map: tool({
        description: 'Genera un esquema estratégico completo (Objetivo > Campañas > Artículos > Posts). La UI tomará este esquema, lo convertirá en un grafo visual en el Strategy Planner y el usuario podrá verlo y editarlo. Úsalo cuando el usuario te pida explícitamente "crear el flujo de trabajo", "generar el mapa" o "plasmar esto en el planner".',
        parameters: jsonSchema<{
          plan: any[];
        }>({
          type: 'object',
          properties: {
            plan: {
              type: 'array',
              description: 'Arreglo de nodos raíz (usualmente un objectiveNode). Cada nodo debe tener "type" (tipos válidos: objectiveNode, campaignNode, articleNode, postNode, ideaNode), "name" (título principal), "notes" (descripción/notas) y un arreglo opcional "children" con sub-nodos siguiendo la misma jerarquía.',
              items: { type: 'object' }
            }
          },
          required: ['plan'],
        }),
        // @ts-ignore
        execute: async ({ plan }: { plan: any[] }) => {
          console.log(`[Donna Tool] Ejecutando generate_strategy_map con ${plan.length} nodos raíz.`);
          // Esta herramienta tampoco escribe interacciones automáticas a la DB (por ahora), 
          // sino que inyecta la UI en el Chat para que el usuario materialice el Canvas.
          return {
            status: 'ui_action',
            action: 'generate_strategy_map',
            payload: { plan },
          };
        },
      }),
      read_article_content: tool({
        description: 'Lee el contenido completo de un artículo (MySQL) o borrador (Supabase). Úsalo para resumir, analizar o crear enlaces internos precisos.',
        parameters: jsonSchema<{
          id: string;
          source: 'mysql' | 'supabase';
        }>({
          type: 'object',
          properties: {
            id: { type: 'string', description: 'El ID o Slug del artículo a leer' },
            source: { type: 'string', enum: ['mysql', 'supabase'], description: 'Origen del dato (mysql para publicados, supabase para borradores)' },
          },
          required: ['id', 'source'],
        }),
        // @ts-ignore
        execute: async ({ id, source }: { id: string, source: 'mysql' | 'supabase' }) => {
          console.log(`[Donna Tool] Leyendo contenido de ${source}: ${id}`);
          if (source === 'mysql') {
            const [rows]: any = await pool.query('SELECT content, title, slug FROM articles WHERE id = ? OR slug = ?', [id, id]);
            if (!rows || rows.length === 0) return { error: 'Artículo no encontrado en MySQL.' };
            return { title: rows[0].title, content: rows[0].content, slug: rows[0].slug };
          } else {
            const { data, error } = await supabase.from('social_posts').select('topic, content_text').eq('id', id).single();
            if (error || !data) return { error: 'Borrador no encontrado en Supabase.' };
            return { title: data.topic, content: data.content_text };
          }
        },
      }),
      // @ts-ignore
      tag_article: tool({
        description: 'Vincula un artículo del blog (MySQL) con un Objetivo y/o Campaña estratégica. Esto permite trackear qué contenido apoya qué pilar. Soporta many-to-many (un artículo puede servir a múltiples objetivos). Usa los IDs del SNAPSHOT.',
        parameters: jsonSchema<{
          mysql_article_id: number;
          article_title: string;
          article_slug: string;
          objective_id: string;
          campaign_id?: string;
          role?: string;
          strategic_notes?: string;
        }>({
          type: 'object',
          properties: {
            mysql_article_id: { type: 'number', description: 'ID numérico del artículo en MySQL (del SNAPSHOT)' },
            article_title: { type: 'string', description: 'Título del artículo (para cache y legibilidad)' },
            article_slug: { type: 'string', description: 'Slug del artículo' },
            objective_id: { type: 'string', description: 'UUID del Objetivo en Supabase (del SNAPSHOT)' },
            campaign_id: { type: 'string', description: 'UUID de la Campaña (opcional)' },
            role: { type: 'string', enum: ['pillar', 'support', 'backlink_target', 'lead_magnet'], description: 'Rol del artículo: pillar=contenido pilar, support=refuerzo, backlink_target=enlace interno, lead_magnet=captura' },
            strategic_notes: { type: 'string', description: 'Nota breve sobre por qué este artículo sirve a este objetivo' },
          },
          required: ['mysql_article_id', 'article_title', 'article_slug', 'objective_id'],
        }),
        // @ts-ignore
        execute: async ({ mysql_article_id, article_title, article_slug, objective_id, campaign_id, role, strategic_notes }: any) => {
          console.log(`[Donna Tool] Vinculando artículo ${mysql_article_id} ("${article_title}") → Objetivo ${objective_id}`);
          const { data, error } = await supabase
            .from('article_strategy_map')
            .upsert({
              mysql_article_id,
              article_title,
              article_slug: article_slug || null,
              objective_id,
              campaign_id: campaign_id || null,
              role: role || 'support',
              strategic_notes: strategic_notes || null,
            }, { onConflict: 'mysql_article_id,objective_id,campaign_id' })
            .select()
            .single();
          if (error) {
            console.error('[Donna Tool] Error vinculando artículo:', error);
            return { status: 'error', message: `Error al vincular: ${error.message}` };
          }
          return { status: 'success', message: `Artículo "${article_title}" vinculado al objetivo como ${role || 'support'}.`, id: data?.id };
        },
      }),
      save_idea: tool({
        description: 'Guarda una idea en bruto, ocurrencia o tarea futura en el Cerebro Secundario de César (donna_memory). Úsalo solo para ideas nuevas, no para generar posts inmediatos.',
        parameters: jsonSchema<{
          topic: string;
          content: string;
          objective_id?: string;
          campaign_id?: string;
        }>({
          type: 'object',
          properties: {
            topic: { type: 'string', description: 'Título corto de la idea (máx 8 palabras)' },
            content: { type: 'string', description: 'Idea detallada en bruto' },
            objective_id: { type: 'string', description: 'ID del objetivo maestro si aplica (César, OBJETIVO, ActivaQR)' },
            campaign_id: { type: 'string', description: 'ID de campaña si está relacionada' }
          },
          required: ['topic', 'content'],
        }),
        // @ts-ignore
        execute: async ({ topic, content, objective_id, campaign_id }: any) => {
          console.log(`[Donna Tool] Guardando idea en memoria: "${topic}"`);
          const { data, error } = await supabase
            .from('donna_memory')
            .insert({
              topic,
              content,
              objective_id: objective_id || null,
              campaign_id: campaign_id || null,
              added_by: 'cesar',
              is_active: true
            })
            .select()
            .single();
          if (error) {
            console.error('[Donna Tool] Error guardando idea:', error);
            return { status: 'error', message: `Fallo al guardar la idea: ${error.message}` };
          }
          return { status: 'success', message: `✅ Idea guardada en Bóveda (donna_memory).`, id: data?.id };
        },
      }),
      notify_cesar: tool({
        description: 'Envía un mensaje corto de WhatsApp a César usando Evolution API. Úsalo SIEMPRE después de crear un borrador de post o guardar una idea importante, para que César revise el dashboard cuando tenga tiempo. Mensaje muy corto, máximo 3 líneas.',
        parameters: jsonSchema<{
          message: string;
        }>({
          type: 'object',
          properties: {
            message: { type: 'string', description: 'El texto del mensaje a enviar, con emojis y enlaces si aplica' }
          },
          required: ['message'],
        }),
        // @ts-ignore
        execute: async ({ message }: any) => {
          console.log(`[Donna Tool] Notificando a César vía WhatsApp: "${message}"`);
          try {
            const apiUrl = process.env.EVOLUTION_API_URL;
            const apiKey = process.env.EVOLUTION_API_KEY;
            const instance = process.env.EVOLUTION_INSTANCE;
            const toNumber = process.env.NOTIFY_WHATSAPP_NUMBER || '593963410409';

            if (!apiUrl || !apiKey || !instance) {
              console.warn('[Donna Tool] Faltan credenciales de Evolution API en .env.local');
              return { status: 'warning', message: `No pude enviarte WhatsApp (credenciales faltantes).` };
            }

            const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
              method: 'POST',
              headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                number: toNumber,
                text: message,
                delay: 1200
              })
            });

            if (!res.ok) {
              const errTxt = await res.text();
              console.error('[Donna Tool] Evolution API error:', errTxt);
              return { status: 'error', message: `Error enviando WhatsApp: ${res.statusText}` };
            }

            return { status: 'success', message: `✅ WhatsApp de notificación enviado a César.` };
          } catch (err: any) {
            console.error('[Donna Tool] Fallo al llamar Evolution:', err);
            return { status: 'error', message: `Error llamando a WhatsApp: ${err.message}` };
          }
        },
      }),
      distill_multibrand: tool({
        description: `Cuando César reporta un evento/logro/idea, crear automáticamente 3 borradores draft_ai asignados a los 3 objetivos maestros: César (LinkedIn), OBJETIVO (YouTube), ActivaQR (Blog). Cada borrador tiene tono, handle y platform correctos según la marca.`,
        parameters: jsonSchema<{
          event_summary: string;
          cesar_angle: string;
          objetivo_angle: string;
          activaqr_angle: string;
          scheduled_for?: string;
        }>({
          type: 'object',
          properties: {
            event_summary: { type: 'string', description: 'Resumen del evento/idea en bruto de César' },
            cesar_angle: { type: 'string', description: 'Copy para el ángulo de autoridad personal (César)' },
            objetivo_angle: { type: 'string', description: 'Copy para el ángulo técnico (OBJETIVO)' },
            activaqr_angle: { type: 'string', description: 'Copy para el ángulo de utilidad (ActivaQR)' },
            scheduled_for: { type: 'string', description: 'ISO datetime opcional' }
          },
          required: ['event_summary', 'cesar_angle', 'objetivo_angle', 'activaqr_angle'],
        }),
        // @ts-ignore
        execute: async ({ event_summary, cesar_angle, objetivo_angle, activaqr_angle, scheduled_for }: any) => {
          console.log(`[Donna Tool] Destilando multimarca para: "${event_summary.substring(0, 30)}..."`);
          
          const OBJ_CESAR = process.env.OBJ_CESAR_ID || 'f872ef5e-5481-47d5-9c59-75b710f41f25';
          const OBJ_OBJETIVO = process.env.OBJ_OBJETIVO_ID || '5d9e7d2b-b341-4d94-870e-152a8da1345c';
          const OBJ_ACTIVAQR = process.env.OBJ_ACTIVAQR_ID || '728b2c49-2f4d-4c3f-b911-a5d0a7047266';

          const postsToInsert = [
            {
              topic: `[César] ${event_summary.substring(0, 50)}`,
              content_text: cesar_angle,
              platforms: ['linkedin'],
              status: 'draft_ai',
              objective_id: OBJ_CESAR,
              added_by: 'donna',
              scheduled_for: scheduled_for || null
            },
            {
              topic: `[OBJETIVO] ${event_summary.substring(0, 50)}`,
              content_text: objetivo_angle,
              platforms: ['youtube'],
              status: 'draft_ai',
              objective_id: OBJ_OBJETIVO,
              added_by: 'donna',
              scheduled_for: scheduled_for || null
            },
            {
              topic: `[ActivaQR] ${event_summary.substring(0, 50)}`,
              content_text: activaqr_angle,
              platforms: ['blog'],
              status: 'draft_ai',
              objective_id: OBJ_ACTIVAQR,
              added_by: 'donna',
              scheduled_for: scheduled_for || null
            }
          ];

          const { data, error } = await supabase
            .from('social_posts')
            .insert(postsToInsert)
            .select();

          if (error) {
            console.error('[Donna Tool] Error en distill_multibrand:', error);
            return { status: 'error', message: `Fallo al crear borradores multimarca: ${error.message}` };
          }
          
          // Tratar de notificar proactivamente a César usando WhatsApp
          try {
            const apiUrl = process.env.EVOLUTION_API_URL;
            const apiKey = process.env.EVOLUTION_API_KEY;
            const instance = process.env.EVOLUTION_INSTANCE;
            const toNumber = process.env.NOTIFY_WHATSAPP_NUMBER || '593963410409';
            if (apiUrl && apiKey && instance) {
               fetch(`${apiUrl}/message/sendText/${instance}`, {
                method: 'POST',
                headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  number: toNumber,
                  text: `📌 Donna: Se han destilado 3 borradores (César, OBJETIVO, ActivaQR) basados en tu audio.\n⏳ Acción: Revisa el dashboard para aprobarlos.\n🔗 rrss.objetivo.ai`,
                  delay: 1200
                })
              }).catch(() => {});
            }
          } catch(e) {}

          return { status: 'success', message: `✅ Se han creado 3 borradores multimarca en el bloque de Trabajo Profundo.`, count: 3 };
        },
      }),
      // ── MODO VENTAS: Quoting Engine v2.1 (Columnar) ──
      manage_quote_draft: tool({
        description: 'Gestiona borradores de cotizaciones en la tabla columnar quote_drafts. Úsalo para guardar el progreso campo por campo (upsert) o para publicar la versión final al sitio web (publish).',
        parameters: jsonSchema<{
          action: 'upsert' | 'publish' | 'get';
          slug: string;
          fields?: Record<string, any>;
        }>({
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['upsert', 'publish', 'get'], description: 'upsert para guardar/actualizar campos; publish para enviar al sitio web; get para recuperar un borrador.' },
            slug: { type: 'string', description: 'ID único del cliente (ej. clinica-avendano).' },
            fields: { 
              type: 'object', 
              description: 'Objeto con los nombres de columna y valores a actualizar. Columnas válidas: client_name, client_sector, status, current_step, portada_etiqueta, portada_titulo_bold, portada_titulo_acento, portada_subtitulo, portada_preparado_para, portada_fecha, portada_url_banner, portada_url_coordinador, intro_titulo, intro_parrafos, etapas (JSONB), precio_total, cierre_llamada_accion, etc.' 
            }
          },
          required: ['action', 'slug']
        }),
        // @ts-ignore
        execute: async ({ action, slug, fields }: any) => {
          console.log(`[Quoting Engine] Acción: ${action} para ${slug}`);
          try {
            if (action === 'upsert') {
              const upsertData = { 
                slug, 
                ...fields, 
                objective_id: '5d9e7d2b-b341-4d94-870e-152a8da1345c' 
              };
              const { error } = await supabase.from('quote_drafts').upsert(upsertData, { onConflict: 'slug' });
              if (error) throw error;
              return { status: 'success', message: `✅ Campos actualizados para ${slug}.` };
            } 
            
            if (action === 'get') {
              const { data, error } = await supabase.from('quote_drafts').select('*').eq('slug', slug).single();
              if (error) return { status: 'error', message: `No se encontró el borrador: ${error.message}` };
              return { status: 'success', data };
            }

            if (action === 'publish') {
              const { data: row, error: fetchError } = await supabase.from('quote_drafts').select('*').eq('slug', slug).single();
              if (fetchError || !row) throw new Error("No se pudo recuperar la cotización para publicar.");

              // Construir el JSON jerárquico que espera el webhook (QuoteData)
              const quoteData = {
                id: row.slug,
                portada: {
                  etiqueta: row.portada_etiqueta || "Propuesta Comercial",
                  titulo_principal: row.portada_titulo_bold || "",
                  titulo_destacado: row.portada_titulo_acento || "",
                  subtitulo: row.portada_subtitulo || "",
                  preparado_para: row.portada_preparado_para || row.client_name,
                  preparado_por: "Ing. César Augusto Reyes Jaramillo",
                  fecha: row.portada_fecha || new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
                  url_fondo: row.portada_url_banner || "",
                  url_logo_cliente: row.portada_url_logo || ""
                },
                introduccion: {
                  titulo: row.intro_titulo || "Transformando la visión en resultados.",
                  parrafos: row.intro_parrafos || []
                },
                etapas: row.etapas || [],
                cierre: {
                  titulo: row.cierre_titulo_propuesta || "El siguiente paso",
                  texto: row.cierre_llamada_accion || "",
                  frase_final: row.cierre_pie_texto || "Construyamos el futuro <span>hoy mismo.</span>"
                }
              };

              // Llamar al proxy interno de publicación
              // Nota: Como estamos en el servidor, podemos intentar fetch a localhost o usar la URL externa si está configurada.
              const publishUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cotizaciones/publish`;
              const response = await fetch(publishUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quoteData)
              });

              const resJson = await response.json();
              if (resJson.success) {
                await supabase.from('quote_drafts').update({ status: 'published' }).eq('slug', slug);
                return { status: 'success', message: `🚀 ¡Publicado con éxito! Ver en: ${resJson.url}`, url: resJson.url };
              } else {
                return { status: 'error', message: `Fallo en el webhook: ${resJson.message}` };
              }
            }
          } catch(e:any) {
             return { status: 'error', message: `Error en Quoting Engine: ${e.message}` };
          }
        }
      }),
      // ── ANTIGRAVITY: Caja Negra de Sesión ──
      save_session: tool({
        description: 'Guarda o actualiza el resumen de la sesión actual en la Caja Negra de Antigravity (antigravity_sessions). Úsala PROACTIVAMENTE cuando: (1) el usuario se despide, (2) se tomaron decisiones estratégicas importantes, (3) el usuario dice "hasta luego", "nos vemos", "seguimos después" o similar. Esto garantiza la continuidad en la próxima sesión.',
        parameters: jsonSchema<{
          session_title: string;
          summary: string;
          pending_tasks: string[];
          decisions: string[];
          dna_snapshot?: Record<string, any>;
        }>({
          type: 'object',
          properties: {
            session_title: { type: 'string', description: 'Título corto y descriptivo de esta sesión (ej. "Construyendo Campaña ActivaQR Abril")' },
            summary: { type: 'string', description: 'Resumen estratégico de lo que se hizo en esta sesión (2-4 oraciones)' },
            pending_tasks: { type: 'array', items: { type: 'string' }, description: 'Lista de tareas concretas que quedaron pendientes para la próxima sesión' },
            decisions: { type: 'array', items: { type: 'string' }, description: 'Lista de decisiones importantes que se tomaron y NO deben olvidarse' },
            dna_snapshot: { type: 'object', description: 'Objeto JSON opcional con contexto técnico adicional (urls, IDs, configs activas)' },
          },
          required: ['session_title', 'summary', 'pending_tasks', 'decisions'],
        }),
        // @ts-ignore
        execute: async ({ session_title, summary, pending_tasks, decisions, dna_snapshot }: any) => {
          console.log(`[Antigravity] 💾 Guardando sesión: "${session_title}"`);
          const { data, error } = await supabase
            .from('antigravity_sessions')
            .insert({
              session_title,
              summary,
              pending_tasks: pending_tasks || [],
              decisions: decisions || [],
              dna_snapshot: dna_snapshot || null,
              conversation_id: null, // se puede añadir después si se pasa desde el frontend
            })
            .select('id')
            .single();
          if (error) {
            console.error('[Antigravity] Error guardando sesión:', error);
            return { status: 'error', message: `Fallo guardando la sesión: ${error.message}` };
          }
          console.log(`[Antigravity] ✅ Sesión #${data.id} guardada en Caja Negra.`);
          return { status: 'success', message: `✅ Sesión guardada en Antigravity. La próxima vez que abras este chat, recordaré exactamente en qué estamos.`, id: data.id };
        },
      }),
    };

    let responseText = '';
    let uiAction: any = null;

    // Obtener el último texto del usuario para detección de intención
    const lastUserMessageMap = [...normalizedMessages].reverse().find(m => m.role === 'user');
    const lastText = lastUserMessageMap?.content || '';

    // ── Detección de intención: el usuario quiere GENERAR el mapa visual
    // IMPORTANTE: excluir URLs y mensajes donde 'strategy-planner' aparece como link, no como intención
    const wantsStrategyMap = [
      'genera el mapa', 'créa el mapa', 'crea el mapa', 'crea el flujo',
      'generar el flujo', 'genera el flujo', 'genera el mapa estratégico', 'crea el mapa estratégico',
      '/crear', '/generar', 'crear mapa', 'generar mapa',
      'flujo visual', 'hazlo visual', 'plasmar', 'plasmarlo',
      'flujo de trabajo visual', 'cargar al canvas', 'cargar en el canvas',
      'cargar al planner', 'cargar en el planner',
      'mapa de esto', 'flujo de esto', 'convierte en flujo',
    ].some(kw => lastText.includes(kw));

    console.log(`[Donna Intent] wantsStrategyMap=${wantsStrategyMap} | text="${lastText.substring(0, 100)}"`);

    // ── FAST PATH: si el usuario quiere el mapa, generamos el JSON directamente sin pasar
    // por herramientas (el enfoque toolChoice genera args vacíos en Gemini).
    if (wantsStrategyMap && provider !== 'deepseek') {
      const mapKeys = getGeminiKeys();
      let mapGenerated = false;
      
      // Construir historial del chat limpio para que Gemini extraiga la estrategia
      const conversationHistory = normalizedMessages
        .map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Donna'}: ${m.content}`)
        .join('\n');
      
      const mapPrompt = `Analiza TODA la conversación y extrae la estrategia discutida en formato JSON estructurado y jerárquico.
Es MUY IMPORTANTE que desgloses la estrategia al máximo nivel de detalle que encuentres en el chat. No te quedes solo en Campañas. Si el usuario proporcionó títulos de artículos, agrégalos como "articleNode" dentro de la campaña. Si hay ideas de posts o menciones de redes sociales, agrégalas como "postNode" dentro del artículo correspondiente.

=== CONVERSACIÓN ===
${conversationHistory.substring(0, 8000)}

=== INSTRUCCIONES ESTRICTAS ===
1. Devuelve SOLO un array JSON válido. SIN código markdown (\`\`\`json), sin explicaciones, solo el JSON puro.
2. Cada nodo DEBE tener "type", "name", y "notes".
3. Tipos válidos: "objectiveNode", "campaignNode", "articleNode", "postNode", "ideaNode".
4. Estructura esperada (ejemplo de profundidad):
[
  {
    "type": "objectiveNode",
    "name": "Nombre del objetivo",
    "notes": "Descripción del objetivo",
    "children": [
      {
        "type": "campaignNode",
        "name": "Nombre de la campaña",
        "notes": "Brief de la campaña",
        "children": [
          {
            "type": "articleNode",
            "name": "Título del artículo",
            "notes": "Sinopsis y keywords",
            "children": [
              { "type": "postNode", "name": "Idea de post para LinkedIn", "notes": "Plataforma: LinkedIn. Formato: Carrusel." },
              { "type": "postNode", "name": "Idea de post para Instagram", "notes": "Plataforma: Reels. Formato: Video." }
            ]
          }
        ]
      }
    ]
  }
]

Si hay información de Artículos de Blog y Posts de Redes Sociales, DEBES incluirlos anidados correctamente bajo las campañas, no los resumas. Devuelve SOLO el array JSON.`;
      
      for (let ki = 0; ki < mapKeys.length && !mapGenerated; ki++) {
        try {
          const gp = createGoogleGenerativeAI({ apiKey: mapKeys[ki] });
          const mapResult = await generateText({
            model: gp('gemini-2.5-flash'),
            system: 'Eres un extractor de estrategias. Devuelves SOLO JSON válido sin markdown.',
            messages: [{ role: 'user', content: mapPrompt }],
          });
          
          // Limpiar respuesta de posibles bloques de código
          let jsonText = mapResult.text.trim()
            .replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
          
          const plan = JSON.parse(jsonText);
          if (Array.isArray(plan) && plan.length > 0) {
            uiAction = { status: 'ui_action', action: 'generate_strategy_map', payload: { plan } };
            responseText = '¡Listo, César! He estructurado toda la estrategia que conversamos en bloques visuales. Haz clic en “Cargar al Canvas” para verla en el Strategy Planner.';
            mapGenerated = true;
            console.log(`[Donna Map] Mapa generado con ${plan.length} nodos raíz.`);
          }
        } catch (mapErr: any) {
          console.warn(`[Donna Map] Key ${ki+1} falló al generar mapa:`, mapErr?.message?.substring(0, 100));
        }
      }
      
      if (!mapGenerated) {
        // Fallback a DeepSeek Chat para el mapa cuando Gemini está agotado
        const dsKey = process.env.DEEPSEEK_API_KEY;
        if (dsKey) {
          try {
            console.warn('[Donna Map] Intentando con DeepSeek Chat como fallback para el mapa...');
            const dsp = createDeepSeek({ apiKey: dsKey });
            const dsMapResult = await generateText({
              model: dsp('deepseek-chat'),
              system: 'Eres un extractor de estrategias. Devuelves SOLO JSON válido sin markdown.',
              messages: [{ role: 'user', content: mapPrompt }],
            });
            let jsonText2 = dsMapResult.text.trim()
              .replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
            const plan2 = JSON.parse(jsonText2);
            if (Array.isArray(plan2) && plan2.length > 0) {
              uiAction = { status: 'ui_action', action: 'generate_strategy_map', payload: { plan: plan2 }, source: 'deepseek-fallback' };
              responseText = '¡Listo, César! He estructurado la estrategia (usando el motor de respaldo). Haz clic en "Cargar al Canvas" para verla.';
              mapGenerated = true;
              console.log(`[Donna Map] Mapa generado con ${plan2.length} nodos raíz (DeepSeek fallback).`);
            }
          } catch (dsME: any) {
            console.error('[Donna Map] DeepSeek fallback para mapa también falló:', dsME?.message);
          }
        }
        if (!mapGenerated) {
          responseText = 'Tuve problemas generando el mapa en este momento (cuota agotada en todos los motores). Intenta de nuevo en unos segundos.';
        }
      }
      
      // Short-circuit: devolver la respuesta del mapa sin pasar por el flujo principal
      return Response.json({ text: responseText, uiAction });
    }

    // --- FASE 3: EXECUTOR SELECTIVO ---
    let activeTools: any = { ...tools };
    
    if (reasonerPlan) {
      if (reasonerPlan.mode === 1) {
        // Modo 1: Conversación pura. Cero herramientas para evitar ejecuciones accidentales.
        console.log(`[Donna Dual-Agent] Mode 1: Deshabilitando herramientas para conversación pura.`);
        activeTools = {};
      } else if (reasonerPlan.mode === 2 && reasonerPlan.primary_action && reasonerPlan.primary_action !== 'none') {
        // Modo 2: Acción muy acotada o lectura.
        console.log(`[Donna Dual-Agent] Mode 2: Restringiendo herramientas a: ${reasonerPlan.primary_action}`);
        activeTools = {};
        if (tools[reasonerPlan.primary_action]) {
          activeTools[reasonerPlan.primary_action] = tools[reasonerPlan.primary_action];
        }
        if (reasonerPlan.save_memory && tools.save_idea) {
          activeTools.save_idea = tools.save_idea;
        }
      } else if (reasonerPlan.mode === 3) {
        console.log(`[Donna Dual-Agent] Mode 3: Habilitando orquestación completa de herramientas.`);
        // Mantener todas las herramientas
      }
    }

    // ── ORQUESTACIÓN INTELIGENTE ──
    // Si la herramienta es de LEER (ej. list_campaigns), permitimos multi-step (maxSteps: 3)
    // para que Gemini vea el resultado de la DB y lo formatee bonito para el usuario.
    // Si la herramienta es de ESCRIBIR (ej. propose_post), limitamos a maxSteps: 1.
    // El SDK ejecuta la mutación y retorna INMEDIATAMENTE. Ahorramos 10-20s, la mitad de los tokens,
    // y 100% de los errores 500 causados por Rate Limits del Paso 2.
    const queryTools = ['list_campaigns', 'list_memories'];
    const orchestratorSteps = (reasonerPlan && queryTools.includes(reasonerPlan.primary_action)) ? 3 : 1;

    const modelOptions: any = {
      system: systemPrompt,
      messages: normalizedMessages,
      tools: Object.keys(activeTools).length > 0 ? activeTools : undefined,
      maxSteps: Object.keys(activeTools).length > 0 ? orchestratorSteps : 1,
    };


    // ── NOTA: @ai-sdk/deepseek tiene un bug con Zod 4 que serializa las herramientas como
    // `properties: {}` vacío. La solución definitiva:
    // → GEMINI siempre corre con TOOLS (Jarvis Mode, create_objective, propose_post)
    // → DEEPSEEK corre sin tools para conversación pura (más rápido y sin bug)
    if (provider === 'deepseek') {
      const key = process.env.DEEPSEEK_API_KEY;
      if (!key) return Response.json({ error: 'DEEPSEEK_API_KEY no configurada' }, { status: 500 });
      const deepseekProvider = createDeepSeek({ apiKey: key });
      const result = await generateText({
        model: deepseekProvider('deepseek-reasoner'),
        system: systemPrompt,
        messages: normalizedMessages,
        // Sin tools — conversación pura de ALTO RAZONAMIENTO para evitar bugs y dar mayor potencia analítica
      });
      responseText = result.text;
    } else {
      const keys = getGeminiKeys();
      if (keys.length === 0) return Response.json({ error: 'GOOGLE_AI_API_KEY no configurada' }, { status: 500 });
      let geminiSucceeded = false;
      
      for (let i = 0; i < keys.length; i++) {
        try {
          const googleProvider = createGoogleGenerativeAI({ apiKey: keys[i] });
          const result = await generateText({
            model: googleProvider('gemini-2.5-flash'),
            ...modelOptions,
          });
          
          if (result.toolCalls && result.toolCalls.length > 0) {
            console.log(`[Donna SDK] Tool Calls detectados:`, JSON.stringify(result.toolCalls.map(tc => ({ name: tc.toolName, args: (tc as any).args || (tc as any).input }))));
          } else {
            console.log(`[Donna SDK] Sin tool calls en esta respuesta.`);
          }
          if (result.toolResults && result.toolResults.length > 0) {
            console.log(`[Donna SDK] Tool Results:`, JSON.stringify(result.toolResults.map((tr: any) => ({ name: tr.toolName, result: tr.result }))));
          }
          
          const uiActionResult = result.toolResults?.find((r: any) => (r as any).result?.status === 'ui_action');
          if (uiActionResult) uiAction = (uiActionResult as any).result;

          const toolActions = (result.toolResults || []).filter((r: any) =>
            ['create_objective', 'list_campaigns', 'create_campaign', 'update_campaign', 'archive_campaign', 'propose_post', 'tag_article', 'save_idea', 'notify_cesar', 'distill_multibrand', 'list_memories', 'archive_memory', 'archive_post', 'save_session'].includes(r.toolName)
          ).map((r: any) => ({ tool: r.toolName, result: (r as any).result }));
          if (toolActions.length > 0) uiAction = { ...(uiAction || {}), toolActions };

          responseText = result.text;

          if (!responseText) {
            if (uiActionResult) {
              const action = (uiActionResult as any).result?.action;
              if (action === 'generate_strategy_map') {
                responseText = '\u2705 Listo, César. He estructurado todo el flujo. Presiona \'Cargar al Canvas\' para verlo en el Strategy Planner.';
              } else if (action === 'pilot_editor') {
                responseText = '\u2705 El editor ya tiene el contenido pre-cargado.';
              } else {
                responseText = '\u2705 Acción de interfaz ejecutada.';
              }
            } else if (toolActions.length > 0) {
              // ── DONNA VOICE: Confirmaciones ricas por tool ──
              // Con maxSteps:1 Gemini ya no genera el texto final. Lo hacemos nosotros,
              // sin segunda llamada, sin latencia extra, con la voz de Donna intacta.
              const buildDonnaConfirmation = (ta: any): string => {
                const { tool, result } = ta;
                if (result?.status === 'error') {
                  return `⚠️ Hubo un problema al ejecutar la acción: ${result.message}`;
                }
                switch (tool) {
                  case 'propose_post':
                    if (result?.scheduled_for) {
                      const fecha = new Date(result.scheduled_for).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
                      return result.message?.includes('cola')
                        ? `🚀 ¡Listo, César! El post entró a la cola de publicación inmediata. Make.com lo despachará en segundos. [ID: ${result.id}]`
                        : `✅ Borrador guardado y programado para el **${fecha}**. Encuéntralo en */posts* para revisión final antes de que salga. [ID: ${result.id}]`;
                    }
                    return result?.message || '✅ Post guardado correctamente.';
                  case 'create_objective':
                    return `🎯 Objetivo creado y anclado en tu mapa estratégico. Ya puedes crear campañas dentro de él.`;
                  case 'create_campaign':
                    return `📋 Campaña lista y vinculada a tu objetivo. Puedes empezar a añadir posts ahora mismo.`;
                  case 'update_campaign':
                    return `✏️ Campaña actualizada. Los cambios ya están reflejados en tu mapa.`;
                  case 'archive_campaign':
                    return `🗂️ Campaña archivada. Desaparece de tu flujo activo pero queda guardada en el historial.`;
                  case 'archive_post':
                    return `🗑️ Post archivado y fuera de la cola de publicación.`;
                  case 'save_idea':
                    return `💡 Idea guardada en tu bóveda, César. Está segura ahí hasta que la necesites.`;
                  case 'archive_memory':
                    return `🗑️ Idea eliminada de tu bóveda activa. Ya no aparecerá en tus notas.`;
                  case 'tag_article':
                    return `🏷️ Artículo etiquetado y listo para el pipeline de contenido.`;
                  case 'notify_cesar':
                    return `📣 Notificación enviada. César fue alertado.`;
                  case 'distill_multibrand':
                    return `🧠 Destilación completada. El conocimiento está almacenado en la memoria de Donna.`;
                  case 'save_session':
                    return `💾 Sesión estratégica guardada. Puedes retomar esta conversación en cualquier momento.`;
                  default:
                    return result?.message || '✅ Acción ejecutada correctamente.';
                }
              };
              
              const successActions = toolActions.filter((ta: any) => ta.result?.status === 'success');
              const errorActions = toolActions.filter((ta: any) => ta.result?.status === 'error');
              const allActions = [...successActions, ...errorActions];
              responseText = allActions.map(buildDonnaConfirmation).join('\n\n');
            }

          }

          // Si Gemini respondió pero con texto VACÍO y sin tools, tratar como fallo
          // (gemini-2.5-flash puede devolver string vacío en lugar de crashear bajo carga)
          const hasToolOutput = (result.toolResults && result.toolResults.length > 0) || (result.toolCalls && result.toolCalls.length > 0);
          if (!responseText && !hasToolOutput && !uiActionResult) {
            console.warn(`[Donna API] Gemini Key ${i + 1} devolvió respuesta vacía (posible limitación silenciosa). Activando siguiente opción de fallback...`);
            continue;
          }

          geminiSucceeded = true;
          break;
        } catch (err: any) {
          if (executedMutations.length > 0) {
            console.log(`[Donna API] Gemini agotado/falló en paso 2, pero se rescataron ${executedMutations.length} mutations.`);
            uiAction = { toolActions: executedMutations };
            responseText = executedMutations.map((m: any) => m.result?.message).join(' ') + ' (Aviso: Gemini alcanzó límite de cuota al generar la respuesta de texto final, pero la operación fue exitosa).';
            geminiSucceeded = true;
            break;
          }
          console.warn(`[Donna API] Gemini Key ${i + 1} falló. Razón:`, err?.message || err);
          // Serializar el error completo a string para capturar errores envueltos por el SDK
          // Ej: "Failed after 3 attempts. Last error: This model is currently experiencing high demand."
          const errStr = (typeof err === 'string' ? err : (err?.message || '') + ' ' + (err?.toString?.() || '') + ' ' + JSON.stringify(err?.cause || '')).toLowerCase();
          const isQuotaError = err?.statusCode === 429
            || errStr.includes('quota')
            || errStr.includes('exhausted')
            || errStr.includes('429')
            || errStr.includes('resource_exhausted')
            || errStr.includes('high demand')
            || errStr.includes('overloaded')
            || errStr.includes('temporarily unavailable')
            || errStr.includes('rate limit')
            || errStr.includes('too many requests');
          const isModelError = err?.statusCode === 404
            || errStr.includes('not_found')
            || errStr.includes('not found')
            || errStr.includes('not supported');
          if (isQuotaError || isModelError) {
            console.warn(`[Donna API] Key ${i + 1} saltada (${isQuotaError ? 'cuota/rate-limit' : 'modelo no disponible'})`);
            continue;
          }
          // Si es un error DESCONOCIDO, aún así rotar al siguiente en lugar de crashear
          console.warn('[Donna API] Error no clasificado con Key', i + 1, '— rotando al siguiente:', err?.message);
          continue;
        }
      }

      // ── Fallback: Orquestación Manual cuando Gemini falla silenciosamente con tools
      if (!geminiSucceeded && !responseText) {
        const requiresTools = ['propose_post', 'create_campaign', 'create_objective', 'update_campaign'].includes(reasonerPlan?.primary_action);

        if (requiresTools) {
          // === ORQUESTACIÓN MANUAL (Manual Tool Orchestration) ===
          // Gemini retornó respuestas vacías con tools activos (comportamiento de cuota silenciosa).
          // Solución: DeepSeek extrae los argumentos del historial de conversación,
          // luego ejecutamos el tool directamente sin necesitar a Gemini.
          const dsKey = process.env.DEEPSEEK_API_KEY;
          let manualOrchestrationSucceeded = false;

          if (dsKey && reasonerPlan?.primary_action === 'propose_post') {
            try {
              console.log('[Donna MO] 🔧 Orquestación Manual activada: DeepSeek extrayendo args para propose_post...');
              const dsProvider = createDeepSeek({ apiKey: dsKey });

              // Detectar si el usuario quiere publicacion inmediata
              const userLastMsg = normalizedMessages.filter((m: any) => m.role === 'user').pop();
              const lastMsgText = typeof userLastMsg?.content === 'string' ? userLastMsg.content : JSON.stringify(userLastMsg?.content || '');
              const isInstantSignal = /\b(ahora|ya|lanza|publica|sube|procesa|envia|dispara|publicalo|publicala|procesalo)\b/i.test(lastMsgText);

              const extractionResult = await generateText({
                model: dsProvider('deepseek-chat'),
                system: `Eres un extractor de datos JSON. Analiza la conversación y extrae los campos para un post de redes sociales.
RESPONDE SOLO con JSON válido, sin markdown, sin comentarios adicionales.
Formato exacto:
{
  "content_text": "el copy completo del post (cópialo exactamente desde la conversación)",
  "platforms": ["la o las plataformas explícitamente pedidas por el usuario ej: instagram, linkedin"],
  "media_urls": ["URL completa si la hay en el contexto del sistema, array vacío si no hay"],
  "objective_id": "UUID si aparece en el contexto, null si no",
  "campaign_id": "UUID si aparece en el contexto, null si no"
}
Contexto del sistema (contiene URLs de medios adjuntos si los hay):
${systemPrompt.substring(0, 2500)}`,
                messages: normalizedMessages.slice(-8),
              });

              let extractedText = extractionResult.text.trim()
                .replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

              const extractedArgs = JSON.parse(extractedText);
              console.log('[Donna MO] Args extraídos:', JSON.stringify({ content_length: extractedArgs.content_text?.length, platforms: extractedArgs.platforms, media_count: (extractedArgs.media_urls || []).length }));

              if (extractedArgs.content_text && extractedArgs.platforms?.length > 0) {
                const toolResult = await (tools.propose_post as any).execute({
                  content_text: extractedArgs.content_text,
                  platforms: extractedArgs.platforms,
                  media_urls: (extractedArgs.media_urls || []).filter(Boolean),
                  objective_id: extractedArgs.objective_id || undefined,
                  campaign_id: extractedArgs.campaign_id || undefined,
                  is_instant: isInstantSignal,
                });

                uiAction = { toolActions: [{ tool: 'propose_post', result: toolResult }] };
                if (toolResult.status === 'success') {
                  const fecha = toolResult.scheduled_for
                    ? new Date(toolResult.scheduled_for).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
                    : null;
                  responseText = isInstantSignal
                    ? `🚀 ¡Listo, César! El post entró a la cola de publicación inmediata. Make.com lo despachará en segundos. [ID: ${toolResult.id}]`
                    : `✅ Borrador guardado${fecha ? ` y programado para el **${fecha}**` : ''}. Encuéntralo en */posts* para revisión final. [ID: ${toolResult.id}]`;
                } else {
                  responseText = `⚠️ Hubo un problema guardando el post: ${toolResult.message}`;
                }
                manualOrchestrationSucceeded = true;
                console.log('[Donna MO] ✅ Orquestación Manual exitosa. Tool ejecutado sin Gemini.');
              } else {
                console.warn('[Donna MO] Args insuficientes extraídos (sin content_text o platforms).');
              }
            } catch (moErr: any) {
              console.error('[Donna MO] ❌ Error en Orquestación Manual:', moErr?.message);
            }
          }

          if (!manualOrchestrationSucceeded) {
            console.warn('[Donna API] Gemini agotado y Orquestación Manual falló. Informando al usuario.');
            responseText = `⚠️ Los modelos de Gemini están saturados y la ejecución automática falló.\n\nEspera 20-30 segundos y vuelve a decirme **"publica el post"**. Tu imagen ya está guardada y lista.`;
          }
        } else {
          const dsKey = process.env.DEEPSEEK_API_KEY;
          if (dsKey) {
            try {
              console.warn('[Donna API] Todas las keys de Gemini agotadas. Usando DeepSeek Chat como fallback...');
              const dsProvider = createDeepSeek({ apiKey: dsKey });
              const dsResult = await generateText({
                model: dsProvider('deepseek-chat'),
                system: systemPrompt,
                messages: normalizedMessages,
              });
              responseText = dsResult.text;
              console.log('[Donna API] ✅ Respuesta obtenida vía DeepSeek Chat (fallback).');
            } catch (dsErr: any) {
              console.error('[Donna API] DeepSeek fallback también falló:', dsErr?.message);
            }
          }
        }
      }

    }

    // ── Solo fallar si REALMENTE no hay nada que mostrar
    // IMPORTANTE: uiAction puede ser null pero aún haber toolActions guardadas en DB (propose_post, save_idea)
    // En ese caso, responseText vacío es un falso negativo — las herramientas SÍ se ejecutaron correctamente.
    const hasDbActions = uiAction?.toolActions && uiAction.toolActions.length > 0;
    if (!responseText && !uiAction && !hasDbActions) throw new Error('Las llaves de Gemini están agotadas (rate limit) o el modelo no respondió. Intenta de nuevo en unos segundos.');
    
    // Si no hay texto pero sí acciones de DB, generar un texto de confirmación amigable
    if (!responseText && hasDbActions) {
      const count = uiAction.toolActions.length;
      const successCount = uiAction.toolActions.filter((ta: any) => ta.result?.status === 'success').length;
      responseText = `✅ Listo, César. Guardé ${successCount} borrador${successCount !== 1 ? 'es' : ''} en tu banco de posts. Están en estado *draft_ai* esperando tu revisión en /posts.`;
    }

    // Auto-guardar notas persistentes con regex mejorado para capturar IDs relacionales
    const noteMatch = responseText.match(/<SAVE_NOTE topic="([^"]+)"(?: objective_id="([^"]*)")?(?: campaign_id="([^"]*)")?>([\s\S]+?)<\/SAVE_NOTE>/);
    if (noteMatch) {
      try {
        const topic = noteMatch[1].trim();
        const objective_id = noteMatch[2]?.trim() || null;
        const campaign_id = noteMatch[3]?.trim() || null;
        const content = noteMatch[4].trim();

        await supabase.from('donna_memory').insert({
          topic,
          content,
          objective_id: objective_id && objective_id !== '' ? objective_id : null,
          campaign_id: campaign_id && campaign_id !== '' ? campaign_id : null,
          added_by: 'donna',
        });
        console.log(`[Donna Memory] ✅ Nota guardada relacionalmente: "${topic}" (Obj: ${objective_id}, Camp: ${campaign_id})`);
      } catch (e) {
        console.error('[Donna Memory] Error:', e);
      }
    }

    // Retornar texto + uiAction (si existe)
    return Response.json({ text: responseText, uiAction });

  } catch (error: any) {
    const message = error.message || 'Error desconocido';
    console.error('[Donna API] Error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
