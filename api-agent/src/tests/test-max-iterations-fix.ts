/**
 * Test Max Iterations Fix
 * Tests the conversation with context-based order update
 */

import { executeCommand } from '../agents/agent-factory';
import { logger } from '../utils/logger';

async function testMaxIterationsFix() {
  console.log('\n🧪 TESTING MAX ITERATIONS FIX');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');

  const history: Array<{ role: 'user' | 'agent'; content: string }> = [];

  // Turn 1: Get pending orders
  console.log('👤 USER: "what are pending orders"');
  console.log('─'.repeat(80));
  
  const response1 = await executeCommand('what are pending orders', history);
  console.log('\n🤖 AGENT:', response1.output);
  console.log('─'.repeat(80));

  history.push({ role: 'user', content: 'what are pending orders' });
  history.push({ role: 'agent', content: response1.output });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Turn 2: List them
  console.log('\n👤 USER: "list them"');
  console.log('─'.repeat(80));
  
  const response2 = await executeCommand('list them', history);
  console.log('\n🤖 AGENT:', response2.output);
  console.log('─'.repeat(80));

  history.push({ role: 'user', content: 'list them' });
  history.push({ role: 'agent', content: response2.output });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Turn 3: Update first one to delivered (the problematic command)
  console.log('\n👤 USER: "change the first one to delivered"');
  console.log('─'.repeat(80));
  console.log('📜 Context: Agent should extract order ID from previous message');
  
  const response3 = await executeCommand('change the first one to delivered', history);
  console.log('\n🤖 AGENT:', response3.output);
  console.log('─'.repeat(80));

  console.log('\n✅ MAX ITERATIONS FIX TEST COMPLETE\n');
}

// Run the test
testMaxIterationsFix()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
