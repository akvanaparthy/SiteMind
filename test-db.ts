import prisma from './lib/prisma';

async function testDB() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found! Database might be empty.');
    } else {
      console.log('👥 Users:');
      users.forEach(user => {
        console.log(`  - ID ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
    // Test customer query
    console.log('\n🔍 Testing customer ID 2...');
    const customer = await prisma.user.findUnique({
      where: { id: 2 },
      include: {
        _count: {
          select: {
            orders: true,
            tickets: true,
          },
        },
      },
    });
    
    if (customer) {
      console.log('✅ Customer found:', JSON.stringify(customer, null, 2));
    } else {
      console.log('❌ Customer ID 2 not found');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
