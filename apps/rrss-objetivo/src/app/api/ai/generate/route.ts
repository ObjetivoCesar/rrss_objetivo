import { NextResponse } from 'next/server';
import { generateMonthlyCalendar, saveProposedCalendar } from '@/lib/ai-generator';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    // 1. Cargar el contexto de marca (ADN del Proyecto)
    // Nota: El path es relativo a la raíz del proyecto
    const brandPath = path.join(process.cwd(), '..', '.agent', 'brand-identity.md');
    const brandContext = fs.readFileSync(brandPath, 'utf8');

    const body = await req.json().catch(() => ({}));
    const campaign_id = body.campaign_id || null;
    const objective_id = body.objective_id || null;

    // 2. Generar el calendario con la IA
    const posts = await generateMonthlyCalendar(brandContext);

    const enrichedPosts = posts.map(post => ({
      ...post,
      campaign_id,
      objective_id
    }));

    // 3. Guardar en Supabase como borradores (draft_ai)
    const success = await saveProposedCalendar(enrichedPosts);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `${posts.length} posts generados y guardados como borradores.`,
        posts 
      });
    } else {
      throw new Error('No se pudieron guardar los posts en la base de datos.');
    }

  } catch (error: any) {
    console.error('❌ [API AI] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
