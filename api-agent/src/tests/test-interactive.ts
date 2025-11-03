/**
 * Simple manual tool testing - Test each tool one by one
 * This tests Claude's ability to understand and call the right tools
 */

import { executeCommand } from '../agents/agent-factory';
import { logger } from '../utils/logger';
import * as readline from 'readline';

interface TestCase {
  id: number;
  category: string;
  toolName: string;
  command: string;
  description: string;
}

const TEST_CASES: TestCase[] = [
  // Blog Tools (5) - Using actual DB IDs from seed
  { id: 1, category: 'Blog', toolName: 'get_blog_post', command: 'Get blog post with ID 27', description: 'Retrieve blog post by ID' },
  { id: 2, category: 'Blog', toolName: 'create_blog_post', command: 'Create a blog post titled "AI Agents in Modern E-Commerce" with content about how autonomous AI agents transform online shopping, author ID 9', description: 'Create new blog post' },
  { id: 3, category: 'Blog', toolName: 'update_blog_post', command: 'Update blog post 27 title to "The Future of AI in E-Commerce - Updated"', description: 'Update existing post' },
  { id: 4, category: 'Blog', toolName: 'publish_blog_post', command: 'Publish blog post 29', description: 'Publish draft post' },
  { id: 5, category: 'Blog', toolName: 'trash_blog_post', command: 'Move blog post 28 to trash', description: 'Trash a post' },

  // Ticket Tools (5) - Tickets are auto-incremented from 1
  { id: 6, category: 'Tickets', toolName: 'get_ticket', command: 'Get ticket with ID 1', description: 'Retrieve support ticket' },
  { id: 7, category: 'Tickets', toolName: 'get_open_tickets', command: 'Show me all open support tickets', description: 'List open tickets' },
  { id: 8, category: 'Tickets', toolName: 'close_ticket', command: 'Close ticket 2 with resolution: Return policy explained to customer', description: 'Close a ticket' },
  { id: 9, category: 'Tickets', toolName: 'update_ticket_priority', command: 'Update ticket 3 priority to HIGH', description: 'Change ticket priority' },
  { id: 10, category: 'Tickets', toolName: 'assign_ticket', command: 'Assign ticket 4 to user ID 12 (AI Agent)', description: 'Assign to agent' },

  // Order Tools (5) - Using actual generated order IDs
  { id: 11, category: 'Orders', toolName: 'get_order', command: 'Show me details for the first pending order', description: 'Retrieve order details' },
  { id: 12, category: 'Orders', toolName: 'get_pending_orders', command: 'Show me all pending orders', description: 'List pending orders' },
  { id: 13, category: 'Orders', toolName: 'update_order_status', command: 'Get the first pending order and change its status to DELIVERED', description: 'Change order status' },
  { id: 14, category: 'Orders', toolName: 'process_refund', command: 'Get order ID 6 and process a refund because the product was defective', description: 'Process refund' },
  { id: 15, category: 'Orders', toolName: 'notify_customer', command: 'Get order ID 2 and send notification with subject "Shipment Update" and message "Your order is on its way"', description: 'Send customer notification' },

  // Site Control (4)
  { id: 16, category: 'Site', toolName: 'get_site_status', command: 'What is the current site status?', description: 'Get site status' },
  { id: 17, category: 'Site', toolName: 'get_site_analytics', command: 'Show me site analytics', description: 'Get analytics' },
  { id: 18, category: 'Site', toolName: 'toggle_maintenance_mode', command: 'Enable maintenance mode', description: 'Toggle maintenance' },
  { id: 19, category: 'Site', toolName: 'clear_cache', command: 'Clear the site cache', description: 'Clear cache' },

  // Logs (2)
  { id: 20, category: 'Logs', toolName: 'get_agent_logs', command: 'Show me the last 10 agent activity logs', description: 'Get activity logs' },
  { id: 21, category: 'Logs', toolName: 'get_agent_log', command: 'Get detailed log for task ID 1', description: 'Get detailed log' },
];

async function testSingleTool(testCase: TestCase): Promise<boolean> {
  console.log('\n' + '═'.repeat(80));
  console.log(`📝 TEST #${testCase.id}: ${testCase.toolName}`);
  console.log('═'.repeat(80));
  console.log(`Category    : ${testCase.category}`);
  console.log(`Tool        : ${testCase.toolName}`);
  console.log(`Description : ${testCase.description}`);
  console.log(`Command     : "${testCase.command}"`);
  console.log('─'.repeat(80));

  try {
    const startTime = Date.now();
    const result = await executeCommand(testCase.command);
    const elapsed = Date.now() - startTime;

    console.log('\n✅ AGENT RESPONSE:');
    console.log('─'.repeat(80));
    console.log(result.output);
    console.log('─'.repeat(80));
    console.log(`⏱️  Execution Time: ${elapsed}ms`);

    // Convert response to string (handle both string and array formats)
    let responseText = '';
    if (Array.isArray(result.output)) {
      // Claude returns array of content blocks
      responseText = result.output
        .map((block: any) => block.text || JSON.stringify(block))
        .join(' ')
        .toLowerCase();
    } else if (typeof result.output === 'string') {
      responseText = result.output.toLowerCase();
    } else {
      responseText = JSON.stringify(result.output).toLowerCase();
    }

    // Check if response mentions success or completion
    const toolMentioned = responseText.includes(testCase.toolName.replace(/_/g, ' ')) || 
                          responseText.includes(testCase.toolName);

    if (toolMentioned || responseText.includes('success') || responseText.includes('completed') || responseText.includes('retrieved')) {
      // Don't print this - let user decide
      return true;
    } else {
      // Don't print this - let user decide
      return false;
    }

  } catch (error: any) {
    console.log('\n❌ ERROR:');
    console.log('─'.repeat(80));
    console.error(error.message || error);
    console.log('─'.repeat(80));
    return false;
  }
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function runInteractiveTests() {
  console.log('\n' + '█'.repeat(80));
  console.log('🤖 SITEMIND TOOL TESTING - AUTO-REVIEW MODE');
  console.log('Testing Claude\'s ability to call 21 tools correctly');
  console.log('█'.repeat(80));
  console.log(`\n📊 Total Tools: 21`);
  console.log(`📅 Started: ${new Date().toLocaleString()}`);
  console.log('⏱️  Waiting 2 seconds between tests for readability...\n');
  console.log('█'.repeat(80));

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  let currentIndex = 0;

  while (currentIndex < TEST_CASES.length) {
    const testCase = TEST_CASES[currentIndex];

    // Show progress
    console.log(`\n\n🎯 Progress: ${currentIndex + 1}/${TEST_CASES.length} (${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped)`);

    const success = await testSingleTool(testCase);

    // Auto-review based on response
    console.log('\n' + '═'.repeat(80));
    
    if (success) {
      results.passed++;
      console.log(`✅ Test #${testCase.id} AUTO-REVIEWED: PASSED ✅`);
    } else {
      results.failed++;
      console.log(`❌ Test #${testCase.id} AUTO-REVIEWED: FAILED ❌`);
    }
    
    currentIndex++;
    
    // Wait 2 seconds before next test for readability
    if (currentIndex < TEST_CASES.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Final Summary
  console.log('\n\n' + '█'.repeat(80));
  console.log('📊 FINAL TEST SUMMARY');
  console.log('█'.repeat(80));
  console.log(`Total Tests  : ${TEST_CASES.length}`);
  console.log(`✅ Passed    : ${results.passed}`);
  console.log(`❌ Failed    : ${results.failed}`);
  console.log(`⏭️  Skipped   : ${results.skipped}`);
  console.log(`📈 Success   : ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('█'.repeat(80));
  console.log(`\n📅 Completed: ${new Date().toLocaleString()}`);

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run interactive tests
runInteractiveTests().catch(console.error);
