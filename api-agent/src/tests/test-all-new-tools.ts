import { testViaAgent } from './test-via-agent';

const tests = [
  // Customer Tools (2 remaining)
  { name: 'Tool #5: flag_customer', command: 'Flag customer 18 for review due to suspicious activity with high severity' },
  { name: 'Tool #6: get_customer_stats', command: 'Get lifetime statistics for customer 18' },
  
  // Product Tools (6 tools)
  { name: 'Tool #7: update_product_stock', command: 'Set stock for product 1 to 50 units' },
  { name: 'Tool #8: update_product_price', command: 'Update price for product 2 to 299.99' },
  { name: 'Tool #9: toggle_product_availability', command: 'Disable product 3' },
  { name: 'Tool #10: get_low_stock_products', command: 'Show me all products with low stock under 20 units' },
  { name: 'Tool #11: create_product', command: 'Create a new product called "Wireless Mouse" priced at 29.99 with 100 units in stock' },
  { name: 'Tool #12: bulk_update_products', command: 'Update stock for products 1 and 2: set product 1 to 75 units and product 2 to 60 units' },
  
  // Analytics Tools (6 tools)
  { name: 'Tool #13: get_revenue_report', command: 'Show me revenue report for the last 30 days grouped by week' },
  { name: 'Tool #14: get_top_products', command: 'Show me top 5 best selling products by revenue' },
  { name: 'Tool #15: get_customer_satisfaction', command: 'Calculate customer satisfaction score' },
  { name: 'Tool #16: get_conversion_rate', command: 'Get conversion rate for the last 30 days' },
  { name: 'Tool #17: export_analytics_report', command: 'Export revenue report in CSV format for last month' },
  { name: 'Tool #18: get_sales_forecast', command: 'Forecast sales for next 7 days' },
  
  // Content Tools (6 tools)
  { name: 'Tool #19: schedule_post', command: 'Schedule post 1 to publish on 2025-12-01' },
  { name: 'Tool #20: generate_blog_content', command: 'Generate a blog post about AI in ecommerce, professional tone, 500 words' },
  { name: 'Tool #21: optimize_post_seo', command: 'Optimize SEO for post 2' },
  { name: 'Tool #22: get_post_analytics', command: 'Get analytics for post 1' },
  { name: 'Tool #23: bulk_schedule_posts', command: 'Schedule posts 2 and 3 starting from 2025-11-10 with 3 day intervals' },
  { name: 'Tool #24: manage_static_pages', command: 'Create a new page called About Us with content about our company' },
];

async function runAllTests() {
  console.log('🚀 Testing All 20 Remaining New Tools');
  console.log('='.repeat(60));
  
  const results: Array<{ name: string; status: 'PASS' | 'FAIL'; error?: string }> = [];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n[${i + 1}/${tests.length}] ${test.name}`);
    console.log(`Command: "${test.command}"`);
    console.log('-'.repeat(60));
    
    try {
      await testViaAgent(test.command);
      results.push({ name: test.name, status: 'PASS' });
      console.log('✅ PASS\n');
    } catch (error: any) {
      results.push({ name: test.name, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL: ${error.message}\n`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`\n✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed');
  console.log('='.repeat(60));
}

runAllTests().catch(console.error);
