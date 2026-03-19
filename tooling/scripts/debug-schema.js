const { z } = require('zod');
const { tool, jsonSchema } = require('ai');
const { zodToJsonSchema } = require('zod-to-json-schema');

const zodSchema = z.object({
  name: z.string().describe('Nombre corto'),
  description: z.string().describe('Explicación'),
  emoji: z.string().describe('Emoji'),
  color: z.string().describe('Color'),
});

console.log('Zod to JSON Schema:');
console.log(JSON.stringify(zodToJsonSchema(zodSchema), null, 2));

const aiTool = tool({
  description: 'test',
  parameters: zodSchema,
  execute: async () => {}
});

console.log('\nAI Tool parameters schema:');
console.log(JSON.stringify(aiTool.parameters, null, 2));

// For jsonSchema:
const jsTool = tool({
  description: 'test',
  parameters: jsonSchema({
    type: 'object',
    properties: {
      name: { type: 'string' }
    },
    required: ['name']
  }),
  execute: async () => {}
});

console.log('\nJS Tool parameters schema:');
console.log(JSON.stringify(jsTool.parameters, null, 2));
