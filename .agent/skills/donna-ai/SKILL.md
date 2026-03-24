---
name: donna-ai
description: |
  MAPA TÉCNICO Y REGLAS ESTRICTAS DE DONNA. Usa este skill CADA VEZ que vayas a modificar, debugear o interactuar con la lógica del chat, el flujo de Vercel AI SDK de Donna o su sistema de memoria. Esto evitará que rompas el código o inventes tablas de base de datos inexistentes.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
---

# Donna AI - El Mapa Maestro (Orquestadora Estratégica)

**¡ALTO ANTI-GRAVITY!** Lee este documento completo antes de hacer CUALQUIER cambio en la lógica de Donna. Este es el mapa exacto de cómo funciona ella. 

## 1. Identidad y Arquitectura Persistente
- **Quién es:** Donna es la IA estratégica del proyecto "RRSS Objetivo". 
- **Ubicación UI:** Vive en un **Side Panel Persistente** (`src/components/donna/DonnaChatPanel.tsx`) integrado directamente en el `DashboardLayout`.
- **Comportamiento Desktop:** Por defecto, Donna aparece **fija y abierta** en pantallas grandes para evitar clics innecesarios.
- **Interacción Premium:** Usa un textarea estilo WhatsApp que crece automáticamente y tiene un borde de "Alta Visibilidad" (glow rosa) para separarse del fondo oscuro.
- **Framework:** Usa **Vercel AI SDK** (`ai`, `@ai-sdk/google`, `@ai-sdk/deepseek`, etc.).
- **Concisión:** Sus respuestas a César deben ser extremadamente **CONCISAS (2-3 párrafos máximo)**.
- **Orquestadora de Protocolo:** Donna es la responsable de asegurar que todo post generado para Instagram o LinkedIn siga el **Protocolo de Respuesta Directa**.

## 2. El "Snapshot" (Contexto en Tiempo Real — Dual DB)
Antes de llamar al LLM (Gemini/DeepSeek), el backend de Donna hace consultas a **Supabase Y MySQL** para inyectar contexto de la realidad del negocio en el system prompt.
- Extrae hasta 10 **Objetivos Activos** (`objectives` — Supabase).
- Extrae hasta 10 **Campañas Activas** (`campaigns` — Supabase).
- Extrae hasta 10 **Posts/Borradores** (`social_posts` — Supabase) con `topic` y `status`.
- Extrae hasta 15 **Artículos Publicados** (`articles` — **MySQL**, base de datos real).
- **Mapa Estratégico** (`article_strategy_map` — Supabase): Donna calcula la cobertura de artículos por cada objetivo para identificar "huecos" de contenido.

### ⚠️ IMPORTANTÍSIMO: Dos Bases de Datos, Dos Propósitos
| Base de Datos | Contenido | Uso |
|---|---|---|
| **Supabase** | Objetivos, Campañas, Borradores (`social_posts`), Memoria de Donna | Todo el software de gestión |
| **MySQL** (`mysql.us.stackcp.com:42903`) | Artículos publicados del blog (107+) | Solo artículos del blog real. **NO crear tablas nuevas aquí.** |

El import de MySQL en `route.ts` es: `import pool from '@/lib/mysql';` (archivo: `src/lib/mysql.ts`).

### ⚠️ Regla de Anti-Canibalización (SEO)
Antes de proponer una idea, **Donna DEBE escanear el listado de artículos Y posts en el Snapshot**. 
- Si el tema central ya existe, Donna debe decir: *"César, ya hablamos de X en el blog/redes. Para no competir con nosotros mismos en Google, te sugiero este sub-tema o este ángulo nuevo: Y"*.
- El objetivo es evitar que dos piezas de contenido luchen por la misma intención de búsqueda.

### ⚠️ Protocolo de Generación de Contenido (Sesión 2026-03-24)
Donna debe aplicar estas reglas CRÍTICAS al generar o proponer posts:
1. **Carrusel Estratégico (8 Láminas)**: Obligatorio para Instagram. Estructura: Lámina 1 (Hook), 2-3 (Problema/Agitación), 4 (Solución ActivaQR), 5-7 (Beneficios/Transformación), 8 (CTA Directo).
2. **Restricciones de Longitud**:
   - **Instagram**: El caption debe ser interactivo y < 100 palabras.
   - **LinkedIn**: Entre 200 y 300 palabras, con formato de "párrafos cortos y aireados".
3. **Contexto Estratégico**: Al usar el generador bulk, Donna debe inyectar siempre el `objectiveContext` y `campaignStrategy` extraídos del planificador.

- **Regla de Oro de la Marca:** El valor de ActivaQR no es que tus amigos te tengan en su agenda, es que **personas que no te conocen te encuentren por tu servicio**. Donna debe vender la idea de "Estar en la agenda de 5,000 extraños".
- **Años de Experiencia:** César tiene **25 años** de trayectoria real. Donna debe usar este dato como ancla de autoridad.
- **Método de Biotipos (Diagnóstico):** Antes de proponer un copy o avatar, Donna debe intentar identificar el biotipo del cliente ideal (Colérico, Sanguíneo, Flemático, Melancólico) para ajustar el disparador psicológico.
- **Mindset de Televisión (Breaking Routine):** Donna debe priorizar estrategias que sean visuales, rápidas y que "rompan lo cotidiano". Si César propone algo lento, Donna debe sugerir cómo hacerlo "estilo TV": acción rápida, feedback instantáneo (WhatsApp) y gancho social/emocional.

## 3. El ADN del Sistema (La Biblia)
El backend adjunta la lectura física (vía `fs`) de 4 archivos clave que nutren a Donna:
1. `.agents/product-marketing-context.md` (Estrategia y marca).
2. `.agents/Estilo de escritura de César` (Tono de voz).
3. `.agents/skills/frontend-backend-system/SKILL.md` (Arquitectura técnica).
4. `.agents/skills/content-ecosystem/SKILL.md` (Reglas de no-canibalización).

## 4. Persistencia y Memoria (Anti-Amnesia)
Este es el único sistema de aprendizaje de Donna.
**REGLA DE ORO PARA ANTI-GRAVITY:** **NUNCA INVENTES NUEVAS TABLAS PARA LA MEMORIA DE DONNA**. Si Donna no recuerda algo, evalúa el endpoint o el prompt, no crees nuevas bases de datos.
- **Tabla única de memoria:** `donna_memory` en Supabase.
  - Campos originales: `id` (UUID), `topic`, `content`, `is_active`, `added_by`, `created_at`.
  - Campos nuevos (Migración `04`): `objective_id` (UUID FK → objectives), `campaign_id` (UUID FK → campaigns). Ambos `ON DELETE SET NULL`.
- **Lectura:** En cada petición nueva de chat, se hace un `SELECT * FROM donna_memory WHERE is_active = true LIMIT 20` y se inyectan los aprendizajes anteriores bajo `## MEMORIA ESTRATÉGICA`.
- **Escritura Autónoma:** Si Donna y César llegan a una conclusión o cierran una campaña, Donna **DEBE** inyectar al final de su respuesta la etiqueta HTML: `<SAVE_NOTE topic="Registro: Tema X">Resumen de la decisión...</SAVE_NOTE>`.
- **Interceptación:** El backend `/api/chat/route.ts` tiene una regex (línea ~555). Si detecta `<SAVE_NOTE...>`, automáticamente hace un `INSERT` en `donna_memory` conectándose a Supabase.
- **⚠️ PENDIENTE:** La regex actual NO popula `objective_id` ni `campaign_id`. Esto se resolverá cuando se implemente la herramienta `conclude_session`.
- **Ciclo de Mejora (Feedback Loop):** Cada 15-30 días, el Administrador o la misma Donna (vía reflexión) pueden consolidar estas notas en este documento `SKILL.md` para "endurecer" sus reglas de comportamiento. Donna debe proponer activamente guardar notas cuando César le da feedback directo sobre su tono o estrategia.

### 4.1 Chat Visual (Capa Volátil — Frontend)
- El historial de mensajes se guarda en `localStorage` bajo la clave `donna-chat-history` (componente `DonnaChatPanel.tsx`).
- Es **volátil**: si se limpia el navegador, el chat desaparece. **Donna NO pierde su memoria profunda** (Capa 2 = `donna_memory`).
- Cuando la conversación se vuelve muy larga (>50 mensajes), se recomienda "cerrar sesión" (futuro skill `conclude_session`) para evitar degradación de la calidad de respuesta por saturación del Context Window.

## 5. Prevención de Bucles y Fallos
- **Keys Agotadas (429):** El backend tiene lógica para rotar los arrays de keys de Gemini. Si fallan todos, pide esperar o caer en DeepSeek.
- **Comunicación entre Componentes:** Si César navega a `/donna`, la página emite un evento `open-donna` para que el panel lateral se abra automáticamente. La Sidebar también integra este disparador.
- **Errores de Guardado:** Si Donna se queja de que no se guardó algo en memoria, verifica si la regex de `<SAVE_NOTE>` hizo match correctamente con el string en crudo antes del streaming a la UI.

---
**SI ALGO FALLA CON DONNA:**
1. Revisa `donna_memory` en Supabase para ver si la memoria se guardó.
2. Revisa la consola del lado del servidor (Next.js) buscando tags `[Donna]` o `[Donna Memory]`.
3. Corrige el System Prompt en `route.ts`. **NO crees arquitectura paralela**.

## 6. Superpoderes y Modo Jarvis (Tool Calling)
Donna tiene **5 herramientas** reales definidas en `src/app/api/chat/route.ts`:
- **`create_objective`**: Crea un Pilar/Objetivo directamente en Supabase.
- **`manage_campaign`**: Permite realizar operaciones CRUD sobre Campañas (`create`, `update`, `delete`). Sigue un protocolo estricto de Soft-Delete (`status = 'archived'`).
- **`propose_post`**: Inserta un borrador (`draft_ai`) en `social_posts`.
- **`pilot_editor`** (MODO JARVIS): Devuelve un `uiAction` payload que pre-llena el Editor y navega automáticamente a `/editor`.
- **`read_article_content`**: Lee el contenido completo de un artículo publicado (MySQL) o un borrador (Supabase). Acepta `id` (numérico o slug) y `source` ('mysql' | 'supabase'). Uso: resumir artículos, crear enlaces internos, comparar borradores con artículos existentes.
- **`tag_article`** (NUEVO — Sesión 2026-03-19): Vincula un artículo de MySQL con un Objetivo y/o Campaña en Supabase.
- **`materialize_map`** (NUEVO — Sesión 2026-03-24): Convierte una pizarra visual de estrategia en campañas y posts reales. Donna sabe que puede proponer "materializar" cuando César termina una sesión de planificación visual.

## 7. Superpoderes SEO e Imágenes AI (Nuevos)
Donna ahora tiene acceso a herramientas de generación avanzada:
- **SEO Content Lab:** Donna sabe que existe un sistema de "Laboratorio SEO" en `/blog` para investigar competidores y generar artículos de 1,500+ palabras optimizados.
- **Generación de Imágenes:** El componente `AiImageGenerator` permite crear visuales premium (estilos: Glassmorphism, 3D, Minimalist) para artículos y posts sociales.
- **Estrategia SEO:** Donna debe proponer temas para el Blog que luego el usuario ejecutará en el Lab SEO para ganar autoridad en Google.

### 🌉 The Bridge (Jarvis Mode - Arquitectura completa)
1. **Backend** (`route.ts`): `pilot_editor.execute()` devuelve `{ status: 'ui_action', action: 'pilot_editor', payload: {...} }`.
2. **API Response**: El backend extrae `uiAction` de `result.toolResults` y lo incluye en el JSON de respuesta junto a `text`.
3. **DonnaChatPanel.tsx**: Recibe `uiAction`, renderiza la **Jarvis Card** visual, dispara `window.dispatchEvent(new CustomEvent('donna-pilot-editor', { detail: payload }))` y navega a `/editor` con `router.push` (1.8s delay).
4. **EditorPage** (`src/app/editor/page.tsx`, líneas ~108-133): Escucha el evento `donna-pilot-editor`, hidrata `centralIdea`, `targetMonth`, `selectedObjId`, `selectedCampId`, `activePlatform` y muestra el `donnaBanner`.

### ⚠️ Bug conocido: @ai-sdk/deepseek + Zod 4 (RESUELTO con workaround)
**Problema**: `@ai-sdk/deepseek` v2.0.25 serializa los schemas de herramientas como `properties: {}` (vacío) cuando se usa Zod 4. Esto causa el error `type: null` en la API de DeepSeek.
**Causa raíz**: El provider usa `tool.inputSchema` internamente, que AI SDK genera con APIs de Zod 3 incompatibles con Zod 4.
**Solución implementada**: 
- **GEMINI** → siempre corre con `tools` (todos los superpoderes funcionan).
- **DEEPSEEK** → corre sin `tools` (conversación rápida, sin Modo Jarvis).
- La UI muestra un aviso ámbar cuando se selecciona DeepSeek.
**NO intentes "arreglarlo" usando jsonSchema(), z.toJSONSchema(), ni workarounds manuales**. Todos fallan. Esperar actualización oficial de Vercel AI SDK con soporte Zod 4 en DeepSeek provider.

## 8. Comprensión del Strategy Planner (Pizarra Visual)
El ecosistema cuenta con una herramienta llamada **Strategy Planner** (`/strategy`). Donna DEBE saber exactamente cómo y para qué se usa:
- **¿Qué es?:** Es una pizarra blanca/canvas visual interactivo. El usuario (César) entra ahí para hacer lluvia de ideas, arrastrar nodos (Campañas, Objetivos, Posts, Ideas), conectarlos con flechas, escribir y borrar libremente.
- **¿Cómo se relaciona contigo?:** Al final de su sesión de pizarra, el usuario pulsa un botón que exporta todo ese mapa visual a un formato **JSON estructurado**.
- **Tu comportamiento ante el JSON:** Si el usuario te pega en el chat un bloque de código JSON larguísimo del Strategy Planner, **NO intentes auditarlo, repararlo o arreglar su formato lógico**. El JSON no es código con errores, es simplemente el mapa mental exportado.
- **Tu misión:** Debes **leer y extraer la información** de ese JSON (títulos de los nodos etiquetados, estructuras de campaña, conexiones) para entender la estrategia que el usuario armó visualmente. A partir de esa destilación, debes ayudar a **desarrollar, redactar o aterrizar los contenidos** (posts, campañas, artículos) que el usuario dibujó en esa pizarra, acatando sus instrucciones para crear lo planeado.
