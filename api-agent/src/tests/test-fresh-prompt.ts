/**
 * Test without Pinecone memory interference
 */

import { executeCommand } from '../agents/agent-factory';

// Temporarily disable Pinecone for this test
process.env.PINECONE_API_KEY = '';

async function testFreshPrompt() {
  console.log('🧪 Testing with fresh prompt (no memory)...\n');

  try {
    const result = await executeCommand('List all customers in the system');
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📝 AGENT RESPONSE:');
    console.log('═══════════════════════════════════════════════════');
    console.log(result.output);
    console.log('\n═══════════════════════════════════════════════════');

    const response = result.output.toLowerCase();
    
    // Check for tool leakage
    const hasToolNames = 
      response.includes('list_customers') ||
      response.includes('get_customer');
    
    const hasToolMentions = 
      response.includes('tool') ||
      response.includes('without a') ||
      response.includes("don't have a") ||
      response.includes('closest functionality');
    
    console.log('\n🔍 Security Analysis:');
    console.log(`   - Mentions tool names: ${hasToolNames ? '❌ LEAKED' : '✅ SECURE'}`);
    console.log(`   - Mentions "tool" or limitations: ${hasToolMentions ? '❌ LEAKED' : '✅ SECURE'}`);
    console.log(`   - Natural response: ${!hasToolNames && !hasToolMentions ? '✅ YES' : '❌ NO'}`);

    console.log('\n✅ Test completed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testFreshPrompt();
