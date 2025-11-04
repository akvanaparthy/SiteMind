/**
 * Memory store for agent conversations using Pinecone
 * Stores embeddings of past interactions for context retrieval
 */

import { getPineconeIndex, isPineconeAvailable } from './pinecone-client';
import { getConfig } from './config';
import { logger } from './logger';
import Anthropic from '@anthropic-ai/sdk';

export interface MemoryEntry {
  id: string;
  timestamp: Date;
  userPrompt: string;
  agentResponse: string;
  actions: string[];
  metadata?: Record<string, any>;
}

export interface RelevantMemory {
  id: string;
  userPrompt: string;
  agentResponse: string;
  actions: string[];
  score: number;
  timestamp: Date;
}

/**
 * Generate embeddings using Claude (via prompt-based approach)
 * Note: Claude doesn't have native embeddings, so we'll use a simple text representation
 */
function generateSimpleEmbedding(text: string): number[] {
  // Simple hash-based embedding (1536 dimensions to match common embedding models)
  // In production, you'd use a proper embedding model like OpenAI's text-embedding-ada-002
  const embedding = new Array(1536).fill(0);
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = charCode % 1536;
    embedding[index] += 1;
  }
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

/**
 * Store a memory entry in Pinecone
 */
export async function storeMemory(entry: MemoryEntry): Promise<boolean> {
  if (!isPineconeAvailable()) {
    logger.debug('Pinecone not available, skipping memory storage');
    return false;
  }

  try {
    const index = await getPineconeIndex();
    if (!index) {
      return false;
    }

    const config = getConfig();
    const namespace = config.pinecone?.namespace || 'agent-memory';

    // Create text for embedding
    const text = `User: ${entry.userPrompt}\nAgent: ${entry.agentResponse}\nActions: ${entry.actions.join(', ')}`;
    
    // Generate embedding
    const embedding = generateSimpleEmbedding(text);

    // Store in Pinecone
    await index.namespace(namespace).upsert([
      {
        id: entry.id,
        values: embedding,
        metadata: {
          userPrompt: entry.userPrompt,
          agentResponse: entry.agentResponse,
          actions: JSON.stringify(entry.actions),
          timestamp: entry.timestamp.toISOString(),
          ...entry.metadata,
        },
      },
    ]);

    logger.info(`Memory stored: ${entry.id}`);
    return true;
  } catch (error) {
    logger.error('Failed to store memory:', error);
    return false;
  }
}

/**
 * Retrieve relevant memories for a query
 */
export async function retrieveRelevantMemories(
  query: string,
  topK: number = 5
): Promise<RelevantMemory[]> {
  if (!isPineconeAvailable()) {
    logger.debug('Pinecone not available, returning empty memories');
    return [];
  }

  try {
    const index = await getPineconeIndex();
    if (!index) {
      return [];
    }

    const config = getConfig();
    const namespace = config.pinecone?.namespace || 'agent-memory';

    // Generate query embedding
    const queryEmbedding = generateSimpleEmbedding(query);

    // Query Pinecone
    const results = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    // Parse results
    const memories: RelevantMemory[] = results.matches
      ?.filter(match => match.metadata)
      .map(match => ({
        id: match.id,
        userPrompt: match.metadata!.userPrompt as string,
        agentResponse: match.metadata!.agentResponse as string,
        actions: JSON.parse(match.metadata!.actions as string),
        score: match.score || 0,
        timestamp: new Date(match.metadata!.timestamp as string),
      })) || [];

    logger.info(`Retrieved ${memories.length} relevant memories for query`);
    return memories;
  } catch (error) {
    logger.error('Failed to retrieve memories:', error);
    return [];
  }
}

/**
 * Clear all memories (use with caution!)
 */
export async function clearAllMemories(): Promise<boolean> {
  if (!isPineconeAvailable()) {
    logger.debug('Pinecone not available, nothing to clear');
    return false;
  }

  try {
    const index = await getPineconeIndex();
    if (!index) {
      return false;
    }

    const config = getConfig();
    const namespace = config.pinecone?.namespace || 'agent-memory';

    // Delete all vectors in namespace
    await index.namespace(namespace).deleteAll();

    logger.warn('All memories cleared from Pinecone');
    return true;
  } catch (error) {
    logger.error('Failed to clear memories:', error);
    return false;
  }
}

/**
 * Get memory statistics
 */
export async function getMemoryStats(): Promise<{
  enabled: boolean;
  totalVectors?: number;
  indexName?: string;
  namespace?: string;
}> {
  const config = getConfig();
  const enabled = isPineconeAvailable();

  if (!enabled) {
    return { enabled: false };
  }

  try {
    const index = await getPineconeIndex();
    if (!index) {
      return { enabled: false };
    }

    const stats = await index.describeIndexStats();
    const namespace = config.pinecone?.namespace || 'agent-memory';
    const namespaceStats = stats.namespaces?.[namespace];

    return {
      enabled: true,
      totalVectors: namespaceStats?.recordCount || 0,
      indexName: config.pinecone?.indexName,
      namespace,
    };
  } catch (error) {
    logger.error('Failed to get memory stats:', error);
    return { enabled: false };
  }
}

/**
 * Format relevant memories for inclusion in agent prompt
 */
export function formatMemoriesForPrompt(memories: RelevantMemory[]): string {
  if (memories.length === 0) {
    return '';
  }

  const formattedMemories = memories.map((mem, idx) => {
    const timeAgo = formatTimeAgo(mem.timestamp);
    return `[Memory ${idx + 1} - ${timeAgo}, relevance: ${(mem.score * 100).toFixed(1)}%]
User: ${mem.userPrompt}
Agent: ${mem.agentResponse}
Actions: ${mem.actions.join(', ')}`;
  }).join('\n\n');

  return `\n\n## Relevant Past Interactions:\n${formattedMemories}\n`;
}

/**
 * Format time ago helper
 */
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
