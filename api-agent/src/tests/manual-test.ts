/**
 * Manual test script - execute one command at a time
 * Usage: npx tsx src/tests/manual-test.ts "your command here"
 */

import { executeCommand } from '../agents/agent-factory';

async function runTest() {
  const testCommand = process.argv[2] || 'Get blog post with ID 27';

  console.log('🧪 MANUAL TEST');
  console.log('═'.repeat(80));
  console.log(`Command: "${testCommand}"`);
  console.log('═'.repeat(80));
  console.log('');

  try {
    const result = await executeCommand(testCommand);
    
    console.log('');
    console.log('✅ SUCCESS');
    console.log('═'.repeat(80));
    console.log('Agent Response:');
    console.log(JSON.stringify(result.output, null, 2));
    console.log('═'.repeat(80));
  } catch (error: any) {
    console.error('');
    console.error('❌ FAILED');
    console.error('═'.repeat(80));
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.error('═'.repeat(80));
    process.exit(1);
  }
}

runTest();
