import prisma from './lib/prisma';

async function testDB() {
  try {
    console.log('🔍 Checking database IDs...\n');
    
    // Get all products
    const products = await prisma.product.findMany();
    console.log(`� Total products in database: ${products.length}\n`);
    
    if (products.length === 0) {
      console.log('❌ No products found! Database might be empty.');
    } else {
      console.log('� Products:');
      products.forEach(product => {
        console.log(`  - ID ${product.id}: ${product.name} - $${product.price} (Stock: ${product.stock})`);
      });
    }
    
    // Get all posts
    console.log('\n� Posts:');
    const posts = await prisma.post.findMany();
    posts.forEach(post => {
      console.log(`  - ID ${post.id}: ${post.title} - ${post.status}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
