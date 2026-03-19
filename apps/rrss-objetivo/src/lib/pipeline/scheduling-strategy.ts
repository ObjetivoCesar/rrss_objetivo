import { supabase } from '@/lib/supabase';

/**
 * Horarios óptimos por plataforma (basado en investigación de audiencias).
 * Representados como horas enteras (formato 24h).
 */
const OPTIMAL_SLOTS: Record<string, number[]> = {
  instagram: [15, 17, 20],   // 15:00, 17:00, 20:00
  tiktok: [15, 18, 21],      // 15:00, 18:00, 21:00
  facebook: [9, 13, 17],     // 09:00, 13:00, 17:00
  linkedin: [8, 10, 12],     // 08:00, 10:00, 12:00
  youtube: [14, 16, 21],     // 14:00, 16:00, 21:00
  text_only: [11, 16, 19]    // Default fallbacks
};

/**
 * Determina el mejor horario y día para publicar un post para evitar colisiones.
 * @param platforms - Redes sociales donde se publicará
 * @param baseDate - Fecha a partir de la cual buscar (usualmente "hoy")
 */
export async function getOptimalScheduleDate(
  platforms: string[] = [],
  baseDate: Date = new Date()
): Promise<Date> {
  
  // 1. Determinar la plataforma "primaria" para usar sus slots
  // Prioridad B2B si está LinkedIn, sino Instagram/TikTok, o genérico.
  let primaryPlatform = 'text_only';
  if (platforms.includes('linkedin')) primaryPlatform = 'linkedin';
  else if (platforms.includes('instagram')) primaryPlatform = 'instagram';
  else if (platforms.includes('tiktok')) primaryPlatform = 'tiktok';
  else if (platforms.includes('facebook')) primaryPlatform = 'facebook';
  else if (platforms.includes('youtube')) primaryPlatform = 'youtube';

  const availableSlots = OPTIMAL_SLOTS[primaryPlatform] || OPTIMAL_SLOTS['text_only'];

  // 2. Obtener los posts agendados a futuro para no "colisionar"
  const { data: futurePosts } = await supabase
    .from('social_posts')
    .select('scheduled_for')
    .gte('scheduled_for', new Date().toISOString());

  // Set de timestamps ocupados (truncados por hora)
  const occupiedHours = new Set(
    (futurePosts || []).map(p => {
      const d = new Date(p.scheduled_for);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
    })
  );

  // 3. Buscar el primer slot libre empezando desde pasado mañana
  // Empezamos desde `baseDate` + 1 día para no asfixiar el calendario inmediato.
  let currentDate = new Date(baseDate);
  currentDate.setDate(currentDate.getDate() + 1); 

  // Buscar hasta 14 días en el futuro
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() + dayOffset);

    // No programar en fines de semana para LinkedIn
    const isWeekend = checkDate.getDay() === 0 || checkDate.getDay() === 6;
    if (primaryPlatform === 'linkedin' && isWeekend) continue;

    for (const hour of availableSlots) {
       const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}-${hour}`;
       
       if (!occupiedHours.has(key)) {
         // Slot encontrado!
         const optimalDate = new Date(checkDate);
         optimalDate.setHours(hour, 0, 0, 0);
         return optimalDate;
       }
    }
  }

  // Fallback si todos los slots están ocupados (muy inusual)
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 2);
  fallback.setHours(10, 0, 0, 0);
  return fallback;
}
