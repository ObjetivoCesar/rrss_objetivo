import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { processScheduledPosts } from './src/lib/scheduler';

async function main() {
  console.log('Starting manual execution of scheduler...');
  try {
    await processScheduledPosts();
    console.log('Finished manual execution.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

main();
