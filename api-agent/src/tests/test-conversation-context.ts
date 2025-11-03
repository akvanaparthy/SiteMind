/**
 * Test Conversation Context
 * Simulates a multi-turn conversation to test context awareness
 */

import { executeCommand } from '../agents/agent-factory';
import { logger } from '../utils/logger';

async function testConversationContext() {
  console.log('\n🧪 TESTING CONVERSATION CONTEXT');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');

  const history: Array<{ role: 'user' | 'agent'; content: string }> = [];

  // Turn 1: Ask about pending orders
  console.log('👤 USER: "What are the pending orders?"');
  console.log('─'.repeat(80));
  
  const response1 = await executeCommand('What are the pending orders?', history);
  console.log('\n🤖 AGENT:', response1.output);
  console.log('─'.repeat(80));

  // Add to history
  history.push({ role: 'user', content: 'What are the pending orders?' });
  history.push({ role: 'agent', content: response1.output });

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Turn 2: Ask to list them (should understand "them" = pending orders)
  console.log('\n👤 USER: "list them"');
  console.log('─'.repeat(80));
  console.log('📜 Context: Sending previous 2 messages for context');
  
  const response2 = await executeCommand('list them', history);
  console.log('\n🤖 AGENT:', response2.output);
  console.log('─'.repeat(80));

  // Add to history
  history.push({ role: 'user', content: 'list them' });
  history.push({ role: 'agent', content: response2.output });

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Turn 3: Ask about the first one
  console.log('\n👤 USER: "show me details about the first one"');
  console.log('─'.repeat(80));
  console.log('📜 Context: Sending previous 4 messages for context');
  
  const response3 = await executeCommand('show me details about the first one', history);
  console.log('\n🤖 AGENT:', response3.output);
  console.log('─'.repeat(80));

  console.log('\n✅ CONVERSATION CONTEXT TEST COMPLETE\n');
}

// Run the test
testConversationContext()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
