import * as dotenv from 'dotenv';
import path from 'path';

// .env.local está en la raíz del app (apps/rrss-objetivo/.env.local)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { processPendingPosts } from './scheduler';

async function runLocalScheduler() {
  console.log('--- Iniciando Scheduler Local ---');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...');
  try {
    await processPendingPosts();
    console.log('--- Proceso Finalizado ---');
  } catch (error) {
    console.error('Error en el scheduler:', error);
  }
}

runLocalScheduler();
