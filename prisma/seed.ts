import { PrismaClient, Role, OrderStatus, PostStatus, TicketStatus, TicketPriority, LogStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.agentLog.deleteMany();
  await prisma.order.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.siteConfig.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleaned existing data\n');

  // Create Users
  console.log('👥 Creating users...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sitemind.com',
      password: 'hashed_password_here', // In production, use bcrypt
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: 'hashed_password_here',
      name: 'John Doe',
      role: Role.USER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: 'hashed_password_here',
      name: 'Jane Smith',
      role: Role.USER,
    },
  });

  const aiAgent = await prisma.user.create({
    data: {
      email: 'agent@sitemind.ai',
      name: 'AI Agent',
      role: Role.AI_AGENT,
    },
  });

  console.log(`✅ Created ${4} users\n`);

  // Create Products
  console.log('📦 Creating products...');
  const products = [
    {
      name: 'Premium Wireless Headphones',
      slug: 'premium-wireless-headphones',
      description: 'High-quality noise-canceling wireless headphones with 30-hour battery life.',
      price: 299.99,
      stock: 50,
      category: 'Electronics',
      featured: true,
      images: JSON.stringify(['/images/headphones-1.jpg', '/images/headphones-2.jpg']),
    },
    {
      name: 'Smart Fitness Watch',
      slug: 'smart-fitness-watch',
      description: 'Track your workouts, heart rate, and sleep patterns with this advanced fitness watch.',
      price: 199.99,
      stock: 100,
      category: 'Electronics',
      featured: true,
      images: JSON.stringify(['/images/watch-1.jpg']),
    },
    {
      name: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      description: 'Comfortable office chair with lumbar support and adjustable height.',
      price: 399.99,
      stock: 25,
      category: 'Furniture',
      featured: false,
      images: JSON.stringify(['/images/chair-1.jpg']),
    },
    {
      name: 'Mechanical Keyboard',
      slug: 'mechanical-keyboard',
      description: 'RGB backlit mechanical keyboard with blue switches.',
      price: 149.99,
      stock: 75,
      category: 'Electronics',
      featured: true,
      images: JSON.stringify(['/images/keyboard-1.jpg']),
    },
    {
      name: 'Laptop Stand',
      slug: 'laptop-stand',
      description: 'Aluminum laptop stand with adjustable angles.',
      price: 49.99,
      stock: 150,
      category: 'Accessories',
      featured: false,
      images: JSON.stringify(['/images/stand-1.jpg']),
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`✅ Created ${products.length} products\n`);

  // Create Orders
  console.log('🛒 Creating orders...');
  const orders = [
    {
      customerId: customer1.id,
      items: [
        { productId: 1, name: 'Premium Wireless Headphones', quantity: 1, price: 299.99 },
      ],
      total: 299.99,
      status: OrderStatus.DELIVERED,
    },
    {
      customerId: customer1.id,
      items: [
        { productId: 2, name: 'Smart Fitness Watch', quantity: 1, price: 199.99 },
        { productId: 5, name: 'Laptop Stand', quantity: 1, price: 49.99 },
      ],
      total: 249.98,
      status: OrderStatus.PENDING,
    },
    {
      customerId: customer2.id,
      items: [
        { productId: 3, name: 'Ergonomic Office Chair', quantity: 1, price: 399.99 },
      ],
      total: 399.99,
      status: OrderStatus.DELIVERED,
    },
    {
      customerId: customer2.id,
      items: [
        { productId: 4, name: 'Mechanical Keyboard', quantity: 2, price: 149.99 },
      ],
      total: 299.98,
      status: OrderStatus.PENDING,
    },
    {
      customerId: customer1.id,
      items: [
        { productId: 1, name: 'Premium Wireless Headphones', quantity: 1, price: 299.99 },
      ],
      total: 299.99,
      status: OrderStatus.DELIVERED,
    },
    {
      customerId: customer2.id,
      items: [
        { productId: 2, name: 'Smart Fitness Watch', quantity: 1, price: 199.99 },
      ],
      total: 199.99,
      status: OrderStatus.REFUNDED,
    },
    {
      customerId: customer1.id,
      items: [
        { productId: 4, name: 'Mechanical Keyboard', quantity: 1, price: 149.99 },
        { productId: 5, name: 'Laptop Stand', quantity: 2, price: 49.99 },
      ],
      total: 249.97,
      status: OrderStatus.PENDING,
    },
    {
      customerId: customer2.id,
      items: [
        { productId: 3, name: 'Ergonomic Office Chair', quantity: 1, price: 399.99 },
      ],
      total: 399.99,
      status: OrderStatus.DELIVERED,
    },
    {
      customerId: customer1.id,
      items: [
        { productId: 1, name: 'Premium Wireless Headphones', quantity: 1, price: 299.99 },
        { productId: 4, name: 'Mechanical Keyboard', quantity: 1, price: 149.99 },
      ],
      total: 449.98,
      status: OrderStatus.PENDING,
    },
    {
      customerId: customer2.id,
      items: [
        { productId: 2, name: 'Smart Fitness Watch', quantity: 3, price: 199.99 },
      ],
      total: 599.97,
      status: OrderStatus.DELIVERED,
    },
  ];

  const createdOrders = [];
  for (const order of orders) {
    const created = await prisma.order.create({
      data: order,
    });
    createdOrders.push(created);
  }
  console.log(`✅ Created ${orders.length} orders\n`);

  // Create Blog Posts
  console.log('📝 Creating blog posts...');
  const posts = [
    {
      title: 'The Future of AI in E-Commerce',
      slug: 'future-of-ai-in-ecommerce',
      content: `
# The Future of AI in E-Commerce

Artificial Intelligence is revolutionizing the e-commerce industry. From personalized recommendations to intelligent chatbots, AI is changing how we shop online.

## Key Trends

1. **Personalization at Scale**: AI algorithms analyze customer behavior to provide tailored product recommendations.
2. **Automated Customer Service**: AI-powered chatbots handle customer inquiries 24/7.
3. **Inventory Management**: Predictive analytics help optimize stock levels.
4. **Dynamic Pricing**: AI adjusts prices in real-time based on demand and competition.

The future is here, and it's powered by AI.
      `.trim(),
      excerpt: 'Discover how AI is transforming the e-commerce landscape and what it means for businesses.',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      publishedAt: new Date('2024-10-15'),
    },
    {
      title: '10 Tips for Better Workspace Ergonomics',
      slug: '10-tips-workspace-ergonomics',
      content: `
# 10 Tips for Better Workspace Ergonomics

Creating an ergonomic workspace is essential for productivity and health. Here are our top 10 tips.

## Tips

1. **Adjust Your Chair**: Ensure your feet are flat on the floor.
2. **Monitor Height**: The top of your screen should be at eye level.
3. **Keyboard Position**: Keep your wrists straight while typing.
4. **Take Breaks**: Stand up every 30 minutes.
5. **Proper Lighting**: Reduce eye strain with good lighting.

And 5 more tips...
      `.trim(),
      excerpt: 'Learn how to set up your workspace for maximum comfort and productivity.',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      publishedAt: new Date('2024-10-20'),
    },
    {
      title: 'Our Journey: Building SiteMind',
      slug: 'building-sitemind-journey',
      content: `
# Our Journey: Building SiteMind

This is a draft post about how we built SiteMind from the ground up.

## Coming Soon

- Our tech stack decisions
- Challenges we faced
- Lessons learned
- What's next for SiteMind

Stay tuned!
      `.trim(),
      excerpt: 'Behind the scenes of building an AI-native e-commerce platform.',
      status: PostStatus.DRAFT,
      authorId: admin.id,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }
  console.log(`✅ Created ${posts.length} blog posts\n`);

  // Create Support Tickets
  console.log('🎫 Creating support tickets...');
  const tickets = [
    {
      subject: 'Defective headphones received',
      description: 'The headphones I received have a crackling sound in the left ear. I would like a replacement or refund.',
      customerId: customer1.id,
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
    },
    {
      subject: 'Question about return policy',
      description: 'What is your return policy for electronics? Can I return an opened item?',
      customerId: customer2.id,
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
    },
    {
      subject: 'Order not received',
      description: `I placed an order 2 weeks ago (Order #${createdOrders[1].orderId}) but haven't received it yet. Can you check the status?`,
      customerId: customer1.id,
      status: TicketStatus.OPEN,
      priority: TicketPriority.URGENT,
    },
    {
      subject: 'Bulk order inquiry',
      description: 'I am interested in purchasing 50 mechanical keyboards for my company. Do you offer bulk discounts?',
      customerId: customer2.id,
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
    },
    {
      subject: 'Payment failed',
      description: 'My payment keeps failing when I try to checkout. I have tried multiple cards.',
      customerId: customer1.id,
      status: TicketStatus.CLOSED,
      priority: TicketPriority.HIGH,
      resolution: 'Issue was due to address verification mismatch. Customer updated their billing address and order was successfully placed.',
      closedAt: new Date('2024-10-28'),
    },
  ];

  for (const ticket of tickets) {
    await prisma.ticket.create({ data: ticket });
  }
  console.log(`✅ Created ${tickets.length} support tickets\n`);

  // Create Site Config
  console.log('⚙️ Creating site configuration...');
  await prisma.siteConfig.create({
    data: {
      maintenanceMode: false,
      lastCacheClear: new Date('2024-10-30T12:00:00Z'),
    },
  });
  console.log('✅ Created site configuration\n');

  // Create Sample Agent Logs
  console.log('📊 Creating sample agent logs...');
  const parentLog = await prisma.agentLog.create({
    data: {
      taskId: 'task_refund_order_demo',
      task: 'Process refund for order with defective product',
      status: LogStatus.SUCCESS,
      agentName: 'AI Agent',
      details: [
        { action: 'Query order details', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Verify refund eligibility', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Request user approval', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Process refund via payment gateway', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Update order status to REFUNDED', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Send confirmation email', status: 'success', timestamp: new Date().toISOString() },
      ],
      metadata: {
        orderId: createdOrders[5].orderId,
        amount: 199.99,
        reason: 'Defective product',
        approvedBy: admin.id,
      },
    },
  });

  await prisma.agentLog.create({
    data: {
      taskId: 'task_close_ticket_demo',
      task: 'Close support ticket after resolution',
      status: LogStatus.SUCCESS,
      agentName: 'AI Agent',
      details: [
        { action: 'Query ticket details', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Update ticket status', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Add resolution notes', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Notify customer', status: 'success', timestamp: new Date().toISOString() },
      ],
      metadata: {
        ticketId: 'ticket_payment_failed',
        resolvedBy: aiAgent.id,
      },
    },
  });

  await prisma.agentLog.create({
    data: {
      taskId: 'task_create_blog_post_demo',
      task: 'Generate and publish blog post about workspace ergonomics',
      status: LogStatus.SUCCESS,
      agentName: 'AI Agent',
      details: [
        { action: 'Generate content with LLM', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Create blog post draft', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Generate SEO excerpt', status: 'success', timestamp: new Date().toISOString() },
        { action: 'Publish post', status: 'success', timestamp: new Date().toISOString() },
      ],
      metadata: {
        postId: 2,
        topic: 'workspace ergonomics',
        wordCount: 850,
      },
    },
  });

  console.log(`✅ Created ${3} sample agent logs\n`);

  // Summary
  console.log('📈 Seed Summary:');
  console.log(`   • Users: 4 (1 admin, 2 customers, 1 AI agent)`);
  console.log(`   • Products: ${products.length}`);
  console.log(`   • Orders: ${orders.length}`);
  console.log(`   • Blog Posts: ${posts.length}`);
  console.log(`   • Support Tickets: ${tickets.length}`);
  console.log(`   • Agent Logs: 3`);
  console.log(`   • Site Config: 1\n`);

  console.log('✅ Database seeded successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
