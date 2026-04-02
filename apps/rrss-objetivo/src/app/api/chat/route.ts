import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createClient } from '@/lib/supabase/server';
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
    let marketingContext = '';
    let writingStyle = '';
    let frontendData = '';
    let ecosystemData = '';
    let databaseSchema = '';
    let posicionamientoData = '';
    let urlAtlas = '';
    
    // Atlas de URLs (Docs externos)
    const atlasPath = path.join(process.cwd(), 'docs/estrategia-posicionamiento/matriz_maestra_donna_ai.md');
    if (fs.existsSync(atlasPath)) {
      urlAtlas = fs.readFileSync(atlasPath, 'utf8').substring(0, 8000);
    }
    
    for (const base of basePaths) {
      const mcPath = path.join(base, 'product-marketing-context.md');
      const wsPath = path.join(base, 'Estilo de escritura de César');
      const dbPath = path.join(base, 'database-schema.md');
      
      // Skills base (que están en subcarpetas)
      const fp = path.join(process.cwd(), '../../.agents/skills/frontend-backend-system/SKILL.md');
      const fp2 = path.join(process.cwd(), '.agents/skills/frontend-backend-system/SKILL.md');
      const ep = path.join(process.cwd(), '../../.agents/skills/content-ecosystem/SKILL.md');
      const ep2 = path.join(process.cwd(), '.agents/skills/content-ecosystem/SKILL.md');

      if (!marketingContext && fs.existsSync(mcPath)) marketingContext = fs.readFileSync(mcPath, 'utf8').substring(0, 4000);
      if (!writingStyle && fs.existsSync(wsPath)) writingStyle = fs.readFileSync(wsPath, 'utf8').substring(0, 4000);
      if (!databaseSchema && fs.existsSync(dbPath)) databaseSchema = fs.readFileSync(dbPath, 'utf8').substring(0, 3000);
      
      if (!frontendData && fs.existsSync(fp)) frontendData = fs.readFileSync(fp, 'utf8').substring(0, 4000);
      if (!frontendData && fs.existsSync(fp2)) frontendData = fs.readFileSync(fp2, 'utf8').substring(0, 4000);
      if (!ecosystemData && fs.existsSync(ep)) ecosystemData = fs.readFileSync(ep, 'utf8').substring(0, 3000);
      if (!ecosystemData && fs.existsSync(ep2)) ecosystemData = fs.readFileSync(ep2, 'utf8').substring(0, 3000);

      // Posicionamiento de marca (estrategia SEO/contenidos 2026)
      const pp = path.join(process.cwd(), '../../.agents/skills/posicionamiento-marca/SKILL.md');
      const pp2 = path.join(process.cwd(), '.agents/skills/posicionamiento-marca/SKILL.md');
      if (!posicionamientoData && fs.existsSync(pp)) posicionamientoData = fs.readFileSync(pp, 'utf8').substring(0, 5000);
      if (!posicionamientoData && fs.existsSync(pp2)) posicionamientoData = fs.readFileSync(pp2, 'utf8').substring(0, 5000);
    }
    
    return `=== CONTEXTO DE NEGOCIO Y ESTRATEGIA ===\n${marketingContext || '[No disponible]'}\n
=== ESTRATEGIA DE POSICIONAMIENTO Y CONTENIDOS 2026 ===\n${posicionamientoData || '[No disponible]'}\n
=== MAPA TÉCNICO DE DATOS ===\n${databaseSchema || '[No disponible]'}\n
=== ESTILO DE COMUNICACIÓN ===\n${writingStyle || '[No disponible]'}\n
=== REGLAS TÉCNICAS (SISTEMA) ===\n${frontendData || '[No disponible]'}\n
=== ESTRUCTURA DEL ECOSISTEMA DE CONTENIDO ===\n${ecosystemData || '[No disponible]'}\n
=== ATLAS DE INTERLINKING (RUTAS PILAR 2026) ===\n${urlAtlas || '[No disponible]'}`;
  } catch (e) {
    console.error("Error leyendo ADN:", e);
    return '[Error cargando ADN]';
  }
}

// Genera un Snapshot de tiempo real desde Supabase
async function getContextSnapshot(supabase: any): Promise<string> {
  try {
    const { data: objectives } = await supabase
      .from('objectives')
      .select('id, name, description')
      .is('archived_at', null)
      .limit(10);

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
    
    return snapshot;
  } catch (error) {
    console.error("Error cargando Snapshot:", error);
    return '=== SNAPSHOT DB: Error al cargar contexto de DB ===';
  }
}

function buildSystemPrompt(memoryStr: string, hasTools: boolean = true): string {
  let prompt = `Eres **Donna**, la Directora Estratégica del ecosistema digital de ActivaQR y César Reyes.
No eres un asistente genérico — eres una colega intelectual de alto nivel con acceso al ADN del sistema.

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
Tienes herramientas nativas (create_objective, manage_campaign, propose_post, pilot_editor, read_article_content, tag_article, generate_strategy_map). Úsalas EXCLUSIVAMENTE mediante la invocación nativa (Tool Calling).
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
`;

  return prompt;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, provider = 'gemini' } = body;

    const supabase = await createClient();
    logger.info('Donna Chat Request', { provider, messageCount: messages.length });

    let memoryStr = '(Sin notas estratégicas aún)';
    let snapshotStr = '=== SNAPSHOT DE LA BASE DE DATOS ===\n(No disponible)';

    if (supabase) {
      try {
        const { data } = await supabase
          .from('donna_memory')
          .select('topic, content')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(20);
        if (data && data.length > 0) {
          memoryStr = data.map((d: any) => `• [${d.topic}]: ${d.content}`).join('\n');
        }
        snapshotStr = await getContextSnapshot(supabase);
      } catch (err) {
        logger.error('[Donna] Error cargando contexto inicial', err);
      }
    }

    const systemPrompt = `${buildSystemPrompt(memoryStr, provider !== 'deepseek')}\n\n${snapshotStr}`;
    
    // FILTRO ANTI-COLAPSO: Tomamos solo los últimos 8 mensajes del historial
    // para no explotar el Token-Limit de Gemini, ya que cada mensaje es largo.
    const recentMessages = messages.slice(-8);
    const normalizedMessages = recentMessages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

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
      // @ts-ignore
      manage_campaign: tool({
        description: 'Crea, modifica o elimina (archiva) una campaña en la base de datos. Para CREATE es OBLIGATORIO pasar name y objective_id (del snapshot).',
        parameters: jsonSchema<{
          action: 'create' | 'update' | 'delete';
          id?: string;
          name?: string;
          description?: string;
          objective_id?: string;
          expected_posts?: number;
          status?: string;
        }>({
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['create', 'update', 'delete'], description: 'La acción a realizar: create, update o delete' },
            id: { type: 'string', description: 'ID de la campaña (requerido para update y delete)' },
            name: { type: 'string', description: 'Nombre de la campaña (REQUERIDO para create)' },
            description: { type: 'string', description: 'Descripción o brief estratégico de la campaña' },
            objective_id: { type: 'string', description: 'ID UUID del objetivo pilar al que pertenece (REQUERIDO para create — obtenerlo del SNAPSHOT de la DB)' },
            expected_posts: { type: 'number', description: 'Cantidad de posts esperados' },
            status: { type: 'string', enum: ['active', 'paused', 'completed'], description: 'Estado de la campaña' },
          },
          required: ['action'],
        }),
        // @ts-ignore
        execute: async ({ action, id, name, description, objective_id, expected_posts, status }: {
          action?: 'create' | 'update' | 'delete';
          id?: string;
          name?: string;
          description?: string;
          objective_id?: string;
          expected_posts?: number;
          status?: string;
        }) => {
          if (!action) {
            if (name && objective_id) action = 'create';
            else if (id && !name) action = 'delete';
            else if (id) action = 'update';
            else action = 'create'; // Fallback final
          }
          
          console.log(`[Donna Tool] Ejecutando manage_campaign: action=${action} | name=${name} | objective_id=${objective_id} | id=${id}`);
          
          if (action === 'create') {
            if (!name) {
              console.error('[Donna Tool] manage_campaign CREATE: falta el campo name');
              return { status: 'error', message: 'No se puede crear la campaña: falta el nombre.' };
            }
            if (!objective_id) {
              console.error('[Donna Tool] manage_campaign CREATE: falta objective_id');
              return { status: 'error', message: 'No se puede crear la campaña: falta el ID del objetivo pilar. Usa el SNAPSHOT para obtenerlo o crea primero un objetivo con create_objective.' };
            }
            const insertData: any = { name, objective_id, status: status || 'active' };
            if (description) insertData.description = description;
            if (expected_posts) insertData.expected_posts = expected_posts;
            
            const { data, error } = await supabase
              .from('campaigns')
              .insert([insertData])
              .select()
              .single();
            if (error) {
              console.error('[Donna Tool] manage_campaign CREATE Supabase error:', error);
              return { status: 'error', message: `Error de base de datos: ${error.message}` };
            }
            console.log(`[Donna Tool] ✅ Campaña creada con ID: ${data.id}`);
            return { status: 'success', id: data.id, action: 'create', message: `Campaña "${name}" creada correctamente en el objetivo ${objective_id}.` };
          } 
          
          if (action === 'update') {
            if (!id) return { status: 'error', message: 'ID de campaña requerido para actualizar.' };
            const updates: any = {};
            if (name) updates.name = name;
            if (description !== undefined) updates.description = description;
            if (objective_id) updates.objective_id = objective_id;
            if (expected_posts !== undefined) updates.expected_posts = expected_posts;
            if (status) updates.status = status;
            
            const { data, error } = await supabase
              .from('campaigns')
              .update(updates)
              .eq('id', id)
              .select()
              .single();
            if (error) {
              console.error('[Donna Tool] manage_campaign UPDATE Supabase error:', error);
              return { status: 'error', message: `Error actualizando campaña: ${error.message}` };
            }
            return { status: 'success', id: data.id, action: action, message: `Campaña actualizada correctamente.` };
          }
          
          if (action === 'delete') {
            if (!id) return { status: 'error', message: 'ID de campaña requerido para archivar.' };
            // Protocolo de eliminación: Soft Delete
            const { data, error } = await supabase
              .from('campaigns')
              .update({ status: 'archived', archived_at: new Date().toISOString() })
              .eq('id', id)
              .select()
              .single();
            if (error) {
              console.error('[Donna Tool] manage_campaign DELETE Supabase error:', error);
              return { status: 'error', message: `Error archivando campaña: ${error.message}` };
            }
            return { status: 'success', id: data.id, action: action, message: `Campaña archivada (soft delete) correctamente según el protocolo.` };
          }
          
          return { status: 'error', message: `Acción desconocida: ${action}` };
        },
      }),
      // @ts-ignore
      propose_post: tool({
        description: 'Propone un borrador de post (draft_ai) para que César lo revise en /posts. SIEMPRE usa draft_ai - nunca saltarse la revisión humana.',
        parameters: jsonSchema<{
          content: string;
          platforms: string[];
          campaign_id?: string;
          objective_id?: string;
          scheduled_for?: string;
        }>({
          type: 'object',
          properties: {
            content: { type: 'string', description: 'El texto completo del post (copy)' },
            platforms: { type: 'array', items: { type: 'string' }, description: 'Lista de plataformas (ej. ["instagram", "linkedin"])' },
            campaign_id: { type: 'string', description: 'ID de la campaña vinculada (del snapshot)' },
            objective_id: { type: 'string', description: 'ID del objetivo o pilar estratégico vinculado' },
            scheduled_for: { type: 'string', description: 'Fecha ISO 8601 deseada de publicación' },
          },
          required: ['content', 'platforms'],
        }),
        // @ts-ignore
        execute: async ({ content, platforms, campaign_id, objective_id, scheduled_for }: { 
          content: string, platforms: string[], campaign_id?: string, objective_id?: string, scheduled_for?: string
        }) => {
          console.log(`[Donna Tool] Ejecutando propose_post para: ${platforms.join(',')}`);
          const { data, error } = await supabase
            .from('social_posts')
            .insert([{ 
              content_text: content,
              platforms,
              campaign_id: campaign_id || null,
              objective_id: objective_id || null,
              status: 'draft_ai', // SIEMPRE borrador — el humano aprueba
              scheduled_for: scheduled_for || new Date().toISOString(),
            }])
            .select('id, status')
            .single();
          if (error) throw error;
          return { 
            status: 'success', 
            id: data.id, 
            message: `Borrador guardado en /posts con status draft_ai. César debe aprobarlo antes de publicar.` 
          };
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
    };

    let responseText = '';
    let uiAction: any = null;

    // ── Detección de intención: el usuario quiere GENERAR el mapa visual
    // IMPORTANTE: excluir URLs y mensajes donde 'strategy-planner' aparece como link, no como intención
    const lastUserMessage = [...normalizedMessages].reverse().find(m => m.role === 'user');
    const lastText = (lastUserMessage?.content || '').toLowerCase();
    // Remover URLs para evitar falsos positivos (ej: "ver en /strategy-planner" ≠ "generar el mapa")
    const lastTextNoUrls = lastText.replace(/https?:\/\/\S+|(\/strategy-[a-z-]+)/g, '');
    const wantsStrategyMap = [
      'genera el mapa', 'créa el mapa', 'crea el mapa', 'crea el flujo',
      'generar el flujo', 'genera el flujo', 'genera el mapa estratégico', 'crea el mapa estratégico',
      'flujo visual', 'hazlo visual', 'plasmar', 'plasmarlo',
      'flujo de trabajo visual', 'cargar al canvas', 'cargar en el canvas',
      'cargar al planner', 'cargar en el planner',
      'mapa de esto', 'flujo de esto', 'convierte en flujo',
    ].some(kw => lastTextNoUrls.includes(kw));

    console.log(`[Donna Intent] wantsStrategyMap=${wantsStrategyMap} | text="${lastTextNoUrls.substring(0, 100)}"`);

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

    const modelOptions: any = {
      system: systemPrompt,
      messages: normalizedMessages,
      tools,
      maxSteps: 5,
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
            ['create_objective', 'manage_campaign', 'propose_post', 'tag_article'].includes(r.toolName)
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
              const successActions = toolActions.filter((ta: any) => ta.result?.status === 'success');
              const errorActions = toolActions.filter((ta: any) => ta.result?.status === 'error');
              if (successActions.length > 0) {
                responseText = successActions.map((ta: any) => ta.result?.message || 'Hecho.').join(' ');
              } else if (errorActions.length > 0) {
                responseText = `Hubo un problema: ${errorActions.map((ta: any) => ta.result?.message).join('. ')}`;
              } else {
                responseText = 'Acción ejecutada.';
              }
            }
          }

          geminiSucceeded = true;
          break;
        } catch (err: any) {
          console.warn(`[Donna API] Gemini Key ${i + 1} falló. Razón:`, err?.message || err);
          const isQuotaError = err?.statusCode === 429 || err?.message?.includes('quota') || err?.message?.includes('exhausted') || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
          const isModelError = err?.statusCode === 404 || err?.message?.includes('NOT_FOUND') || err?.message?.includes('not found') || err?.message?.includes('not supported');
          if (isQuotaError || isModelError) {
            console.warn(`[Donna API] Key ${i + 1} saltada (${isQuotaError ? 'cuota/rate-limit' : 'modelo no disponible'})`);
            continue;
          }
          console.error('[Donna API] Error inesperado con Key', i + 1, ':', err?.message);
          throw err;
        }
      }

      // ── Fallback a DeepSeek Chat (rápido) cuando todas las keys de Gemini están agotadas
      if (!geminiSucceeded && !responseText) {
        const dsKey = process.env.DEEPSEEK_API_KEY;
        if (dsKey) {
          try {
            console.warn('[Donna API] Todas las keys de Gemini agotadas. Usando DeepSeek Chat como fallback...');
            const dsProvider = createDeepSeek({ apiKey: dsKey });
            const dsResult = await generateText({
              model: dsProvider('deepseek-chat'), // ← Chat, no Reasoner (más rápido)
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

    // ── Solo fallar si REALMENTE no hay nada que mostrar
    if (!responseText && !uiAction) throw new Error('Las llaves de Gemini están agotadas (rate limit) o el modelo no respondió. Intenta de nuevo en unos segundos.');

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
