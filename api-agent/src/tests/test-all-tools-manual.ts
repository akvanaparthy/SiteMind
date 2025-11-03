/**
 * Comprehensive Manual Tool Testing Script
 * Tests all 21 tools one by one with the LMStudio FC agent
 * 
 * Run: tsx src/tests/test-all-tools-manual.ts
 */

import { executeCommand } from '../agents/agent-factory';
import { logger } from '../utils/logger';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

interface TestResult {
  testName: string;
  category: string;
  command: string;
  success: boolean;
  response?: string;
  error?: string;
  validJSON: boolean;
  hasRequiredFields: boolean;
  executionTime: number;
}

const results: TestResult[] = [];

/**
 * Test a single command and record results
 */
async function testCommand(
  category: string,
  testName: string,
  command: string
): Promise<TestResult> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${colors.cyan}TESTING: ${testName}${colors.reset}`);
  console.log(`${colors.blue}Category: ${category}${colors.reset}`);
  console.log(`${colors.yellow}Command: "${command}"${colors.reset}`);
  console.log('='.repeat(80));

  const startTime = Date.now();
  let success = false;
  let response = '';
  let error = '';
  let validJSON = false;
  let hasRequiredFields = false;

  try {
    const result = await executeCommand(command);
    response = result.output;
    success = true;

    console.log(`\n${colors.green}✓ Command executed successfully${colors.reset}`);
    console.log(`\n${colors.magenta}RESPONSE:${colors.reset}`);
    console.log(response);

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(response);
      validJSON = true;
      console.log(`\n${colors.green}✓ Valid JSON response${colors.reset}`);

      // Check required fields
      if (
        parsed.hasOwnProperty('status') &&
        parsed.hasOwnProperty('action') &&
        parsed.hasOwnProperty('message')
      ) {
        hasRequiredFields = true;
        console.log(`${colors.green}✓ Has required fields (status, action, message)${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ Missing required fields${colors.reset}`);
        console.log(`  Found fields: ${Object.keys(parsed).join(', ')}`);
      }

      // Display key information
      if (parsed.status) {
        console.log(`\n${colors.cyan}Status: ${parsed.status}${colors.reset}`);
      }
      if (parsed.action) {
        console.log(`${colors.cyan}Action: ${parsed.action}${colors.reset}`);
      }
      if (parsed.message) {
        console.log(`${colors.cyan}Message: ${parsed.message}${colors.reset}`);
      }
    } catch (parseError) {
      validJSON = false;
      console.log(`\n${colors.red}✗ Invalid JSON response${colors.reset}`);
      console.log(`Parse error: ${parseError}`);
    }
  } catch (err: any) {
    success = false;
    error = err.message || String(err);
    console.log(`\n${colors.red}✗ Command failed${colors.reset}`);
    console.log(`Error: ${error}`);
  }

  const executionTime = Date.now() - startTime;
  console.log(`\n${colors.blue}Execution time: ${executionTime}ms${colors.reset}`);

  const result: TestResult = {
    testName,
    category,
    command,
    success,
    response,
    error,
    validJSON,
    hasRequiredFields,
    executionTime,
  };

  results.push(result);
  return result;
}

/**
 * Print summary of all test results
 */
function printSummary() {
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`${colors.magenta}TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(80));

  const totalTests = results.length;
  const successfulTests = results.filter((r) => r.success).length;
  const validJSONTests = results.filter((r) => r.validJSON).length;
  const completeTests = results.filter((r) => r.hasRequiredFields).length;

  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`${colors.green}Successful: ${successfulTests} (${((successfulTests / totalTests) * 100).toFixed(1)}%)${colors.reset}`);
  console.log(`${colors.green}Valid JSON: ${validJSONTests} (${((validJSONTests / totalTests) * 100).toFixed(1)}%)${colors.reset}`);
  console.log(`${colors.green}Complete Response: ${completeTests} (${((completeTests / totalTests) * 100).toFixed(1)}%)${colors.reset}`);

  // Group by category
  const categories = [...new Set(results.map((r) => r.category))];
  
  console.log(`\n${colors.cyan}Results by Category:${colors.reset}`);
  for (const category of categories) {
    const categoryResults = results.filter((r) => r.category === category);
    const categorySuccess = categoryResults.filter((r) => r.success).length;
    console.log(`\n${category}:`);
    console.log(`  Success Rate: ${categorySuccess}/${categoryResults.length} (${((categorySuccess / categoryResults.length) * 100).toFixed(1)}%)`);
    
    for (const result of categoryResults) {
      const icon = result.success && result.validJSON && result.hasRequiredFields ? '✓' : 
                   result.success && result.validJSON ? '⚠' : 
                   result.success ? '⚠⚠' : '✗';
      const color = result.success && result.validJSON && result.hasRequiredFields ? colors.green :
                    result.success && result.validJSON ? colors.yellow :
                    result.success ? colors.yellow : colors.red;
      console.log(`  ${color}${icon}${colors.reset} ${result.testName} (${result.executionTime}ms)`);
    }
  }

  // Failed tests details
  const failedTests = results.filter((r) => !r.success);
  if (failedTests.length > 0) {
    console.log(`\n${colors.red}Failed Tests Details:${colors.reset}`);
    for (const test of failedTests) {
      console.log(`\n${test.testName}:`);
      console.log(`  Command: "${test.command}"`);
      console.log(`  Error: ${test.error}`);
    }
  }

  // Invalid JSON responses
  const invalidJSONTests = results.filter((r) => r.success && !r.validJSON);
  if (invalidJSONTests.length > 0) {
    console.log(`\n${colors.yellow}Invalid JSON Responses:${colors.reset}`);
    for (const test of invalidJSONTests) {
      console.log(`\n${test.testName}:`);
      console.log(`  Command: "${test.command}"`);
      console.log(`  Response: ${test.response?.substring(0, 200)}...`);
    }
  }

  // Average execution time
  const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / totalTests;
  console.log(`\n${colors.blue}Average Execution Time: ${avgTime.toFixed(0)}ms${colors.reset}`);
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`\n${colors.magenta}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.magenta}SITEMIND COMPREHENSIVE TOOL TESTING${colors.reset}`);
  console.log(`${colors.magenta}${'='.repeat(80)}${colors.reset}`);
  console.log(`\nTesting all 21 tools with LMStudio FC agent`);
  console.log(`Starting: ${new Date().toISOString()}\n`);

  try {
    // ============================================================================
    // BLOG TOOLS (5 tests)
    // ============================================================================
    
    await testCommand(
      'Blog Tools',
      'Get Blog Post by ID',
      'Get blog post with ID 1'
    );

    await testCommand(
      'Blog Tools',
      'Get Blog Post by Slug',
      'Get blog post with slug "future-of-ai-in-ecommerce"'
    );

    await testCommand(
      'Blog Tools',
      'Create Blog Post',
      'Create a blog post titled "AI Testing Guide" with content "This is a test post about AI testing methodologies." by author ID 1'
    );

    await testCommand(
      'Blog Tools',
      'Update Blog Post',
      'Update blog post 1 title to "Updated AI Trends"'
    );

    await testCommand(
      'Blog Tools',
      'Publish Blog Post',
      'Publish blog post 2'
    );

    // ============================================================================
    // TICKET TOOLS (5 tests)
    // ============================================================================

    await testCommand(
      'Ticket Tools',
      'Get Ticket by ID',
      'Get ticket with ID 1'
    );

    await testCommand(
      'Ticket Tools',
      'Get All Open Tickets',
      'Show me all open support tickets'
    );

    await testCommand(
      'Ticket Tools',
      'Close Ticket',
      'Close ticket 5 with resolution "Issue resolved by updating billing address"'
    );

    await testCommand(
      'Ticket Tools',
      'Update Ticket Priority',
      'Update ticket 2 priority to HIGH'
    );

    await testCommand(
      'Ticket Tools',
      'Assign Ticket',
      'Assign ticket 3 to user ID 1'
    );

    // ============================================================================
    // ORDER TOOLS (5 tests)
    // ============================================================================

    await testCommand(
      'Order Tools',
      'Get Order by ID',
      'Get order with ID 1'
    );

    await testCommand(
      'Order Tools',
      'Get Pending Orders',
      'Show me all pending orders'
    );

    await testCommand(
      'Order Tools',
      'Update Order Status',
      'Update order 2 status to DELIVERED'
    );

    await testCommand(
      'Order Tools',
      'Process Refund (Approval Required)',
      'Refund order 6 due to defective product'
    );

    await testCommand(
      'Order Tools',
      'Notify Customer',
      'Notify customer about order 1 with subject "Order Shipped" and message "Your order has been shipped and will arrive in 3-5 business days"'
    );

    // ============================================================================
    // SITE TOOLS (4 tests)
    // ============================================================================

    await testCommand(
      'Site Tools',
      'Get Site Status',
      'Show me the site status'
    );

    await testCommand(
      'Site Tools',
      'Get Site Analytics',
      'Get site analytics'
    );

    await testCommand(
      'Site Tools',
      'Clear Cache',
      'Clear the site cache'
    );

    await testCommand(
      'Site Tools',
      'Toggle Maintenance Mode (Approval Required)',
      'Enable maintenance mode for urgent database updates'
    );

    // ============================================================================
    // LOGS TOOLS (2 tests)
    // ============================================================================

    await testCommand(
      'Logs Tools',
      'Get All Agent Logs',
      'Show me all agent logs'
    );

    await testCommand(
      'Logs Tools',
      'Get Agent Log by ID',
      'Get agent log with ID 1'
    );

    // ============================================================================
    // SUMMARY
    // ============================================================================

    printSummary();

    console.log(`\n${colors.magenta}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.magenta}TESTING COMPLETE${colors.reset}`);
    console.log(`${colors.magenta}${'='.repeat(80)}${colors.reset}`);
    console.log(`Finished: ${new Date().toISOString()}\n`);

  } catch (error) {
    console.error(`\n${colors.red}Fatal error during testing:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the tests
runAllTests()
  .then(() => {
    console.log(`\n${colors.green}All tests completed. Review results above.${colors.reset}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n${colors.red}Test runner failed:${colors.reset}`, error);
    process.exit(1);
  });
