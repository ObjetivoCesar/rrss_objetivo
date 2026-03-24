---
name: frontend-backend-system
description: Use this skill whenever you are building, modifying, debugging, or auditing any page, API route, component, or service in the RRSS_objetivo application. This is the system's DNA. It contains the exact data models, all API contracts, page-by-page descriptions, and strict rules that MUST be followed to avoid breaking the system. Especially important before adding new features, changing post statuses, or touching anything related to publishing/scheduling.
metadata:
  version: 1.0.0
  last_updated: 2026-03-14
---

# ADN del Sistema: Frontend ↔ Backend

Esta skill describe la arquitectura completa de la aplicación `RRSS_objetivo` (Next.js 14 + Supabase). Es la fuente de verdad técnica que evita regresiones en futuras sesiones.

---

## 1. Stack Base

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Base de Datos | Supabase (PostgreSQL + Auth + Storage) |
| Publicación | Make.com (Webhook universal) |
| CDN Imágenes | Bunny.net / Supabase Storage |
| IA Generativa Bulk | DeepSeek (primary), Google Gemini (backup pool) |
| IA Estratégica (Donna) | Next.js AI SDK (Gemini/DeepSeek) + Supabase Edge Context |
| Autenticación | Ninguna en UI actualmente; cron protegido por `CRON_SECRET` |

---

## 2. Modelo de Datos (Supabase)

### Jerarquía Relacional
```
objectives (pilares estratégicos)
  └── campaigns (iniciativas y campañas)
        └── social_posts (contenido concreto)
```

### Tabla: `objectives`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `name` | text | Nombre del pilar |
| `description` | text | Brief estratégico |
| `emoji` | text | Ej: "🎯" |
| `color` | text | Hex color ej: "#6366f1" |
| `archived_at` | timestamp | NULL = activo, NOT NULL = borrado lógico |
| `created_at` | timestamp | Auto |

### Tabla: `campaigns`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `objective_id` | UUID | FK → objectives |
| `name` | text | Nombre |
| `description` | text | Brief IA |
| `status` | text | 'active' \| 'paused' \| 'completed' |
| `archived_at` | timestamp | Soft delete |
| `created_at` | timestamp | Auto |

### Tabla: `social_posts`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `content_text` | text | Cuerpo del post |
| `platforms` | text[] | ['instagram','facebook','linkedin','tiktok','youtube'] |
| `status` | text | Ver ciclo de vida abajo |
| `scheduled_for` | timestamp | Fecha de publicación objetivo |
| `media_urls` | text[] | URLs de imágenes/videos |
| `campaign_id` | UUID | FK → campaigns (puede ser NULL) |
| `objective_id` | UUID | FK → objectives (puede ser NULL) |
| `category_id` | text | Categoría de contenido (ej: 'educativo') |
| `topic` | text | Nicho de audiencia |
| `target_month` | text | Mes objetivo generación |
| `metadata` | jsonb | youtube_title, linkedin_title, etc. |
| `error_log` | text | Error del scheduler si falló |
| `archived_at` | timestamp | Soft delete |
| `created_at` | timestamp | Auto |

### Tabla: `donna_memory` (Persistencia Estratégica)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `topic` | text | Tema de la nota (ej. 'Tono de Voz') |
| `content` | text | Conclusión o regla guardada |
| `is_active` | boolean | Para soft delete |
| `added_by` | text | Quién lo añadió ('usuario' o 'donna') |
| `objective_id` | UUID | FK → objectives (Migración 04). NULL = nota general |
| `campaign_id` | UUID | FK → campaigns (Migración 04). NULL = nota general |
| `created_at` | timestamp | Auto |

### Tabla: `system_logs`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `service` | text | 'scheduler', 'ai-generator', etc. |
| `severity` | text | 'INFO', 'WARNING', 'ERROR' |
| `message` | text | Mensaje de log |
| `created_at` | timestamp | Auto |

### Tabla: `articles` (Blog & SEO Content Lab) — ⚠️ VIVE EN MYSQL, NO EN SUPABASE
> **IMPORTANTE:** Los artículos publicados del blog `cesarreyesjaramillo.com` se almacenan en una base de datos **MySQL externa** (`mysql.us.stackcp.com:42903`), NO en Supabase. Existe una tabla `articles` legacy en Supabase que **ya no se usa**. Toda lectura/escritura de artículos debe ir a MySQL vía el pool en `src/lib/mysql.ts`.
>
> **Tabla en MySQL:** `wp_posts` (o prefijo detectado automáticamente con `SHOW TABLES LIKE '%_posts'`). Las columnas relevantes son: `ID`, `post_title`, `post_name` (slug), `post_date`, `post_status`, `post_type`.
>
> **⚠️ MySQL es OPCIONAL:** Si la conexión MySQL falla (Vercel no tiene acceso directo al host cPanel), la aplicación debe continuar mostrando datos de Supabase. NUNCA propagar una excepción MySQL sin capturarla.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int | PK auto-incremental |
| `title` | text | Título del artículo |
| `slug` | text | URL amigable |
| `content` | text | Contenido Markdown |
| `excerpt` | text | Resumen SEO |
| `cover_image` | text | URL de imagen de portada |
| `category_id` | text | Categoría slug |
| `meta_description`| text | Para buscadores |
| `published_at` | timestamp | Fecha de publicación |

**APIs relacionadas:**
- `/api/articles/mysql` — GET (listar), PUT (actualizar) artículos en MySQL.
- `/api/seo-publish` — POST (publicar nuevo artículo a MySQL).

### Tabla: `article_strategy_map` (Supabase — Migración 05)
Puente entre artículos de MySQL y el ecosistema de Supabase. Permite mapear qué artículos apoyan qué objetivos y campañas. MANY-TO-MANY.

| Campo | Tipo | Descripción |
|---|---|---|
| `mysql_article_id` | INT | ID del post en WordPress |
| `article_title` | TEXT | Cache del título |
| `article_slug` | TEXT | Cache del slug |
| `objective_id` | UUID | FK → objectives |
| `campaign_id` | UUID | FK → campaigns (nullable) |
| `role` | TEXT | 'pillar' \| 'support' \| 'backlink_target' \| 'lead_magnet' |
| `strategic_notes` | TEXT | Por qué este artículo sirve a este objetivo |

### Tabla: `map_ideas` (Supabase — Migración 06)
Nodos personalizados creados por César en el Cerebro Estratégico: ideas libres, bloques de estructura de contenido, etc. Son los nodos que NO vienen del Supabase estratégico sino que César crea sobre el mapa.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `node_type` | TEXT | 'idea' \| 'h1' \| 'h2' \| 'paragraph' \| 'cta' |
| `label` | TEXT | Texto visible en el nodo |
| `description` | TEXT | Notas adicionales |
| `parent_id` | TEXT | ID del nodo padre (ej: 'obj-uuid', 'camp-uuid') |
| `objective_id` | UUID | FK → objectives (nullable) |
| `campaign_id` | UUID | FK → campaigns (nullable) |
| `pos_x` | FLOAT | Posición X en el canvas |
| `pos_y` | FLOAT | Posición Y en el canvas |
| `archived_at` | TIMESTAMP | Soft delete |

### Tabla: `map_node_positions` (Supabase — Migración 06)
Guarda la posición XY de todos los nodos del mapa (incluyendo objetivos, campañas, artículos) para preservar el layout manual de César entre sesiones.

| Campo | Tipo | Descripción |
|---|---|---|
| `node_id` | TEXT | PK — ID string del nodo (ej: 'obj-uuid', 'art-123') |
| `pos_x` | FLOAT | Posición X persistida |
| `pos_y` | FLOAT | Posición Y persistida |

### Tabla: `strategy_sessions` (Supabase)
Mantiene el estado de las pizarras del **Strategy Planner**.
- **`nodes` (JSONB)**: Contiene el grafo de la pizarra.
- **`objective_id` (VINCULACIÓN DINÁMICA)**: No existe como columna. Las APIs (`/api/campaigns`) parsean el campo `nodes` buscando objetos con `data.type === 'objective'` para extraer el `id` y vincular las campañas creadas en la pizarra con los objetivos de la tabla `objectives`.

---

## 3. Formato Especial: Carrusel Estratégico

El sistema soporta un formato de 8 láminas con estructura de Respuesta Directa:
1. **Lámina 1**: Hook Disruptivo.
2. **Lámina 2-3**: Problema y Agitación.
3. **Lámina 4**: Solución (Producto/Servicio).
4. **Láminas 5-7**: Beneficios/Transformación.
5. **Lámina 8**: CTA Directo.

**Renderizado:** El editor detecta estas láminas mediante regex `/(?=[Ll][ÁáAa]mina \d+:)/i` y las formatea como tarjetas individuales.

---

## 4. Ciclo de Vida de un Post

```
draft_ai  →  pending  →  processing  →  published
                                    ↘  failed
```

| Status | Significado | Quién lo asigna |
|---|---|---|
| `draft_ai` | Borrador de IA, pendiente revisión humana | `lib/ai-generator.ts` al generar |
| `pending` | Aprobado por el usuario, listo para publicar | UI (botón Aprobar) |
| `processing` | Scheduler lo tomó y lo envió a Make | `lib/scheduler.ts` |
| `published` | Make confirmó publicación exitosa (webhook de vuelta) | **⚠️ Pendiente implementar** |
| `failed` | Error en Make o en la API | `lib/scheduler.ts` al capturar excepción |

> **🚨 BUG CONOCIDO:** El Scheduler actualiza el post a `processing` antes de enviar a Make, pero **NUNCA lo actualiza a `published` después del éxito**. Los posts exitosos quedan permanentemente en `processing`. Este bug requiere un webhook de retorno de Make → `/api/posts/publish-confirm` o actualizar el status en el mismo scheduler después del `response.ok`.

---

## 4. Mapa de Páginas Frontend

### `/` — Dashboard / Landing Home (`src/app/page.tsx`)
- **Propósito:** Filtro de Autoridad de César Reyes. Transición de "Hoteles y Restaurantes" a "Reingeniería con IA y Diagnóstico Estratégico".
- **Datos:** Lee directamente de Supabase con clave ANON (no por API)
- **Queries:** `social_posts` (todos los status para KPIs), `campaigns` (con join a objectives y count de posts)
- **⚠️ Falla:** No filtra `archived_at` en la query de campaigns del Dashboard
- **Componentes:** KPI Cards, Estado del Sistema, Próximo Post, Campañas Activas.
- **Rediseño:** Debe alinearse a los 3 Pilares: Análisis Estratégico, Desarrollo Web de Conversión, y Posicionamiento SEO/SEM.

### `/donna` — Punto de Acceso Donna (`src/app/donna/page.tsx`)
- **Estado:** Esta página ahora es un placeholder informativo. 
- **Lógica:** Al montarse, despacha un evento `CustomEvent('open-donna')` para abrir el panel lateral persistente y notifica al usuario que Donna ahora está siempre presente.

### Componentes Globales
- **`Sidebar`:** Navegación principal. Incluye trigger para el panel de Donna.
- **`DonnaChatPanel`:** Componente persistente inyectado en `DashboardLayout`. Maneja chat, audio (Groq) y persistencia de visibilidad en `localStorage`.

### `/posts` — Banco de Publicaciones (`src/app/posts/page.tsx`)
- **Datos:** Lee directamente Supabase con clave ANON (no por API)
- **Acciones:**
  - Aprobar post: Supabase directo → `status: 'pending'`
  - Eliminar post: `/api/posts/delete?id=...` (DELETE) — usa Service Role Key
  - Editar post: `/api/posts/update` (POST) — **⚠️ masa-assignment, ver §6**
  - Trigger manual del Scheduler: `fetch('/api/cron/process')` — **⚠️ Sin Authorization header**
- **Componentes:** `PostCard`, `EditPostModal`, `PostPreview`

### `/calendar` — Calendario de Contenidos (`src/app/calendar/page.tsx`)
- **Datos:** Lee directamente Supabase con clave ANON
- **Features:** FullCalendar (drag & drop para reprogramar), feriados Ecuador 2026
- **Reprogramar:** Supabase directo → `update scheduled_for`
- **⚠️ Falla:** No filtra `archived_at` → mostraría posts archivados si los hay

### `/editor` — Generador Bulk IA (`src/app/editor/page.tsx`)
- **Flujo (4 pasos):** Setup → Mix de plataformas → Generación → Guardar resultados
- **Step 1 Setup:** Carga Objetivos/Campañas de `/api/campaigns` (que ahora incluye mapeo dinámico desde pizarras).
- **Step 3 Generar:** POST a `/api/ai/generate-bulk` con Rate Limit (5 req/min). Envía `objectiveContext` y `campaignStrategy` para alineación total.
- **Step 4 Guardar:** POST a `/api/posts/save-ai-post` — incluye `campaign_id` del contexto seleccionado.
- **Extra:** Ahora integrado con `AiImageGenerator` en Step 4 para crear visuales personalizados.

### `/blog` — SEO Content Lab (`src/app/blog/page.tsx`)
- **Wizard de 3 Pasos:** Keyword Research (Competidores) → Generación de Artículo (Gemini) → Refinamiento y Publicación.
- **Persistence:** Usa `localStorage` para evitar pérdida de progreso.
- **Imagen AI:** Integrado con el Side Panel de `AiImageGenerator`.
- **Destinos:** Publicación directa a sitio externo y guardado en tabla `articles`.

---

## 5. Mapa de Rutas API

### `GET /api/campaigns`
- **Fuente:** `src/app/api/campaigns/route.ts`
- **Retorna:** Array de Objectives con campaigns anidadas y `postsCount`
- **Filtros:** `.is('archived_at', null)` en objectives y campaigns
- **Usa:** `supabase` (ANON key)

### `POST /api/campaigns`
- **Body:** `{ type: 'objective'|'campaign', ...campos }`
- **Para 'objective':** Inserta en tabla `objectives`
- **Para 'campaign':** Inserta en tabla `campaigns` con `objective_id` y `status: 'active'`

### `GET/PATCH/DELETE /api/campaigns/[id]`
- **PATCH:** Whitelist activa. Objetivos: [`name`,`description`,`color`,`emoji`,`archived_at`]. Campaigns: [`name`,`description`,`status`,`objective_id`,`archived_at`]
- **DELETE:** Soft Delete → `update { archived_at: NOW() }`, necesita query param `?type=objective|campaign`

### `POST /api/posts/save-ai-post`
- **Body:** `{ content, targetMonth, topic, platforms, categoryId, media_urls?, status?, campaign_id? }`
- **Calcula:** `scheduled_for` automáticamente via `getOptimalScheduleDate(platforms)`
- **Inserta:** en `social_posts` incluyendo `campaign_id`

### `POST /api/posts/update`  
- **Usa:** `supabaseAdmin` (Service Role Key)
- **⚠️ Mass Assignment:** Propaga todos los campos del body sin whitelist

### `DELETE /api/posts/delete?id=...`
- **Usa:** Service Role Key (hard delete de posts, no soft delete)
- **Nota:** Los posts se borran físicamente, las campaigns no

### `POST /api/ai/generate-bulk`
- **Rate Limit:** 5 req/min por IP.
- **Nuevos Campos:** Recibe `objectiveContext` y `campaignStrategy`.
- **Llama a:** DeepSeek API con prompt estructurado.
- **Carruseles:** Detecta el `categoryId === 'carrusel'` para aplicar el protocolo de 8 láminas.
- **Retorna:** Array JSON de posts con `content`, `imagePrompt`, `platform`, `categoryId`.

### `POST /api/strategy-sessions/[id]/materialize`
- **Fuente:** `src/app/api/strategy-sessions/[id]/materialize/route.ts`
- **Acción:** Escanea los nodos de la pizarra. Crea campañas y posts en Supabase basados en los nodos visuales que el usuario dibujó.

### `POST /api/seo-research`
- **Fuente:** `src/app/api/seo-research/route.ts`
- **Acción:** Realiza búsqueda en Google (via googlethis) y extrae contexto de competidores para el brief de SEO.

### `POST /api/seo-image-generate`
- **Fuente:** `src/app/api/seo-image-generate/route.ts`
- **Acción:** Genera imágenes AI (FLUX.1-schnell via Hugging Face) basadas en un prompt premium.

### `GET /api/cron/process`
- **Auth:** `Authorization: Bearer {CRON_SECRET}` requerido si `CRON_SECRET` está definida
- **Llama a:** `processScheduledPosts()` del scheduler
- **Disparador manual de UI:** No incluye el header de auth → **⚠️ Fallará si CRON_SECRET está configurada**

### `POST /api/chat/route.ts` (Donna AI)
- **Flujo:** Recibe mensajes, inyecta ADN Maestro + Snapshot de Supabase (Objetivos, Campañas, Posts de Blog), y llama a Gemini/DeepSeek vía Vercel AI SDK de forma Síncrona.
- **Automejora:** Lee `donna_memory` en cada request.
- **Artículos MySQL:** Intenta cargar los últimos 15 posts de `wp_posts`. Si MySQL falla, continúa sin ellos.

### `GET /api/strategy-map`
- **Fuente:** `src/app/api/strategy-map/route.ts`
- **Retorna:** `{ nodes, edges, _meta }` — el grafo completo del Cerebro Estratégico
- **Fuentes:** Supabase (objectives, campaigns, social_posts, article_strategy_map) + MySQL opcional (wp_posts)
- **MySQL:** Siempre en un try/catch separado. Si falla, el mapa carga igual con datos Supabase.
- **`_meta`:** `{ objectives, campaigns, articles, posts, mysql_status }` — para debug

### `POST /api/strategy-map/save` _(pendiente implementar)_
- **Body:** `{ ideas: [], positions: {} }`
- **Acción:** Upsert en `map_ideas` + upsert en `map_node_positions`
- **Ideas:** Inserta o actualiza nodos creados por César
- **Positions:** Guarda la posición XY de todos los nodos

### `POST /api/strategy-map/link-article` _(pendiente implementar)_
- **Body:** `{ mysql_article_id, title, slug, objective_id, campaign_id, role, notes }`
- **Acción:** Inserta en `article_strategy_map` para vincular un artículo al ecosistema estratégico

### `POST /api/chat/save-note`
- **Uso:** Endpoint auxiliar de Donna. Cuando ella devuelve la etiqueta `<SAVE_NOTE>`, la UI dispara este endpoint para insertar en `donna_memory`.

---

## 6. Servicios Backend Clave

### `src/lib/scheduler.ts` — Motor de Publicación
**Flujo:**
1. Busca posts con `status='pending'` + `archived_at IS NULL` + `scheduled_for <= NOW()`
2. Actualiza a `status = 'processing'`
3. Construye payload universal para Make (con `media_urls`, `metadata`, `platforms`)
4. POST al Webhook de Make
5. Si Make responde OK → limpia imágenes de Storage  
6. Si Make falla → `status = 'failed'`, guarda `error_log`

**⚠️ Bug Crítico:** Paso 5 NO actualiza el status a `'published'`. El post queda en `'processing'`.

**Logging:** Usa `lib/logger.ts` → tabla `system_logs`

### `src/lib/logger.ts` — Log Centralizado
```typescript
logSystem(service: string, severity: 'INFO'|'WARNING'|'ERROR', message: string)
```
Inserta en tabla `system_logs`. Todos los servicios backend deben usar esto, no `console.log` ni archivos.

### `src/lib/rate-limiter.ts` — Rate Limiting en memoria
```typescript
rateLimit.check(ip: string, limit: number, windowMs: number): boolean
```
In-memory. Se resetea al reiniciar el servidor. Para producción considerar Redis.

### `src/lib/ai-generator.ts` — Generación de Calendario Mensual
- Función `generateMonthlyCalendar(brandContext)` → usa DeepSeek
- Función `saveProposedCalendar(posts[])` → inserta en `social_posts`
- El `GeneratedPost` interface soporta `campaign_id?` y `objective_id?`

---

## 7. Variables de Entorno Requeridas

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=      # Solo para operaciones admin (scheduler, delete)

# Make.com (Publicación)
MAKE_WEBHOOK_URL=               # Webhook universal
MAKE_WEBHOOK_SECRET=            # Validación del payload en Make

# Scheduler
CRON_SECRET=                    # Protege el endpoint /api/cron/process

# IA
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=                 # ej: deepseek-chat o deepseek-reasoner
GOOGLE_AI_API_KEY=              # Gemini (backup/pool)
HUGGINGFACE_ACCESS_TOKEN=       # Para generación de imágenes HF

# Otros
MAKE_API_TOKEN=
MAKE_SCENARIO_WEBHOOK=
```

---

## 8. Reglas de Negocio Inviolables

1. **Nunca borrar físicamente** un `objective` o `campaign`. Usar Soft Delete (`archived_at`).
2. **Los social_posts SÍ se pueden borrar físicamente** (vía `/api/posts/delete`).
3. **Todo GET de objectives/campaigns DEBE filtrar** `.is('archived_at', null)`.
4. **Todo post de IA generado DEBE tener** `campaign_id` asignado si hay contexto de campaña activo.
5. **Toda operación de backend DEBE loguear** via `logSystem()`, nunca `fs.appendFileSync`.
6. **La whitelist de PATCH está activa** para campaigns. No relajar sin auditoría.
7. **Aprobar un post cambia su status a `pending`**, no directamente a `published`.
8. **El Scheduler es el único que debe cambiar status a `processing`** y a `failed`.
9. **No romper la persistencia de Donna:** Cualquier cambio en `DashboardLayout` debe asegurar que `DonnaChatPanel` siga montado para no resetear el historial de la sesión del chat.

---

## 9. Problemas Conocidos y Pendientes

| # | Problema | Impacto | Solución |
|---|---|---|---|
| P1 | Scheduler no actualiza a `published` después del éxito | Posts exitosos quedan en `processing` | Actualizar status tras `response.ok` en scheduler |
| P2 | `/api/posts/update` sin whitelist | Mass assignment en edición manual de posts | Agregar whitelist permitiendo solo `content_text`, `platforms`, `scheduled_for`, `status` |
| P3 | Dashboard y Calendar sin filtro `archived_at` | Pueden mostrar campañas/posts archivados | Agregar `.is('archived_at', null)` en todas las queries directas |
| P4 | Botón "Disparar Scheduler" en UI no envía Authorization header | El cron manual falla si CRON_SECRET está activa | Crear un endpoint proxy `/api/cron/trigger` que añada el header o deshabilitar CRON_SECRET en dev |
| P5 | Rate limiter en memoria se resetea con cada deploy | En producción (serverless) no hay protección persistente | Implementar rate limiting con Redis/Upstash para ambientes serverless |

---

## 10. Flujo Completo: De la Idea a la Publicación

```
[Editor /editor]
   → POST /api/ai/generate-bulk (DeepSeek genera el JSON de posts)
   → POST /api/posts/save-ai-post (guarda como draft_ai con campaign_id)

[Banco /posts]
   → Supabase direct query (lista todos los posts)
   → Botón "Aprobar" → Supabase update status='pending'
   
[Scheduler /api/cron/process]
   → GET /api/cron/process (con Authorization: Bearer CRON_SECRET)
   → lib/scheduler.ts → busca posts con status='pending' y scheduled_for <= NOW()
   → POST make.webhook.com (payload universal)
   → Si OK → borra imágenes del storage (BUG: no actualiza a 'published')
   → Si Error → status='failed' + error_log

[Calendar /calendar]
   → Supabase direct query (visualiza el calendario)
   → Drag & drop → Supabase update scheduled_for
```
