import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import pool from '@/lib/mysql';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ─── Helper: Auto-detect the WordPress posts table prefix ──────────────────────
async function findWpPostsTable(): Promise<string> {
  const [tables]: any = await pool.query(
    "SHOW TABLES LIKE '%_posts'"
  );
  if (tables.length === 0) throw new Error('No WordPress posts table found in MySQL');
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
      { data: ideas, error: ideaError },
      { data: positions, error: posError },
    ] = await Promise.all([
      supabase.from('objectives').select('id, name, description').is('archived_at', null),
      supabase.from('campaigns').select('id, name, objective_id, status').is('archived_at', null),
      supabase.from('article_strategy_map').select('id, mysql_article_id, article_title, article_slug, objective_id, campaign_id, role, strategic_notes'),
      supabase.from('social_posts').select('id, topic, platforms, status, campaign_id, objective_id, scheduled_for').not('status', 'eq', 'published').order('scheduled_for', { ascending: true }).limit(60),
      supabase.from('map_ideas').select('*').is('archived_at', null),
      supabase.from('map_node_positions').select('*'),
    ]);

    // Supabase errors
    if (objError) throw new Error(`Supabase objectives: ${objError.message}`);
    if (campError) throw new Error(`Supabase campaigns: ${campError.message}`);
    if (artError) throw new Error(`Supabase article_strategy_map: ${artError.message}`);
    if (postError) throw new Error(`Supabase social_posts: ${postError.message}`);
    if (ideaError) throw new Error(`Supabase map_ideas: ${ideaError.message}`);
    if (posError) throw new Error(`Supabase map_node_positions: ${posError.message}`);

    // ─── 2. MySQL: Fetch Blog Articles (OPTIONAL) ──────────────────────────
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
    } catch (mysqlErr: any) {
      mysqlStatus = mysqlErr.message;
      console.warn('[strategy-map] MySQL unavailable:', mysqlErr.message);
    }

    // ─── 3. Build Graph ───────────────────────────────────────────────────────
    const nodes: any[] = [];
    const edges: any[] = [];
    const rootId = 'root';

    nodes.push({
      id: rootId,
      type: 'rootNode',
      data: { label: 'Cerebro Estratégico' },
      position: { x: 0, y: 0 },
    });

    // OBJECTIVES
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

    // CAMPAIGNS
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

    // ARTICLES
    const uniqueArticles = new Map<number, { id: number; title: string; slug: string; mappings: any[] }>();
    mysqlArticles.forEach((art) => {
      uniqueArticles.set(Number(art.id), { id: Number(art.id), title: art.title, slug: art.slug, mappings: [] });
    });
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
          const sourceNodeId = m.campaign_id ? `camp-${m.campaign_id}` : m.objective_id ? `obj-${m.objective_id}` : rootId;
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
        edges.push({
          id: `e-orphan-root-${artNodeId}`,
          source: rootId,
          target: artNodeId,
          type: 'smoothstep',
          style: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '5,5' },
        });
      }
    });

    // POSTS
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
      const parentPostId = post.campaign_id ? `camp-${post.campaign_id}` : post.objective_id ? `obj-${post.objective_id}` : null;
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

    // IDEAS (Migración 06)
    (ideas ?? []).forEach((idea: any) => {
      const ideaNodeId = `idea-${idea.id}`;
      nodes.push({
        id: ideaNodeId,
        type: idea.node_type === 'idea' ? 'ideaNode' : 'contentBlockNode',
        data: {
          label: idea.label,
          description: idea.description,
          type: idea.node_type,
          id: idea.id,
          raw: idea,
        },
        position: { x: idea.pos_x || 0, y: idea.pos_y || 0 },
      });

      if (idea.parent_id) {
        edges.push({
          id: `e-parent-${idea.parent_id}-${ideaNodeId}`,
          source: idea.parent_id,
          target: ideaNodeId,
          type: 'smoothstep',
          style: { stroke: '#8b5cf6', strokeWidth: 1.5, strokeDasharray: '2,2' },
        });
      }
    });

    // POSITIONS
    const posMap = new Map((positions ?? []).map((p: any) => [p.node_id, p]));
    nodes.forEach(node => {
      const savedPos = posMap.get(node.id);
      if (savedPos) {
        node.position = { x: savedPos.pos_x, y: savedPos.pos_y };
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
        ideas: (ideas ?? []).length,
        mysql_status: mysqlStatus,
      }
    });

  } catch (error: any) {
    console.error('[strategy-map API Error]:', error);
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}
