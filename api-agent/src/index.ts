/**
 * SiteMind Agent Service
 * Main entry point
 */

import { getConfig, validateConfig } from './utils/config';
import { logger } from './utils/logger';
import { wsServer } from './server/websocket';
import { initPinecone, isPineconeAvailable, closePinecone } from './utils/pinecone-client';
import { getMemoryStats } from './utils/memory-store';

/**
 * Main startup function
 */
async function start() {
  try {
    logger.info('🚀 Starting SiteMind Agent Service...\n');

    // Load configuration
    logger.info('📋 Loading configuration...');
    const config = getConfig();
    
    // Validate configuration
    const validation = validateConfig(config);
    if (!validation.valid) {
      logger.error('❌ Configuration validation failed', { errors: validation.errors });
      process.exit(1);
    }
    logger.info('✅ Configuration loaded', {
      port: config.port,
      llmProvider: 'Claude (Anthropic)',
      model: config.claude.modelName,
      nextjsAPI: config.nextjsApiUrl,
    });

    // Initialize Pinecone if configured
    if (isPineconeAvailable()) {
      logger.info('\n🧠 Initializing Pinecone memory...');
      await initPinecone();
      const memoryStats = await getMemoryStats();
      if (memoryStats.enabled) {
        logger.info('✅ Pinecone initialized', {
          index: memoryStats.indexName,
          namespace: memoryStats.namespace,
          vectors: memoryStats.totalVectors,
        });
      } else {
        logger.warn('⚠️  Pinecone configured but initialization failed');
      }
    } else {
      logger.info('\n🧠 Pinecone memory: DISABLED (not configured)');
    }

    // Start WebSocket server (with HTTP endpoints)
    logger.info('\n🌐 Starting WebSocket server with HTTP API...');
    await wsServer.start();

    logger.info('\n✨ Agent Service is ready!\n');
    logger.info('📊 Status:');
    logger.info(`   - HTTP API: http://${config.host}:${config.port}`);
    logger.info(`   - WebSocket: ws://${config.host}:${config.port}${config.wsPath}`);
    logger.info(`   - Claude Model: ${config.claude.modelName}`);
    logger.info(`   - Next.js API: ${config.nextjsApiUrl}`);
    logger.info(`   - Log Level: ${config.logLevel}`);
    logger.info(`   - Memory: ${isPineconeAvailable() ? 'ENABLED (Pinecone)' : 'DISABLED'}`);
    
    // Periodic health check
    startHealthCheck();

  } catch (error) {
    logger.error('❌ Failed to start Agent Service', error);
    process.exit(1);
  }
}

/**
 * Periodic health check
 */
function startHealthCheck() {
  const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

  setInterval(async () => {
    // Log connected clients
    const clientCount = wsServer.getConnectedClients();
    logger.debug(`WebSocket clients: ${clientCount}`);
  }, HEALTH_CHECK_INTERVAL);
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  logger.info('\n🛑 Shutting down Agent Service...');

  try {
    await wsServer.stop();
    logger.info('✅ WebSocket server stopped');
  } catch (error) {
    logger.error('Error stopping WebSocket server', error);
  }

  try {
    await closePinecone();
    logger.info('✅ Pinecone connection closed');
  } catch (error) {
    logger.error('Error closing Pinecone', error);
  }

  logger.info('👋 Agent Service stopped');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  shutdown();
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', reason);
});

// Start the service
start();
