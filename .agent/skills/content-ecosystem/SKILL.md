---
name: content-ecosystem
description: When the user wants to understand, plan, or build upon the Content Ecosystem architecture. Use this when the user mentions "Campaigns", "Objectives", "Content Pillars", "Social Posts relationships", "SEO Cannibalization", or when generating posts that need to be tied to a specific strategic goal. This skill dictates how content MUST be mapped relationally in the database.
metadata:
  version: 1.1.0
---

# Content Ecosystem Orchestration

You are the guardian of the Content Ecosystem Architecture. Your goal is to ensure that no piece of content (Blog or Social Post) is generated or stored without a clear link to the overarching business strategy, while maintaining strict security and data integrity.

## The Core Philosophy: Prevention of Cannibalization & Saturation

1. **La Orquestadora Estratégica (Donna):** Todo el ecosistema está gobernado por Donna, la IA estratégica conectada a Vercel AI SDK. Donna recibe en su System Prompt un **Snapshot en tiempo real de Supabase** (Objetivos, Campañas, y los últimos 15 Artículos de Blog). Usa esta información cruzada para evitar sugerir estrategias repetitivas y asegurar alineación.
2. **SEO Cannibalization Prevention (Blog):** The system must trace which articles target which keywords under which Objectives. If a new article is proposed that overlaps with an existing one within the same Objective, Donna must warn the user and suggest an alternative angle. (Nota: En fases futuras, Donna integrará RAG para consultar dinámicamente el `body` completo de un post si lo requiere).
3. **Social Saturation Prevention (RRSS):** The system tracks the frequency of posts per Campaign. If too many posts for the same sales Campaign are generated sequentially, you must advise the user to interleave value-driven content (Objective-focused without a promotional Campaign). Todos los posts sociales DEBEN etiquetar su campaña o artículo padre para métricas cruzadas.

## The Strategy Planner Layer (The "Where Planning Happens")
*   **Strategy Sessions (`strategy_sessions`)**: This is the visual precursor to the database. Nodes in the planner Represent potential Objectives, Campaigns, or Posts.
*   **Materialization Principle**: Content created in the Planner is **Virtual** until the `materialize_map` tool/button is used. Once materialized, nodes become real records in `objectives`, `campaigns`, and `social_posts`.
*   **Dynamic Linking**: When viewing the planner, the API scans nodes to show real-time stats (e.g., how many real posts exist for a virtual campaign node).

## Data Relational Rules (Supabase)

Whenever you are asked to generate or manage content, you MUST respect this relational hierarchy:

### 1. The Strategic layer (The "Why")
*   **`objectives` (Content Pillars)**: These are the long-term, evergreen pillars of authority (e.g., "Educación Digital"). They rarely change.
*   **`campaigns` (Initiatives/Clusters)**: These are time-bound or specific promotional efforts (e.g., "Lanzamiento ActivaQR Marzo"). A campaign usually belongs to an objective (`objective_id`).

### 2. The Content layer (The "What")
*   **`blog_articles` (Anchor Content)**: Deep, SEO-optimized content.
    *   **Stored in:** MySQL (Published) or Supabase (Drafts).
    *   **BRIDGE:** `article_strategy_map` (Supabase) links MySQL article IDs to `objective_id` and `campaign_id`.
    *   **MUST** be tagged with an `objective_id` via the bridge to count in strategic metrics.
*   **`social_posts` (Distribution Content)**: Micro-content for distribution.
    *   **MUST** link to the `source_article_id` (via the bridge or directly) if it was derived from an article.
    *   **MUST** link to a `campaign_id` if it supports a specific initiative.
    *   **MUST** link to an `objective_id`.
    *   *AI Generation:* Bulk AI generation MUST explicitly assign `campaign_id` and `objective_id`.
    *   *Carousel Protocol:* Instagram posts marked as carousels MUST follow the 8-slide direct response structure.

### 3. The Bridge (The "How")
*   **`article_strategy_map`**: Many-to-Many bridge table in Supabase.
    *   Maps `mysql_article_id` to Supabase `objective_id`.
    *   Allows tagging articles with strategic roles: `pillar`, `support`, `backlink_target`, `lead_magnet`.
    *   Donna uses the `tag_article` tool to manage this relationship.

## 🛡️ Security & Integrity Patterns (V1.1.0)

When expanding the Content Ecosystem, adhere to the following strict rules:

### 1. Soft Deletes (archived_at)
*   Physical deletions (`DELETE FROM ...`) are **prohibited** for `objectives`, `campaigns`, and `social_posts`.
*   Implement Soft Deletion by setting the `archived_at` timestamp column to `NOW()`. 
*   All `GET` queries and API endpoints must filter out archived records by default: `.is('archived_at', null)`.

### 2. Relational Protection (FK Constraints)
*   Foreign Key cascades (`ON DELETE CASCADE`) are restricted to avoid catastrophic data loss. Deleting (soft-deleting) an Objective hides it, but its children's foreign keys remain intact for historical records.

### 3. API Hardening (Mass Assignment)
*   Any `PATCH` or `PUT` endpoint modifying Ecosystem entities MUST implement an explicit whitelist of allowed fields.
*   Restricted intrinsic fields (e.g., `id`, `created_at`, `objective_id` post-creation) must never be updatable by generic payloads.

### 4. Auditing & Logging
*   All systemic interactions within the ecosystem (like cron job processing, errors, and bulk generation results) MUST be logged in the centralized `system_logs` table via `lib/logger.ts`, *not* in local text files.

## Operations & Checklists

### When Generating Social Posts from an Article (or AI):
1. Identify the source `blog_articles` ID or Prompt Context.
2. Ask the user (or read from the UI) what `campaign` or `objective` this post supports.
3. Ensure the generated post objects in the database (`social_posts`) contain the `source_article_id`, `campaign_id`, and `objective_id`.

### When Creating New Content UI:
1. Do not use static `<select>` elements for Campaigns and Objectives.
2. Always implement intelligent "Comboboxes" that allow searching existing entities and inline creation of new ones. This keeps the user in flow.

## Task-Specific Questions to Ask the User
If the user asks to "generate some posts for LinkedIn", you must reply with:
1. "Which existing **Objective** (Content Pillar) does this reinforce?"
2. "Are these posts part of a specific active **Campaign**?"
3. "Are they derived from an existing **Blog Article** in our database?"

Always enforce the strategic data model and security guidelines.
