/**
 * Test Claude's tool calling directly without agent
 */

import 'dotenv/config';
import { ChatAnthropic } from '@langchain/anthropic';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// Create a simple test tool
const testTool = new DynamicStructuredTool({
  name: 'get_weather',
  description: 'Get the current weather for a location. Use this when asked about weather.',
  schema: z.object({
    location: z.string().describe('The city name'),
  }),
  func: async ({ location }) => {
    return JSON.stringify({ location, temperature: 72, condition: 'sunny' });
  },
});

async function testClaude() {
  console.log('🧪 Testing Claude tool calling...\n');

  const llm = new ChatAnthropic({
    model: 'claude-3-haiku-20240307',
    temperature: 0,
    maxTokens: 4096,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log('📋 Available tools:', [testTool].map(t => t.name));
  console.log('\n💬 Query: "What is the weather in New York?"\n');

  try {
    // Bind tool to LLM
    const llmWithTools = llm.bind({
      tools: [testTool],
    });

    const response = await llmWithTools.invoke('What is the weather in New York?');
    
    console.log('📝 Response:', response);
    console.log('\n✅ Test completed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testClaude();
