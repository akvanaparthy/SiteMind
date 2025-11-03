/**
 * Test individual tool manually
 * Usage: tsx src/tests/test-single-tool.ts <toolName> <userCommand>
 */

import { executeCommand } from '../agents/agent-factory';
import { logger } from '../utils/logger';

async function testTool() {
  const toolName = process.argv[2];
  const userCommand = process.argv.slice(3).join(' ');

  if (!toolName || !userCommand) {
    console.error('Usage: tsx src/tests/test-single-tool.ts <toolName> <userCommand>');
    console.error('Example: tsx src/tests/test-single-tool.ts get_blog_post "Get blog post with ID 1"');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`TESTING TOOL: ${toolName}`);
  console.log(`COMMAND: ${userCommand}`);
  console.log('='.repeat(80) + '\n');

  try {
    const result = await executeCommand(userCommand);
    
    console.log('\n' + '='.repeat(80));
    console.log('RESULT:');
    console.log('='.repeat(80));
    console.log(result.output);
    console.log('='.repeat(80) + '\n');

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(result.output);
      console.log('✅ Valid JSON Response');
      console.log('Parsed:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('⚠️  Response is not JSON (this might be expected for conversational responses)');
    }

  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ ERROR:');
    console.error('='.repeat(80));
    console.error(error);
  }

  process.exit(0);
}

testTool();
