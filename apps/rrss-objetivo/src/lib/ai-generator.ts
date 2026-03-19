import { supabaseAdmin } from './supabase-admin';

export interface GeneratedPost {
  content_text: string;
  platforms: string[];
  scheduled_for: string;
  status: 'draft_ai';
  metadata?: any;
  campaign_id?: string;
  objective_id?: string;
}

/**
 * Genera un calendario de contenidos mensual basado en la identidad de marca.
 * Utiliza DeepSeek (o similar) para la creación de los posts.
 */
export async function generateMonthlyCalendar(brandContext: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('Falta DEEPSEEK_API_KEY en las variables de entorno');
  }

  console.log('🤖 [AI Generator] Iniciando generación con DeepSeek...');

  const systemPrompt = `
    Eres un Director de Contenido experto en redes sociales y automatización.
    Tu misión es generar un calendario de 10 posts estratégicos para la marca definida en el contexto.
    
    REGLAS DE ORO:
    1. Usa el tono: Profesional-casual, mentor, honesto.
    2. Sigue los pilares de contenido: Educativo (30%), BTS (25%), Industria (25%), Interacción (15%), Promo (5%).
    3. Para YouTube Shorts: Incluye siempre un título llamativo en metadata.youtube_title.
    4. Para LinkedIn: Enfócate en autoridad y eficiencia.
    5. Formato de salida: JSON puro (array de objetos). No incluyas explicaciones fuera del JSON.
    
    ESTRUCTURA DEL OBJETO POST:
    {
      "content_text": "Cuerpo del post con hooks y hashtags",
      "platforms": ["facebook", "instagram", "linkedin", "youtube", "tiktok"],
      "scheduled_for": "ISO String date",
      "status": "draft_ai",
      "metadata": {
        "youtube_title": "Opcional",
        "linkedin_title": "Opcional"
      }
    }
  `;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Genera 10 posts siguiendo esta identidad de marca:\n\n${brandContext}` }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    // Si la IA devuelve el objeto envuelto en una llave, lo extraemos
    const posts: GeneratedPost[] = Array.isArray(content) ? content : (content.posts || content.calendar || []);

    return posts;
  } catch (error: any) {
    console.error('❌ [AI Generator] Error en llamada a DeepSeek:', error.message);
    throw error;
  }
}

/**
 * Guarda las propuestas generadas por la IA en la base de datos.
 */
export async function saveProposedCalendar(posts: GeneratedPost[]) {
  const { data, error } = await supabaseAdmin
    .from('social_posts')
    .insert(posts);

  if (error) {
    console.error('❌ [AI Generator] Error guardando propuestas:', error.message);
    return false;
  }

  return true;
}
