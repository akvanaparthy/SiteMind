/**
 * Individual Tool Test - Test one tool at a time
 */

import { allTools } from '../tools';

// Get tool name from command line
const toolName = process.argv[2];
const args = process.argv.slice(3);

if (!toolName) {
  console.log('❌ Usage: npm run test:individual <tool_name> [args...]');
  console.log('\nAvailable tools:');
  allTools.forEach(tool => {
    console.log(`  - ${tool.name}`);
  });
  process.exit(1);
}

async function testTool() {
  const tool = allTools.find(t => t.name === toolName);
  
  if (!tool) {
    console.log(`❌ Tool "${toolName}" not found`);
    console.log('\nAvailable tools:');
    allTools.forEach(t => console.log(`  - ${t.name}`));
    process.exit(1);
  }

  console.log('🧪 Testing Individual Tool');
  console.log('='.repeat(60));
  console.log(`Tool: ${tool.name}`);
  console.log(`Description: ${tool.description}`);
  console.log('='.repeat(60));

  // Parse arguments based on tool schema
  let input: any = {};
  
  // For tools that need specific inputs, parse from args
  if (args.length > 0) {
    // Simple parsing: first arg is usually an ID
    const schemaKeys = Object.keys((tool as any).schema.shape || {});
    if (schemaKeys.length > 0) {
      input[schemaKeys[0]] = isNaN(Number(args[0])) ? args[0] : Number(args[0]);
    }
  }

  console.log('\n📥 Input:', JSON.stringify(input, null, 2));
  console.log('\n⏳ Executing tool...\n');

  try {
    const result = await tool.func(input);
    
    console.log('='.repeat(60));
    console.log('✅ SUCCESS');
    console.log('='.repeat(60));
    console.log('\n📤 Result:');
    console.log(result);
    
  } catch (error: any) {
    console.log('='.repeat(60));
    console.log('❌ FAILED');
    console.log('='.repeat(60));
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testTool().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
