/**
 * Test tools through agent - one at a time
 */

import { createAgent } from '../agents/agent-factory';

const command = process.argv[2];

if (!command) {
  console.log('Usage: tsx src/tests/test-via-agent.ts "your command"');
  console.log('\nExamples:');
  console.log('  "Get details for customer 1"');
  console.log('  "Show me orders for customer 1"');
  process.exit(1);
}

async function testViaAgent() {
  console.log('🤖 Testing via AI Agent');
  console.log('='.repeat(70));
  console.log(`💬 Command: "${command}"`);
  console.log('='.repeat(70));
  console.log('\n⏳ Executing...\n');

  try {
    const agent = await createAgent(command);
    const result = await agent.invoke({ input: command });
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ AGENT EXECUTION COMPLETE');
    console.log('='.repeat(70));
    console.log('\n📤 Agent Output:');
    console.log(JSON.stringify(result.output, null, 2));
    
    console.log('\n📋 Steps Taken:');
    if (result.intermediateSteps) {
      result.intermediateSteps.forEach((step: any, i: number) => {
        console.log(`\n  Step ${i + 1}:`);
        console.log(`    Tool: ${step.action?.tool || 'N/A'}`);
        console.log(`    Input: ${JSON.stringify(step.action?.toolInput)}`);
        console.log(`    Output: ${step.observation?.substring(0, 200)}...`);
      });
    }
    
  } catch (error: any) {
    console.log('\n' + '='.repeat(70));
    console.log('❌ AGENT EXECUTION FAILED');
    console.log('='.repeat(70));
    console.log('\nError:', error.message);
    console.log('\nStack:', error.stack);
  }
}

testViaAgent()
  .then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
