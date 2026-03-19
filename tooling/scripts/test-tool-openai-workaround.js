const { createOpenAI } = require('@ai-sdk/openai');
const { generateText, tool, jsonSchema } = require('ai');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const originalFetch = global.fetch;
global.fetch = async (...args) => {
  if (args[0].includes('api.deepseek.com')) {
    console.log(`--- REQ to DeepSeek (via OpenAI provider) ---`);
    if (args[1] && args[1].body) {
      try {
        console.log(JSON.stringify(JSON.parse(args[1].body), null, 2));
      } catch(e) { console.log(args[1].body); }
    }
  }
  return originalFetch(...args);
};

const deepseek = createOpenAI({ 
  baseURL: 'https://api.deepseek.com/v1', 
  apiKey: process.env.DEEPSEEK_API_KEY 
});

async function run() {
  console.log('\nTesting DeepSeek via OpenAI provider...');
  try {
    const result = await generateText({
      model: deepseek('deepseek-chat'),
      messages: [{ role: 'user', content: 'Crea un objetivo llamado Vender Mas' }],
      tools: {
        create_objective: tool({
          description: 'Crea un nuevo objetivo estratégico',
          parameters: jsonSchema({
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Nombre' },
              description: { type: 'string', description: 'Desc' }
            },
            required: ['name', 'description']
          })
        })
      }
    });
    console.log('Result text:', result.text);
    console.log('Tool calls:', result.toolCalls);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
run();
