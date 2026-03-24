import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    logger.info('Materializing strategy session', { id });

    // 1. Fetch the session
    const { data: session, error: sessionError } = await supabase
      .from('strategy_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (sessionError) throw sessionError;

    const { nodes, edges, objective_id } = session;

    if (!objective_id) {
       return NextResponse.json({ error: "La sesión no tiene un objetivo vinculado" }, { status: 400 });
    }

    // 2. Identify nodes
    const campaignNodes = nodes.filter((n: any) => n.type === 'campaignNode');
    const articleNodes = nodes.filter((n: any) => n.type === 'articleNode');

    let materializedCount = 0;

    // 3. Materialize Campaigns
    for (const node of campaignNodes) {
      // Check if exists
      const { data: existingCamp } = await supabase
        .from('campaigns')
        .select('id')
        .eq('objective_id', objective_id)
        .eq('name', node.data?.label || 'Nueva Campaña')
        .maybeSingle();

      let campaignId;

      if (existingCamp) {
        campaignId = existingCamp.id;
      } else {
        const { data: campaign, error: campError } = await supabase
          .from('campaigns')
          .insert([{ 
            objective_id, 
            name: node.data?.label || 'Nueva Campaña', 
            description: node.data?.description || 'Materializado desde Strategy Planner',
            status: 'active'
          }])
          .select()
          .single();
        
        if (campError) {
          logger.error('Error materializing campaign', campError);
          continue;
        }
        campaignId = campaign.id;
        materializedCount++;
      }

      // 4. Materialize related articles (posts)
      const relatedArticleNodes = articleNodes.filter((an: any) => 
        edges.some((e: any) => e.source === node.id && e.target === an.id)
      );

      for (const article of relatedArticleNodes) {
        // Check if exists
        const { data: existingPost } = await supabase
          .from('social_posts')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('topic', article.data?.label || 'Nuevo Post')
          .maybeSingle();

        if (!existingPost) {
          const { error: postError } = await supabase
            .from('social_posts')
            .insert([{
              campaign_id: campaignId,
              topic: article.data?.label || 'Nuevo Post',
              content_text: article.data?.description || '',
              status: 'pending',
              target_month: new Date().toLocaleString('es-ES', { month: 'long' }),
              platforms: ['blog']
            }]);
          
          if (postError) logger.error('Error materializing post', postError);
        }
      }
    }

    return NextResponse.json({ success: true, materializedCount });
  } catch (error: any) {
    logger.error('Error in materialization API', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
