const { createDeepSeek } = require('@ai-sdk/deepseek');
const { generateText, tool } = require('ai');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const originalFetch = global.fetch;
global.fetch = async (...args) => {
  if (args[0].includes('deepseek.com')) {
    console.log('--- REQ BODY ---');
    console.log(JSON.stringify(JSON.parse(args[1].body), null, 2));
  }
  return originalFetch(...args);
};

const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });

async function run() {
  try {
    const result = await generateText({
      model: deepseek('deepseek-chat'),
      messages: [{ role: 'user', content: 'Crea un objetivo llamado Vender Mas' }],
      tools: {
        create_objective: {
          description: 'Crea un nuevo objetivo estratégico',
          parameters: {
            _type: 'json-schema', // Internal AI SDK hint
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' }
            },
            required: ['name', 'description']
          },
          execute: async () => ({ success: true })
        }
      }
    });
    console.log(result.text);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
run();
