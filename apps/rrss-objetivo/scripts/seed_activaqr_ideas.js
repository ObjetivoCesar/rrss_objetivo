import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar .env de la app Next.js
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config({ path: path.join(process.cwd(), 'apps', 'rrss-objetivo', '.env.local') });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ideas = [
    // --- IDEAS DEL EXPERTO EN NEGOCIACIONES (NOTEBOOK LM) ---
    {
        topic: 'ActivaQR_Idea_TikTok',
        content: 'Situación: Cliente deja café a medio terminar, paga seco y se va. Emoción: Miedo a la muerte silenciosa por falta de omnisciencia operativa.',
        added_by: 'system'
    },
    {
        topic: 'ActivaQR_Idea_TikTok',
        content: 'Situación: Revisas reseñas en Google y hay queja de hace 2h que el mesero ocultó. Emoción: Vergüenza por ceguera operativa y pérdida de reputación.',
        added_by: 'system'
    },
    {
        topic: 'ActivaQR_Idea_TikTok',
        content: 'Situación: Cliente dice "el ambiente ya no es el mismo" pero te saluda falso. Emoción: Ansiedad por la cortesía social que esconde la fuga del cliente.',
        added_by: 'system'
    },
    {
        topic: 'ActivaQR_Idea_TikTok',
        content: 'Situación: Cliente compara tu menú de especialidad con la cadena barata de la esquina. Emoción: Impotencia ante el sesgo de contraste del cerebro del cliente.',
        added_by: 'system'
    },
    {
        topic: 'ActivaQR_Idea_TikTok',
        content: 'Situación: Local lleno, pedidos lentos, empleados evitan contacto visual. Emoción: Frustración por incapacidad de arreglar la operación en tiempo real.',
        added_by: 'system'
    },
    
    // --- LOTE 1 (PRECIOS Y FLOTAS) ---
    {
        topic: 'ActivaQR_Idea_Video',
        content: 'Gancho Tiempo: Si tu hora vale $50, perder 2h en quejas de WhatsApp te cuesta $100. ActivaQR cuesta $13. La pregunta es cuánto tiras a la basura queriendo controlar todo tú.',
        added_by: 'donna'
    },
    {
        topic: 'ActivaQR_Idea_Video',
        content: 'Gancho Escala: 1 unidad pagas $13. Flota baja a $8.75. Cada centavo cuenta al escalar. Deja que la IA haga la auditoría por menos de un almuerzo.',
        added_by: 'donna'
    },
    {
        topic: 'ActivaQR_Idea_Video',
        content: 'Gancho Socio Fundador: Plan vitalicio es un error financiero para nosotros, por eso solo va a dueños de 1 unidad. Calculado a $12 base, pagas una vez y no vuelves a pagar mensualidades.',
        added_by: 'donna'
    },
    {
        topic: 'ActivaQR_Idea_Video',
        content: 'Dolor de Crecer: Si tienes 1 local lo vigilas, si tienes 50 necesitas que la IA sea tus ojos. Reporte narrativo los lunes a las 7 AM.',
        added_by: 'donna'
    },
    {
        topic: 'ActivaQR_Idea_Video',
        content: 'Impuesto a la Indecisión: Cobramos $13 por probar. Es un impuesto. Trae 2 unidades y baja a $10. Diseñado para meter toda la flota. No es gasto, es inteligencia operativa.',
        added_by: 'donna'
    },

    // --- LOTE 2 (EMPLEADOS Y DELIVERY) ---
    {
        topic: 'ActivaQR_Idea_Video',
        content: 'Peligro Empleado: Negocio dejado a empleados corre riesgo de destrucción desde adentro. Crees que no vendes por la economía, es porque tratan mal a la gente cuando no ves.',
        added_by: 'donna'
    },
    {
        topic: 'ActivaQR_Idea_Video',
        content: 'Auditoría Delivery: Tu producto es la última oportunidad de impresionar. Cuando el repartidor se lo lleva quedas ciego. Pon QR en el empaque para saber si llegó frío.',
        added_by: 'donna'
    },
    {
        topic: 'ActivaQR_Idea_Video',
        content: 'Reporte Franquicias: Si tienes 3 cafeterías no puedes estar en todas. Todos los lunes 7 AM IA te dice exactamente qué falló el fin de semana. Inteligencia de supervivencia.',
        added_by: 'donna'
    },
    {
        topic: 'ActivaQR_Idea_Video',
        content: 'Socio Locales: Dos empresarios: los que pagan suscripciones toda la vida, y los dueños. Lifetime para locales unitarios. Auditoría con IA vitalicia. Socio fundador o inquilino.',
        added_by: 'donna'
    },
    {
        topic: 'ActivaQR_Idea_Video',
        content: 'Catálogo Luxury: Competencia tiene PDF pesado o tarjeta de papel. ActivaQR da Catálogo Luxury limitado a 20 productos porque menos es más. Vitrina premium vs tarjeta a la basura.',
        added_by: 'donna'
    }
];

async function seed() {
    console.log('🌱 Guardando 15 ideas estratégicas en donna_memory...');
    const { data, error } = await supabase.from('donna_memory').insert(ideas);
    if (error) {
        console.error('❌ Error guardando:', error);
    } else {
        console.log('✅ ¡Las 15 ideas han sido guardadas en la bóveda con éxito!');
    }
}

seed();
