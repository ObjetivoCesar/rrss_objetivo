import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import pool from '@/lib/mysql';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ─── Helper: Auto-detect the WordPress posts table prefix ──────────────────────
// Some cPanel hosts use 'wp_posts', others use a custom prefix like 'hp_posts'.
async function findWpPostsTable(): Promise<string> {
  const [tables]: any = await pool.query(
    "SHOW TABLES LIKE '%_posts'"
  );
  if (tables.length === 0) throw new Error('No WordPress posts table found in MySQL');
  // Prefer 'wp_posts', otherwise use the first match
  const tableNames: string[] = tables.map((row: any) => Object.values(row)[0] as string);
  return tableNames.find((t) => t === 'wp_posts') ?? tableNames[0];
}

export async function GET() {
  try {
    // ─── 1. Supabase: Fetch Strategic Data (REQUIRED) ──────────────────────────
    const [
      { data: objectives, error: objError },
      { data: campaigns, error: campError },
      { data: articleMap, error: artError },
      { data: posts, error: postError },
    ] = await Promise.all([
      supabase.from('objectives').select('id, name, description').is('archived_at', null),
      supabase.from('campaigns').select('id, name, objective_id, status').is('archived_at', null),
      supabase.from('article_strategy_map').select('id, mysql_article_id, article_title, article_slug, objective_id, campaign_id, role, strategic_notes'),
      supabase.from('social_posts').select('id, topic, platforms, status, campaign_id, objective_id, scheduled_for').not('status', 'eq', 'published').order('scheduled_for', { ascending: true }).limit(60),
    ]);

    // Supabase errors are blocker — surface them clearly
    if (objError) throw new Error(`Supabase objectives: ${objError.message}`);
    if (campError) throw new Error(`Supabase campaigns: ${campError.message}`);
    if (artError) throw new Error(`Supabase article_strategy_map: ${artError.message}`);
    if (postError) throw new Error(`Supabase social_posts: ${postError.message}`);

    // ─── 2. MySQL: Fetch Blog Articles (OPTIONAL — graceful fallback) ──────────
    let mysqlArticles: { id: number; title: string; slug: string }[] = [];
    let mysqlStatus = 'ok';
    try {
      const postsTable = await findWpPostsTable();
      const [rows]: any = await pool.query(
        `SELECT ID as id, post_title as title, post_name as slug
         FROM \`${postsTable}\`
         WHERE post_type = 'post' AND post_status = 'publish'
         ORDER BY post_date DESC
         LIMIT 100`
      );
      mysqlArticles = rows as any[];
      console.log(`[strategy-map] Loaded ${mysqlArticles.length} articles from MySQL table: ${postsTable}`);
    } catch (mysqlErr: any) {
      // MySQL is optional — we just log a warning and continue
      mysqlStatus = mysqlErr.message;
      console.warn('[strategy-map] MySQL unavailable, continuing without blog articles:', mysqlErr.message);
    }

    // ─── 3. Build React Flow Graph ─────────────────────────────────────────────
    const nodes: any[] = [];
    const edges: any[] = [];
    const rootId = 'root';

    nodes.push({
      id: rootId,
      type: 'rootNode',
      data: { label: 'Cerebro Estratégico' },
      position: { x: 0, y: 0 },
    });

    // OBJECTIVE NODES
    (objectives ?? []).forEach((obj) => {
      nodes.push({
        id: `obj-${obj.id}`,
        type: 'objectiveNode',
        data: { label: obj.name, description: obj.description, raw: obj },
        position: { x: 0, y: 0 },
      });
      edges.push({
        id: `e-root-obj-${obj.id}`,
        source: rootId,
        target: `obj-${obj.id}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#7c3aed', strokeWidth: 2 },
      });
    });

    // CAMPAIGN NODES
    (campaigns ?? []).forEach((camp) => {
      nodes.push({
        id: `camp-${camp.id}`,
        type: 'campaignNode',
        data: { label: camp.name, status: camp.status, raw: camp },
        position: { x: 0, y: 0 },
      });
      const parentId = camp.objective_id ? `obj-${camp.objective_id}` : rootId;
      edges.push({
        id: `e-${parentId}-camp-${camp.id}`,
        source: parentId,
        target: `camp-${camp.id}`,
        type: 'smoothstep',
        style: { stroke: '#f59e0b', strokeWidth: 1.5 },
      });
    });

    // ARTICLE NODES — merge MySQL + Supabase mappings
    const uniqueArticles = new Map<number, { id: number; title: string; slug: string; mappings: any[] }>();

    // Seed with MySQL articles (no mapping yet)
    mysqlArticles.forEach((art) => {
      uniqueArticles.set(Number(art.id), { id: Number(art.id), title: art.title, slug: art.slug, mappings: [] });
    });

    // Overlay Supabase mappings (may reference articles not in MySQL if MySQL is down)
    (articleMap ?? []).forEach((entry) => {
      const aid = Number(entry.mysql_article_id);
      if (!uniqueArticles.has(aid)) {
        uniqueArticles.set(aid, {
          id: aid,
          title: entry.article_title ?? `Artículo #${aid}`,
          slug: entry.article_slug ?? '',
          mappings: [],
        });
      }
      uniqueArticles.get(aid)!.mappings.push(entry);
    });

    uniqueArticles.forEach((article) => {
      const artNodeId = `art-${article.id}`;
      nodes.push({
        id: artNodeId,
        type: 'articleNode',
        data: { label: article.title, slug: article.slug, mappings: article.mappings, id: article.id },
        position: { x: 0, y: 0 },
      });

      if (article.mappings.length > 0) {
        article.mappings.forEach((m: any) => {
          const sourceNodeId = m.campaign_id ? `camp-${m.campaign_id}`
            : m.objective_id ? `obj-${m.objective_id}`
            : rootId;
          edges.push({
            id: `e-${sourceNodeId}-${artNodeId}-${m.id}`,
            source: sourceNodeId,
            target: artNodeId,
            type: 'smoothstep',
            label: m.role ?? undefined,
            labelStyle: { fontSize: 10, fill: '#94a3b8' },
            style: { stroke: '#10b981', strokeWidth: 1.5 },
          });
        });
      } else {
        // Orphan article: dashed red line to root
        edges.push({
          id: `e-orphan-root-${artNodeId}`,
          source: rootId,
          target: artNodeId,
          type: 'smoothstep',
          style: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '5,5' },
        });
      }
    });

    // POST NODES
    (posts ?? []).forEach((post) => {
      const postNodeId = `post-${post.id}`;
      const platformList: string[] = post.platforms ?? [];
      nodes.push({
        id: postNodeId,
        type: 'postNode',
        data: {
          label: post.topic ?? '(sin tema)',
          platform: platformList.join(', ') || 'social',
          status: post.status,
          publishAt: post.scheduled_for,
          raw: post,
        },
        position: { x: 0, y: 0 },
      });
      const parentPostId = post.campaign_id ? `camp-${post.campaign_id}`
        : post.objective_id ? `obj-${post.objective_id}`
        : null;
      if (parentPostId) {
        edges.push({
          id: `e-${parentPostId}-${postNodeId}`,
          source: parentPostId,
          target: postNodeId,
          type: 'smoothstep',
          style: { stroke: '#64748b', strokeWidth: 1 },
        });
      }
    });

    return NextResponse.json({
      nodes,
      edges,
      _meta: {
        objectives: (objectives ?? []).length,
        campaigns: (campaigns ?? []).length,
        articles: uniqueArticles.size,
        posts: (posts ?? []).length,
        mysql_status: mysqlStatus,
      }
    });

  } catch (error: any) {
    console.error('[strategy-map API Error]:', error);
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}
