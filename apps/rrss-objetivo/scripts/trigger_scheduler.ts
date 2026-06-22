import dotenv from 'dotenv';
import path from 'path';

// Cargar variables ANTES de importar cualquier módulo que las use
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function run() {
  console.log("🚀 Forzando ejecución del scheduler...");
  try {
    // Importación dinámica para asegurar que process.env esté poblado
    const { processScheduledPosts } = await import('../src/lib/scheduler');
    await processScheduledPosts();
    console.log("✅ Proceso completado.");
  } catch (error) {
    console.error("❌ Error ejecutando el scheduler:", error);
  }
}
run();
