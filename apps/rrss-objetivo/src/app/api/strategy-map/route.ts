import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import pool from '@/lib/mysql';

export async function GET() {
  try {
    // 1. Fetch Objectives — real column is 'description' (not 'focus')
    const { data: objectives, error: objError } = await supabase
      .from('objectives')
      .select('id, name, description')
      .is('archived_at', null);

    if (objError) throw objError;

    // 2. Fetch Campaigns
    const { data: campaigns, error: campError } = await supabase
      .from('campaigns')
      .select('id, name, objective_id, status')
      .is('archived_at', null);

    if (campError) throw campError;

    // 3. Fetch Article Map
    const { data: articleMap, error: artError } = await supabase
      .from('article_strategy_map')
      .select('id, mysql_article_id, article_title, article_slug, objective_id, campaign_id, role, strategic_notes');

    if (artError) throw artError;

    // 4. Fetch Posts — real column is 'platforms' (TEXT[] array, not 'platform')
    // Also real scheduling column is 'scheduled_for', not 'publish_at'
    const { data: posts, error: postError } = await supabase
      .from('social_posts')
      .select('id, topic, platforms, status, campaign_id, objective_id, scheduled_for, metadata')
      .not('status', 'eq', 'published')  // Only show non-published for the strategy view
      .order('scheduled_for', { ascending: true })
      .limit(80);

    if (postError) throw postError;

    // ─── Build React Flow graph ───────────────────────────────────────────────
    const nodes: any[] = [];
    const edges: any[] = [];

    // ROOT NODE
    const rootId = 'root';
    nodes.push({
      id: rootId,
      type: 'rootNode',
      data: { label: 'RRSS Objetivo 2026' },
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
        id: `e-root-${obj.id}`,
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

    const uniqueArticles = new Map<number, { id: number; title: string; slug: string; mappings: any[] }>();
    
    // 3.5. Fetch All Articles from MySQL so we can show "orphans" in the map
    const [rows]: any = await pool.query(
      `SELECT id, title, slug, published_at as date
       FROM articles 
       ORDER BY published_at DESC
       LIMIT 100`
    );
    const mysqlArticles = rows as any[];

    // Seed the map with MySQL articles (they have 0 mappings initially)
    mysqlArticles.forEach(art => {
      uniqueArticles.set(art.id, {
        id: art.id,
        title: art.title,
        slug: art.slug,
        mappings: [],
      });
    });

    (articleMap ?? []).forEach((entry) => {
      if (!uniqueArticles.has(entry.mysql_article_id)) {
        uniqueArticles.set(entry.mysql_article_id, {
          id: entry.mysql_article_id,
          title: entry.article_title,
          slug: entry.article_slug ?? '',
          mappings: [],
        });
      }
      uniqueArticles.get(entry.mysql_article_id)!.mappings.push(entry);
    });

    uniqueArticles.forEach((article) => {
      const artNodeId = `art-${article.id}`;
      nodes.push({
        id: artNodeId,
        type: 'articleNode',
        data: {
          label: article.title,
          slug: article.slug,
          mappings: article.mappings,
          id: article.id,
        },
        position: { x: 0, y: 0 },
      });

      // One edge per mapping (to campaign or objective)
      if (article.mappings && article.mappings.length > 0) {
        article.mappings.forEach((m: any) => {
          const sourceNodeId = m.campaign_id
            ? `camp-${m.campaign_id}`
            : m.objective_id
            ? `obj-${m.objective_id}`
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
        // ORPHAN ARTICLE: Connect it via a dashed line to the ROOT so it doesn't break layout
        edges.push({
          id: `e-orphan-root-${artNodeId}`,
          source: rootId,
          target: artNodeId,
          type: 'smoothstep',
          style: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '5,5' }, // Red dashed line for orphans
        });
      }
    });

    // POST NODES — platforms is a TEXT[] array, we take first value for display
    (posts ?? []).forEach((post) => {
      const postNodeId = `post-${post.id}`;
      const platformList: string[] = post.platforms ?? [];
      const displayPlatform = platformList.length > 0 ? platformList.join(', ') : 'social';

      nodes.push({
        id: postNodeId,
        type: 'postNode',
        data: {
          label: post.topic ?? '(sin tema)',
          platform: displayPlatform,
          status: post.status,
          publishAt: post.scheduled_for,
          raw: post,
        },
        position: { x: 0, y: 0 },
      });

      const parentPostId = post.campaign_id
        ? `camp-${post.campaign_id}`
        : post.objective_id
        ? `obj-${post.objective_id}`
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

    return NextResponse.json({ nodes, edges });

  } catch (error: any) {
    console.error('[strategy-map API Error]:', error);
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}
