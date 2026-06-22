import { processScheduledPosts } from '../src/lib/scheduler.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function run() {
  console.log("🚀 Forzando ejecución del scheduler...");
  try {
    await processScheduledPosts();
    console.log("✅ Proceso completado.");
  } catch (error) {
    console.error("❌ Error ejecutando el scheduler:", error);
  }
}
run();
