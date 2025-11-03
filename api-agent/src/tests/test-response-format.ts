/**
 * Test agent response formatting
 */

import { executeCommand } from '../agents/agent-factory';

async function testResponseFormatting() {
  console.log('\n🧪 Testing Agent Response Formatting\n');
  console.log('═'.repeat(80));

  const testCommands = [
    'Get all pending orders',
    'Show me site analytics',
    'List all open support tickets',
  ];

  for (const command of testCommands) {
    console.log(`\n📝 Command: "${command}"`);
    console.log('─'.repeat(80));

    try {
      const result = await executeCommand(command);

      console.log('\n✅ Response received');
      console.log('\n📊 Output type:', typeof result.output);
      console.log('📏 Output length:', result.output.length);
      console.log('\n💬 Formatted Output:');
      console.log('─'.repeat(80));
      console.log(result.output);
      console.log('─'.repeat(80));

      if (result.rawOutput) {
        console.log('\n🔍 Raw Output (first 200 chars):');
        const raw = JSON.stringify(result.rawOutput);
        console.log(raw.substring(0, 200) + (raw.length > 200 ? '...' : ''));
      }

      console.log('\n');
    } catch (error: any) {
      console.error('❌ Error:', error.message);
    }

    // Wait between commands
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n═'.repeat(80));
  console.log('✅ Formatting test complete!\n');
}

testResponseFormatting().catch(console.error);
