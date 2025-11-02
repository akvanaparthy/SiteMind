/**
 * SiteMind Agent Service
 * Main entry point
 */

import { getConfig, validateConfig } from './utils/config';
import { logger } from './utils/logger';
import { initializeLMStudio, checkLMStudioHealth } from './utils/lmstudio-client';
import { wsServer } from './server/websocket';

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
      llmProvider: 'LMStudio',
      llmBaseURL: config.llm.baseURL,
      nextjsAPI: config.nextjsApiUrl,
    });

    // Initialize LMStudio connection
    logger.info('\n🤖 Initializing LMStudio connection...');
    try {
      await initializeLMStudio(3);
      logger.info('✅ LMStudio initialized successfully\n');
    } catch (error) {
      logger.error('❌ Failed to initialize LMStudio', error);
      logger.warn('⚠️  Agent service will start, but LLM functionality will be unavailable');
      logger.info('💡 Please ensure LMStudio is running and a model is loaded\n');
    }

    // Start WebSocket server
    logger.info('🌐 Starting WebSocket server...');
    await wsServer.start();

    logger.info('\n✨ Agent Service is ready!\n');
    logger.info('📊 Status:');
    logger.info(`   - WebSocket: ws://${config.host}:${config.port}${config.wsPath}`);
    logger.info(`   - LMStudio: ${config.llm.baseURL}`);
    logger.info(`   - Next.js API: ${config.nextjsApiUrl}`);
    logger.info(`   - Log Level: ${config.logLevel}`);
    
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
    const status = await checkLMStudioHealth();
    
    if (!status.connected) {
      logger.warn('⚠️  LMStudio health check failed: Not connected');
    } else if (!status.modelLoaded) {
      logger.warn('⚠️  LMStudio health check: Model not loaded');
    } else {
      logger.debug('✅ LMStudio health check passed', { model: status.modelName });
    }

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
