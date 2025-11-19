/**
 * Test if agent can list customers
 */

import { executeCommand } from '../agents/agent-factory';
import { logger } from '../utils/logger';

async function testListCustomers() {
  console.log('🧪 Testing list_customers tool...\n');

  try {
    const result = await executeCommand('List all customers in the system');
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📝 AGENT RESPONSE:');
    console.log('═══════════════════════════════════════════════════');
    console.log(result.output);
    console.log('\n═══════════════════════════════════════════════════');

    if (result.intermediateSteps && result.intermediateSteps.length > 0) {
      console.log('\n🔧 TOOL CALLS:');
      console.log('═══════════════════════════════════════════════════');
      result.intermediateSteps.forEach((step: any, idx: number) => {
        console.log(`\n${idx + 1}. Tool: ${step.action?.tool || 'unknown'}`);
        console.log(`   Input:`, step.action?.toolInput);
        console.log(`   Output:`, step.observation?.substring(0, 200) + '...');
      });
    }

    console.log('\n✅ Test completed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testListCustomers();
