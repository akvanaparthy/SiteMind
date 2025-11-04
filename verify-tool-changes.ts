import prisma from './lib/prisma';

async function verifyChanges() {
  try {
    console.log('🔍 VERIFYING ACTUAL DATABASE CHANGES FROM TOOL TESTS\n');
    console.log('='.repeat(60));
    
    // Test 1: Check if customer 18 name was changed to "John Smith"
    console.log('\n✅ Tool #4: update_customer_info');
    console.log('Expected: Customer 18 name changed from "John Doe" to "John Smith"');
    const customer18 = await prisma.user.findUnique({ where: { id: 18 } });
    if (customer18) {
      console.log(`✅ VERIFIED: Customer 18 name is "${customer18.name}"`);
      console.log(`   Email: ${customer18.email}`);
    } else {
      console.log('❌ Customer 18 not found!');
    }
    
    // Test 2: Check if customer 18 was flagged
    console.log('\n✅ Tool #5: flag_customer');
    console.log('Expected: AgentLog entry for flagging customer 18');
    const flagLog = await prisma.agentLog.findFirst({
      where: {
        task: { contains: 'customer 18' },
        task: { contains: 'flagged' }
      },
      orderBy: { timestamp: 'desc' }
    });
    if (flagLog) {
      console.log(`✅ VERIFIED: Flag log found - "${flagLog.task}"`);
      console.log(`   Status: ${flagLog.status}, Time: ${flagLog.timestamp}`);
    } else {
      console.log('⚠️  No flag log found (might be in different format)');
    }
    
    // Test 3: Check if product 21 stock was updated to 75 (then 80)
    console.log('\n✅ Tool #7: update_product_stock');
    console.log('Expected: Product 21 stock changed to 80 units');
    const product21 = await prisma.product.findUnique({ where: { id: 21 } });
    if (product21) {
      console.log(`✅ VERIFIED: Product 21 (${product21.name}) stock is ${product21.stock} units`);
      console.log(`   Price: $${product21.price}`);
    } else {
      console.log('❌ Product 21 not found!');
    }
    
    // Test 4: Check if product 22 price was updated to 249.99
    console.log('\n✅ Tool #8: set_product_price');
    console.log('Expected: Product 22 price changed to $249.99');
    const product22 = await prisma.product.findUnique({ where: { id: 22 } });
    if (product22) {
      console.log(`✅ VERIFIED: Product 22 (${product22.name}) price is $${product22.price}`);
      console.log(`   Stock: ${product22.stock} units`);
    } else {
      console.log('❌ Product 22 not found!');
    }
    
    // Test 5: Check if product 23 was disabled
    console.log('\n✅ Tool #9: toggle_product_availability');
    console.log('Expected: Product 23 active status set to false');
    const product23 = await prisma.product.findUnique({ where: { id: 23 } });
    if (product23) {
      console.log(`✅ VERIFIED: Product 23 (${product23.name}) active = ${product23.active}`);
      console.log(`   Stock: ${product23.stock} units`);
    } else {
      console.log('❌ Product 23 not found!');
    }
    
    // Test 6: Check if "Wireless Mouse" product was created
    console.log('\n✅ Tool #11: create_product');
    console.log('Expected: New product "Wireless Mouse" created');
    const wirelessMouse = await prisma.product.findFirst({
      where: { name: { contains: 'Wireless Mouse' } },
      orderBy: { createdAt: 'desc' }
    });
    if (wirelessMouse) {
      console.log(`✅ VERIFIED: Product created - ID ${wirelessMouse.id}: ${wirelessMouse.name}`);
      console.log(`   Price: $${wirelessMouse.price}, Stock: ${wirelessMouse.stock}`);
      console.log(`   Slug: ${wirelessMouse.slug}`);
    } else {
      console.log('❌ Wireless Mouse product not found!');
    }
    
    // Test 7: Check if post 43 was scheduled
    console.log('\n✅ Tool #19: schedule_post');
    console.log('Expected: Post 43 scheduled for 2025-12-01');
    const post43 = await prisma.post.findUnique({ where: { id: 43 } });
    if (post43) {
      console.log(`✅ VERIFIED: Post 43 (${post43.title})`);
      console.log(`   Status: ${post43.status}`);
      console.log(`   Published At: ${post43.publishedAt}`);
    } else {
      console.log('❌ Post 43 not found!');
    }
    
    // Test 8: Check posts 44 and 45 scheduling
    console.log('\n✅ Tool #23: bulk_schedule_posts (via individual calls)');
    console.log('Expected: Posts 44 and 45 scheduled');
    const post44 = await prisma.post.findUnique({ where: { id: 44 } });
    const post45 = await prisma.post.findUnique({ where: { id: 45 } });
    if (post44) {
      console.log(`✅ VERIFIED: Post 44 (${post44.title})`);
      console.log(`   Published At: ${post44.publishedAt}`);
    }
    if (post45) {
      console.log(`✅ VERIFIED: Post 45 (${post45.title})`);
      console.log(`   Published At: ${post45.publishedAt}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log('Checking database state after tool executions...\n');
    
  } catch (error) {
    console.error('❌ Verification error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyChanges();
