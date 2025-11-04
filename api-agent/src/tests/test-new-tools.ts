/**
 * Manual Test Script for New 24 Tools
 * Tests Customer, Product, Analytics, and Content tools
 */

import { createAgent } from '../agents/agent-factory';

async function testNewTools() {
  console.log('🧪 Testing New Tools (24 total)\n');
  console.log('=' .repeat(60));

  const testCommands = [
    // Customer Management Tests (6 tools)
    {
      category: '👥 CUSTOMER MANAGEMENT',
      commands: [
        'Get details for customer 1',
        'Show me orders for customer 1',
        'Get support tickets for customer 1',
        'Get statistics for customer 1',
        'Update customer 1 name to John Doe Updated',
        'Flag customer 1 for suspicious activity with high severity',
      ],
    },

    // Product Management Tests (6 tools)
    {
      category: '📦 PRODUCT MANAGEMENT',
      commands: [
        'Update product 1 stock to 100',
        'Set price of product 1 to 29.99',
        'Disable product 1 availability',
        'Show me products with low stock under 10 units',
        'Create a new product named Test Product with price 19.99 and stock 50',
        'Bulk update products 1,2,3 to mark them as featured',
      ],
    },

    // Analytics & Reporting Tests (6 tools)
    {
      category: '📊 ANALYTICS & REPORTING',
      commands: [
        'Get revenue report for the last 30 days',
        'Show me top 5 products by revenue',
        'What is the customer satisfaction score?',
        'Get conversion rate for last 30 days',
        'Export revenue report as CSV',
        'Generate sales forecast for next 30 days',
      ],
    },

    // Content Management Tests (6 tools)
    {
      category: '📝 CONTENT MANAGEMENT',
      commands: [
        'Schedule post 1 to publish on December 1st 2025',
        'Generate a blog post about AI in E-commerce',
        'Optimize SEO for post 1',
        'Get analytics for post 1',
        'Bulk schedule posts 1,2,3 starting December 1st with 1 day interval',
        'Create a static page titled About Us with slug about-us',
      ],
    },
  ];

  for (const testGroup of testCommands) {
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`${testGroup.category}`);
    console.log('='.repeat(60));

    for (let i = 0; i < testGroup.commands.length; i++) {
      const command = testGroup.commands[i];
      console.log(`\n[Test ${i + 1}/${testGroup.commands.length}] ${command}`);
      console.log('-'.repeat(60));

      try {
        const startTime = Date.now();
        const result = await createAgent(command);
        const duration = Date.now() - startTime;

        console.log('✅ SUCCESS');
        console.log(`⏱️  Duration: ${duration}ms`);
        console.log('📤 Response:');
        console.log(JSON.stringify(result, null, 2).substring(0, 500) + '...');
      } catch (error: any) {
        console.log('❌ FAILED');
        console.log('Error:', error.message);
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('🎉 Testing Complete!');
  console.log('='.repeat(60));
}

// Run tests
testNewTools()
  .then(() => {
    console.log('\n✅ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
