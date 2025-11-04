/**
 * Pinecone client for vector database operations
 * Handles agent memory storage and retrieval
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { getConfig } from './config';
import { logger } from './logger';

let pineconeClient: Pinecone | null = null;

/**
 * Initialize Pinecone client
 */
export async function initPinecone(): Promise<Pinecone | null> {
  if (pineconeClient) {
    return pineconeClient;
  }

  const config = getConfig();

  // Check if Pinecone is configured
  if (!config.pinecone?.apiKey) {
    logger.info('Pinecone not configured, skipping initialization');
    return null;
  }

  try {
    logger.info('Initializing Pinecone client...');
    
    pineconeClient = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });

    // Test connection by listing indexes
    const indexes = await pineconeClient.listIndexes();
    logger.info(`Pinecone connected. Available indexes: ${indexes.indexes?.map(i => i.name).join(', ') || 'none'}`);

    // Check if our index exists
    const indexExists = indexes.indexes?.some(i => i.name === config.pinecone!.indexName);
    if (!indexExists) {
      logger.warn(`Pinecone index "${config.pinecone.indexName}" not found. Please create it manually.`);
    }

    return pineconeClient;
  } catch (error) {
    logger.error('Failed to initialize Pinecone:', error);
    pineconeClient = null;
    return null;
  }
}

/**
 * Get Pinecone index for operations
 */
export async function getPineconeIndex() {
  const client = await initPinecone();
  if (!client) {
    return null;
  }

  const config = getConfig();
  if (!config.pinecone) {
    return null;
  }

  return client.index(config.pinecone.indexName);
}

/**
 * Check if Pinecone is available
 */
export function isPineconeAvailable(): boolean {
  const config = getConfig();
  return !!(config.pinecone?.apiKey && config.pinecone?.indexName);
}

/**
 * Close Pinecone connection (cleanup)
 */
export async function closePinecone(): Promise<void> {
  if (pineconeClient) {
    logger.info('Closing Pinecone connection');
    pineconeClient = null;
  }
}
