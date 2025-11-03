/**
 * Test all tools with mocked API responses
 * This allows us to test Claude's tool calling without needing Next.js server
 */

import { createClaudeAgent } from '../agents/claude-agent';
import { logger } from '../utils/logger';
import { allTools } from '../tools';

// Mock the API client
jest.mock('../utils/api-client', () => ({
  blogAPI: {
    get: async (id: number) => ({
      success: true,
      action: 'getBlogPost',
      data: {
        post: {
          id,
          title: 'Test Blog Post',
          slug: 'test-blog-post',
          content: 'This is test content',
          excerpt: 'Test excerpt',
          status: 'PUBLISHED',
          authorId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },
      timestamp: new Date().toISOString()
    }),
    create: async (data: any) => ({
      success: true,
      action: 'createBlogPost',
      data: {
        post: {
          id: 999,
          ...data,
          slug: data.title.toLowerCase().replace(/\s+/g, '-'),
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },
      message: 'Blog post created successfully',
      timestamp: new Date().toISOString()
    }),
    update: async (data: any) => ({
      success: true,
      action: 'updateBlogPost',
      data: {
        post: {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      },
      message: 'Blog post updated successfully',
      timestamp: new Date().toISOString()
    }),
    publish: async (id: number) => ({
      success: true,
      action: 'publishBlogPost',
      data: {
        post: {
          id,
          status: 'PUBLISHED',
          publishedAt: new Date().toISOString(),
        }
      },
      message: 'Blog post published successfully',
      timestamp: new Date().toISOString()
    }),
    trash: async (id: number) => ({
      success: true,
      action: 'trashBlogPost',
      data: {
        post: {
          id,
          status: 'TRASHED',
        }
      },
      message: 'Blog post moved to trash',
      timestamp: new Date().toISOString()
    }),
  },
  ticketAPI: {
    get: async (id: number) => ({
      success: true,
      action: 'getTicket',
      data: {
        ticket: {
          id,
          ticketId: `TICK-${id}`,
          subject: 'Test Support Ticket',
          description: 'Customer needs help',
          status: 'OPEN',
          priority: 'MEDIUM',
          customerId: 1,
          createdAt: new Date().toISOString(),
        }
      },
      timestamp: new Date().toISOString()
    }),
    getOpen: async () => ({
      success: true,
      action: 'getOpenTickets',
      data: {
        tickets: [
          {
            id: 1,
            ticketId: 'TICK-1',
            subject: 'Login Issue',
            priority: 'HIGH',
            status: 'OPEN',
          },
          {
            id: 2,
            ticketId: 'TICK-2',
            subject: 'Payment Failed',
            priority: 'URGENT',
            status: 'OPEN',
          }
        ]
      },
      count: 2,
      timestamp: new Date().toISOString()
    }),
    close: async (id: number, resolution?: string) => ({
      success: true,
      action: 'closeTicket',
      data: {
        ticket: {
          id,
          status: 'CLOSED',
          resolution: resolution || 'Issue resolved',
          closedAt: new Date().toISOString(),
        }
      },
      message: 'Ticket closed successfully',
      timestamp: new Date().toISOString()
    }),
    updatePriority: async (id: number, priority: string) => ({
      success: true,
      action: 'updateTicketPriority',
      data: {
        ticket: {
          id,
          priority,
        }
      },
      message: `Ticket priority updated to ${priority}`,
      timestamp: new Date().toISOString()
    }),
    assign: async (id: number, assigneeId: number) => ({
      success: true,
      action: 'assignTicket',
      data: {
        ticket: {
          id,
          assignedTo: assigneeId,
        }
      },
      message: `Ticket assigned to user #${assigneeId}`,
      timestamp: new Date().toISOString()
    }),
  },
  orderAPI: {
    get: async (orderId: string) => ({
      success: true,
      action: 'getOrder',
      data: {
        order: {
          id: 1,
          orderId,
          customerId: 1,
          items: [{ name: 'Product A', quantity: 2, price: 50 }],
          total: 100,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        }
      },
      timestamp: new Date().toISOString()
    }),
    getPending: async () => ({
      success: true,
      action: 'getPendingOrders',
      data: {
        orders: [
          {
            id: 1,
            orderId: 'ORD-001',
            total: 100,
            status: 'PENDING',
          },
          {
            id: 2,
            orderId: 'ORD-002',
            total: 250,
            status: 'PENDING',
          }
        ]
      },
      count: 2,
      timestamp: new Date().toISOString()
    }),
    updateStatus: async (orderId: string, status: string) => ({
      success: true,
      action: 'updateOrderStatus',
      data: {
        order: {
          orderId,
          status,
          updatedAt: new Date().toISOString(),
        }
      },
      message: 'Order status updated successfully',
      timestamp: new Date().toISOString()
    }),
    processRefund: async (orderId: string, reason: string) => ({
      success: true,
      action: 'processRefund',
      data: {
        order: {
          orderId,
          status: 'REFUNDED',
          refundReason: reason,
        }
      },
      message: 'Refund processed successfully',
      timestamp: new Date().toISOString()
    }),
    notifyCustomer: async (orderId: string, subject: string, message: string) => ({
      success: true,
      action: 'notifyCustomer',
      data: {
        orderId,
        emailSent: true,
        subject,
      },
      message: 'Customer notified successfully',
      timestamp: new Date().toISOString()
    }),
  },
  siteAPI: {
    getStatus: async () => ({
      success: true,
      action: 'getSiteStatus',
      data: {
        maintenanceMode: false,
        lastCacheClear: new Date(Date.now() - 3600000).toISOString(),
        uptime: 86400,
      },
      timestamp: new Date().toISOString()
    }),
    getAnalytics: async () => ({
      success: true,
      action: 'getSiteAnalytics',
      data: {
        totalOrders: 150,
        totalRevenue: 45000,
        totalTickets: 25,
        openTickets: 5,
        totalPosts: 42,
      },
      timestamp: new Date().toISOString()
    }),
    toggleMaintenance: async (enabled: boolean) => ({
      success: true,
      action: 'toggleMaintenanceMode',
      data: {
        maintenanceMode: enabled,
        updatedAt: new Date().toISOString(),
      },
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      timestamp: new Date().toISOString()
    }),
    clearCache: async () => ({
      success: true,
      action: 'clearCache',
      data: {
        lastCacheClear: new Date().toISOString(),
        cacheCleared: true,
      },
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    }),
  },
  logsAPI: {
    getAll: async (limit?: number) => ({
      success: true,
      action: 'getAgentLogs',
      data: {
        logs: [
          {
            id: 1,
            taskId: 'task-1',
            task: 'Created blog post',
            status: 'SUCCESS',
            timestamp: new Date().toISOString(),
          },
          {
            id: 2,
            taskId: 'task-2',
            task: 'Closed ticket #5',
            status: 'SUCCESS',
            timestamp: new Date().toISOString(),
          }
        ]
      },
      count: 2,
      timestamp: new Date().toISOString()
    }),
    get: async (id: number) => ({
      success: true,
      action: 'getAgentLog',
      data: {
        log: {
          id,
          taskId: `task-${id}`,
          task: 'Sample agent task',
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          details: [
            { action: 'Step 1', status: 'success' },
            { action: 'Step 2', status: 'success' },
          ]
        }
      },
      timestamp: new Date().toISOString()
    }),
  },
}));

interface TestCase {
  id: number;
  category: string;
  toolName: string;
  command: string;
  expectedAction?: string;
  description: string;
}

const TEST_CASES: TestCase[] = [
  // Blog Tools (5)
  {
    id: 1,
    category: 'Blog Management',
    toolName: 'get_blog_post',
    command: 'Get blog post with ID 1',
    expectedAction: 'getBlogPost',
    description: 'Retrieve a specific blog post by ID'
  },
  {
    id: 2,
    category: 'Blog Management',
    toolName: 'create_blog_post',
    command: 'Create a blog post titled "AI in E-Commerce" with content about how AI is transforming online shopping',
    expectedAction: 'createBlogPost',
    description: 'Create a new blog post with title and content'
  },
  {
    id: 3,
    category: 'Blog Management',
    toolName: 'update_blog_post',
    command: 'Update blog post 1 to change the title to "Updated Title"',
    expectedAction: 'updateBlogPost',
    description: 'Update an existing blog post'
  },
  {
    id: 4,
    category: 'Blog Management',
    toolName: 'publish_blog_post',
    command: 'Publish blog post 1',
    expectedAction: 'publishBlogPost',
    description: 'Publish a draft blog post'
  },
  {
    id: 5,
    category: 'Blog Management',
    toolName: 'trash_blog_post',
    command: 'Move blog post 1 to trash',
    expectedAction: 'trashBlogPost',
    description: 'Move a blog post to trash'
  },

  // Ticket Tools (5)
  {
    id: 6,
    category: 'Support Tickets',
    toolName: 'get_ticket',
    command: 'Get ticket with ID 1',
    expectedAction: 'getTicket',
    description: 'Retrieve a specific support ticket'
  },
  {
    id: 7,
    category: 'Support Tickets',
    toolName: 'get_open_tickets',
    command: 'Show me all open support tickets',
    expectedAction: 'getOpenTickets',
    description: 'List all open tickets'
  },
  {
    id: 8,
    category: 'Support Tickets',
    toolName: 'close_ticket',
    command: 'Close ticket 1 with resolution: Customer issue resolved',
    expectedAction: 'closeTicket',
    description: 'Close a support ticket with resolution'
  },
  {
    id: 9,
    category: 'Support Tickets',
    toolName: 'update_ticket_priority',
    command: 'Update ticket 1 priority to HIGH',
    expectedAction: 'updateTicketPriority',
    description: 'Change ticket priority level'
  },
  {
    id: 10,
    category: 'Support Tickets',
    toolName: 'assign_ticket',
    command: 'Assign ticket 1 to user 5',
    expectedAction: 'assignTicket',
    description: 'Assign ticket to a support agent'
  },

  // Order Tools (5)
  {
    id: 11,
    category: 'Order Management',
    toolName: 'get_order',
    command: 'Get order ORD-12345',
    expectedAction: 'getOrder',
    description: 'Retrieve a specific order'
  },
  {
    id: 12,
    category: 'Order Management',
    toolName: 'get_pending_orders',
    command: 'Show me all pending orders',
    expectedAction: 'getPendingOrders',
    description: 'List all pending orders'
  },
  {
    id: 13,
    category: 'Order Management',
    toolName: 'update_order_status',
    command: 'Update order ORD-12345 status to DELIVERED',
    expectedAction: 'updateOrderStatus',
    description: 'Change order status'
  },
  {
    id: 14,
    category: 'Order Management',
    toolName: 'process_refund',
    command: 'Process refund for order ORD-12345 because product was defective',
    expectedAction: 'processRefund',
    description: 'Process order refund'
  },
  {
    id: 15,
    category: 'Order Management',
    toolName: 'notify_customer',
    command: 'Notify customer for order ORD-12345 with subject "Order Shipped" and message "Your order is on its way"',
    expectedAction: 'notifyCustomer',
    description: 'Send notification to customer'
  },

  // Site Control Tools (4)
  {
    id: 16,
    category: 'Site Control',
    toolName: 'get_site_status',
    command: 'What is the current site status?',
    expectedAction: 'getSiteStatus',
    description: 'Get site maintenance and uptime status'
  },
  {
    id: 17,
    category: 'Site Control',
    toolName: 'get_site_analytics',
    command: 'Show me site analytics',
    expectedAction: 'getSiteAnalytics',
    description: 'Get site analytics and statistics'
  },
  {
    id: 18,
    category: 'Site Control',
    toolName: 'toggle_maintenance_mode',
    command: 'Enable maintenance mode',
    expectedAction: 'toggleMaintenanceMode',
    description: 'Toggle site maintenance mode'
  },
  {
    id: 19,
    category: 'Site Control',
    toolName: 'clear_cache',
    command: 'Clear the site cache',
    expectedAction: 'clearCache',
    description: 'Clear application cache'
  },

  // Logs Tools (2)
  {
    id: 20,
    category: 'Agent Logs',
    toolName: 'get_agent_logs',
    command: 'Show me the last 10 agent activity logs',
    expectedAction: 'getAgentLogs',
    description: 'Retrieve agent activity logs'
  },
  {
    id: 21,
    category: 'Agent Logs',
    toolName: 'get_agent_log',
    command: 'Get detailed log for task ID 1',
    expectedAction: 'getAgentLog',
    description: 'Get detailed log entry'
  },
];

async function testSingleTool(testCase: TestCase): Promise<{
  success: boolean;
  output: string;
  error?: string;
}> {
  console.log('\n' + '═'.repeat(80));
  console.log(`TEST #${testCase.id}: ${testCase.toolName}`);
  console.log('═'.repeat(80));
  console.log(`Category: ${testCase.category}`);
  console.log(`Command: "${testCase.command}"`);
  console.log(`Description: ${testCase.description}`);
  console.log('─'.repeat(80));

  try {
    const agent = await createClaudeAgent();
    const result = await agent.invoke({ input: testCase.command });

    console.log('\n✅ RESULT:');
    console.log(result.output);
    console.log('─'.repeat(80));

    return {
      success: true,
      output: result.output,
    };
  } catch (error: any) {
    console.log('\n❌ ERROR:');
    console.error(error.message || error);
    console.log('─'.repeat(80));

    return {
      success: false,
      output: '',
      error: error.message || String(error),
    };
  }
}

async function runTests() {
  console.log('\n' + '█'.repeat(80));
  console.log('SITEMIND TOOL TESTING - INTERACTIVE MODE');
  console.log('Testing all 21 tools with mocked API responses');
  console.log('█'.repeat(80));

  console.log(`\nTotal Tools: ${allTools.length}`);
  console.log(`Test Cases: ${TEST_CASES.length}`);
  console.log(`\nStarting: ${new Date().toISOString()}\n`);

  const results = {
    passed: 0,
    failed: 0,
    tests: [] as any[],
  };

  for (const testCase of TEST_CASES) {
    const result = await testSingleTool(testCase);
    
    results.tests.push({
      ...testCase,
      ...result,
    });

    if (result.success) {
      results.passed++;
      console.log(`\n✅ Test #${testCase.id} PASSED\n`);
    } else {
      results.failed++;
      console.log(`\n❌ Test #${testCase.id} FAILED\n`);
    }

    // Wait for user review (in interactive mode, add readline here)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '█'.repeat(80));
  console.log('TEST SUMMARY');
  console.log('█'.repeat(80));
  console.log(`Total Tests: ${TEST_CASES.length}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success Rate: ${((results.passed / TEST_CASES.length) * 100).toFixed(1)}%`);
  console.log('█'.repeat(80));

  // Failed tests details
  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests
      .filter(t => !t.success)
      .forEach(t => {
        console.log(`  - Test #${t.id}: ${t.toolName}`);
        console.log(`    Error: ${t.error}`);
      });
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

runTests();
