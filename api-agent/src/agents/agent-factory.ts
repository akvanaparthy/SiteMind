/**
 * Agent Factory for Claude
 * Creates Claude Haiku 3 agent instances with memory support
 */

import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { createClaudeAgent } from './claude-agent';
import { AgentLogSession } from '../utils/agent-log-client';
import { 
  storeMemory, 
  retrieveRelevantMemories, 
  formatMemoriesForPrompt,
} from '../utils/memory-store';
import { isPineconeAvailable } from '../utils/pinecone-client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a Claude agent
 * 
 * @returns Agent executor configured for Claude
 */
export async function createAgent(): Promise<any> {
  const config = getConfig();

  logger.info('═══════════════════════════════════════════════════');
  logger.info('🚀 INITIALIZING AI AGENT');
  logger.info('═══════════════════════════════════════════════════');
  logger.info('📡 Provider: CLAUDE');
  logger.info('🔧 Mode: Claude Haiku 3 (Anthropic Messages API)');
  logger.info(`📋 Model: ${config.claude.modelName}`);
  logger.info(`🧠 Memory: ${isPineconeAvailable() ? 'ENABLED (Pinecone)' : 'DISABLED'}`);
  logger.info('═══════════════════════════════════════════════════');

  return await createClaudeAgent();
}

/**
 * Get the current agent mode description
 */
export function getAgentMode(): {
  provider: 'claude';
  mode: string;
  description: string;
} {
  const config = getConfig();
  return {
    provider: 'claude',
    mode: 'Claude Haiku 3',
    description: `Anthropic Messages API with tool use - ${config.claude.modelName}`,
  };
}

/**
 * Execute a command with the Claude agent
 * 
 * @param prompt - User command or question
 * @param history - Optional conversation history for context
 * @returns Agent response with formatted output, intermediate steps, and log ID
 */
export async function executeCommand(
  prompt: string,
  history?: Array<{ role: 'user' | 'agent'; content: string }>
): Promise<{ output: string; rawOutput?: any; intermediateSteps?: any[]; logId?: number }> {
  logger.info('═══════════════════════════════════════════════════');
  logger.info('📨 NEW COMMAND');
  logger.info('═══════════════════════════════════════════════════');
  logger.info(`💬 Prompt: "${prompt}"`);
  if (history && history.length > 0) {
    logger.info(`📜 Context: ${history.length} previous messages`);
  }
  logger.info('');

  const agent = await createAgent();

  logger.info('');
  logger.info('⚙️  EXECUTING COMMAND...');
  logger.info('');

  try {
    // Retrieve relevant memories if Pinecone is available
    let memoryContext = '';
    if (isPineconeAvailable()) {
      logger.info('🧠 Retrieving relevant memories from Pinecone...');
      const relevantMemories = await retrieveRelevantMemories(prompt, 3);
      if (relevantMemories.length > 0) {
        memoryContext = formatMemoriesForPrompt(relevantMemories);
        logger.info(`📚 Found ${relevantMemories.length} relevant past interactions`);
      } else {
        logger.info('📚 No relevant memories found');
      }
    }

    // Build conversation context if history exists
    let fullPrompt = prompt;
    if (history && history.length > 0) {
      const contextMessages = history
        .slice(-4) // Keep last 4 messages for context (2 exchanges)
        .map((msg) => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${msg.content}`;
        })
        .join('\n\n');
      
      fullPrompt = `Previous conversation context:\n${contextMessages}\n\nCurrent request: ${prompt}`;
      logger.info('💭 Added conversation context');
    }

    // Add memory context if available
    if (memoryContext) {
      fullPrompt = `${memoryContext}\n\n${fullPrompt}`;
    }

    // Start logging to database
    const logSession = await AgentLogSession.start(prompt, {
      hasContext: history && history.length > 0,
      contextLength: history?.length || 0,
    });

    logger.info(`📝 Created agent log ID: ${logSession.getLogId()}`);

    try {
      await logSession.update('Initializing agent execution');
      
      const result = await agent.invoke({ input: fullPrompt });

      await logSession.update('Agent execution completed');

      logger.info('');
      logger.info('═══════════════════════════════════════════════════');
      logger.info('✅ COMMAND COMPLETED SUCCESSFULLY');
      logger.info('═══════════════════════════════════════════════════');

      // Format the output for frontend consumption
      const output = result.output || result;
      let formattedOutput: string;

      // Handle different output formats
      if (typeof output === 'string') {
        formattedOutput = output;
      } else if (Array.isArray(output)) {
        // Claude returns array of content blocks: [{ type: 'text', text: '...' }]
        formattedOutput = output
          .filter((block: any) => block.type === 'text')
          .map((block: any) => block.text)
          .join('\n\n');
      } else if (output && typeof output === 'object') {
        // Handle object responses
        if (output.text) {
          formattedOutput = output.text;
        } else if (output.content) {
          formattedOutput = Array.isArray(output.content)
            ? output.content.map((c: any) => c.text || JSON.stringify(c)).join('\n')
            : output.content;
        } else {
          formattedOutput = JSON.stringify(output, null, 2);
        }
      } else {
        formattedOutput = String(output);
      }

      // Extract tool calls from intermediate steps for logging
      const toolCalls = result.intermediateSteps?.map((step: any) => ({
        tool: step.action?.tool || 'unknown',
        input: step.action?.toolInput || {},
        output: step.observation || '',
        status: step.observation && !step.observation.includes('Error') ? 'success' : 'failed',
      })) || [];

      // Log each tool call
      for (const tool of toolCalls) {
        const logAction = `🔧 Tool: ${tool.tool}`;
        if (tool.status === 'success') {
          await logSession.update(logAction, { input: tool.input, output: tool.output });
        } else {
          await logSession.updateWithError(logAction, tool.output);
        }
      }

      // Mark as complete
      const summary = formattedOutput.substring(0, 100) + (formattedOutput.length > 100 ? '...' : '');
      await logSession.complete(summary);

      // Store interaction in memory if Pinecone is available
      if (isPineconeAvailable()) {
        const actions = toolCalls.map((tc: any) => tc.tool);
        const memoryId = uuidv4();
        
        logger.info('🧠 Storing interaction in Pinecone memory...');
        const stored = await storeMemory({
          id: memoryId,
          timestamp: new Date(),
          userPrompt: prompt,
          agentResponse: formattedOutput,
          actions,
          metadata: {
            logId: logSession.getLogId(),
            toolCount: toolCalls.length,
          },
        });

        if (stored) {
          logger.info(`✅ Memory stored: ${memoryId}`);
        } else {
          logger.warn('⚠️  Failed to store memory');
        }
      }

      return {
        output: formattedOutput,
        rawOutput: output, // Keep raw output for debugging
        intermediateSteps: result.intermediateSteps,
        logId: logSession.getLogId(), // Return log ID for reference
      };
    } catch (executionError: any) {
      // Log execution failure
      await logSession.fail(executionError.message || 'Unknown error');
      throw executionError;
    }
  } catch (error) {
    logger.error('');
    logger.error('═══════════════════════════════════════════════════');
    logger.error('❌ COMMAND FAILED');
    logger.error('═══════════════════════════════════════════════════');
    logger.error('Error:', error);

    throw error;
  }
}
