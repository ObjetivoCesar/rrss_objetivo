const { createDeepSeek } = require('@ai-sdk/deepseek');
const { generateText, tool } = require('ai');
const { z } = require('zod');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const originalFetch = global.fetch;
global.fetch = async (...args) => {
  if (args[0].includes('deepseek.com')) {
    const body = JSON.parse(args[1].body);
    const params = body.tools?.[0]?.function?.parameters;
    console.log('Parameters sent:', JSON.stringify(params));
    const ok = params?.type === 'object' && Object.keys(params?.properties || {}).length > 0;
    console.log(ok ? '✅ SCHEMA OK' : '❌ SCHEMA BROKEN');
  }
  return originalFetch(...args);
};

const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });

(async () => {
  try {
    await generateText({
      model: deepseek('deepseek-chat'),
      messages: [{ role: 'user', content: 'test' }],
      tools: {
        test_tool: tool({
          description: 'Test',
          parameters: z.object({ name: z.string().describe('Nombre') })
        })
      }
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
