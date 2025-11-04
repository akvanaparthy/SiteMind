/**
 * Test Pinecone memory integration
 */

import { initPinecone, isPineconeAvailable } from '../utils/pinecone-client';
import { storeMemory, retrieveRelevantMemories, getMemoryStats, formatMemoriesForPrompt } from '../utils/memory-store';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

async function testPinecone() {
  console.log('🧪 Testing Pinecone Memory Integration\n');

  // Check if Pinecone is available
  if (!isPineconeAvailable()) {
    console.log('❌ Pinecone not configured. Please set PINECONE_API_KEY in .env');
    console.log('   Get your API key from: https://www.pinecone.io/');
    process.exit(1);
  }

  console.log('✅ Pinecone is configured\n');

  // Initialize Pinecone
  console.log('📡 Initializing Pinecone...');
  const client = await initPinecone();
  if (!client) {
    console.log('❌ Failed to initialize Pinecone');
    process.exit(1);
  }
  console.log('✅ Pinecone initialized\n');

  // Get stats
  console.log('📊 Memory Statistics:');
  const stats = await getMemoryStats();
  console.log(`   Index: ${stats.indexName}`);
  console.log(`   Namespace: ${stats.namespace}`);
  console.log(`   Total Vectors: ${stats.totalVectors}`);
  console.log('');

  // Store test memories
  console.log('💾 Storing test memories...');
  
  const testMemories = [
    {
      id: uuidv4(),
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      userPrompt: 'List all pending orders',
      agentResponse: 'I found 3 pending orders: Order #ABC123 ($150), Order #DEF456 ($200), Order #GHI789 ($75)',
      actions: ['list_orders'],
    },
    {
      id: uuidv4(),
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      userPrompt: 'Close ticket #45',
      agentResponse: "I've closed ticket #45 - Customer inquiry about shipping.",
      actions: ['close_ticket'],
    },
    {
      id: uuidv4(),
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      userPrompt: 'Update order #ABC123 to delivered',
      agentResponse: 'Order #ABC123 has been marked as DELIVERED. Customer John Smith will be notified.',
      actions: ['update_order_status'],
    },
  ];

  for (const memory of testMemories) {
    const stored = await storeMemory(memory);
    console.log(`   ${stored ? '✅' : '❌'} Stored: "${memory.userPrompt}"`);
  }
  console.log('');

  // Wait a bit for indexing
  console.log('⏳ Waiting for Pinecone to index vectors...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('');

  // Test retrieval
  console.log('🔍 Testing memory retrieval...\n');

  const testQueries = [
    'What orders are pending?',
    'Show me ticket information',
    'Update order status',
  ];

  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    const memories = await retrieveRelevantMemories(query, 2);
    
    if (memories.length === 0) {
      console.log('   No memories found');
    } else {
      console.log(`   Found ${memories.length} relevant memories:`);
      memories.forEach((mem, idx) => {
        console.log(`   ${idx + 1}. [${(mem.score * 100).toFixed(1)}% match] ${mem.userPrompt}`);
        console.log(`      Response: ${mem.agentResponse.substring(0, 80)}...`);
      });
    }
    console.log('');
  }

  // Test formatted output
  console.log('📝 Testing formatted memory for prompt:\n');
  const query = 'What were the recent orders?';
  const memories = await retrieveRelevantMemories(query, 2);
  const formatted = formatMemoriesForPrompt(memories);
  console.log(formatted);
  console.log('');

  // Final stats
  console.log('📊 Final Memory Statistics:');
  const finalStats = await getMemoryStats();
  console.log(`   Total Vectors: ${finalStats.totalVectors}`);
  console.log('');

  console.log('✅ All tests completed successfully!');
}

// Run tests
testPinecone().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
