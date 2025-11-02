/**
 * Universal Agent Factory
 * Routes to the appropriate agent implementation based on LLM provider
 * 
 * - LMStudio/Qwen → ReAct Agent (text-based reasoning) OR Function Calling
 * - Google Gemini → Native Function Calling Agent
 */

import { AgentExecutor } from 'langchain/agents';
import { getConfig, LLMProvider } from '../utils/config';
import { logger } from '../utils/logger';
import { createReactAgent } from './react-agent';
import { createGeminiNativeAgent } from './gemini-native-agent';
import { createLMStudioFunctionCallingAgent } from './lmstudio-function-calling-agent';

/**
 * Create an agent appropriate for the configured LLM provider
 * 
 * Provider routing:
 * - lmstudio: Uses ReAct agent format (Thought/Action/Observation loop)
 * - lmstudio-fc: Uses OpenAI-compatible function calling
 * - gemini: Uses native function calling with official @google/genai SDK (Option 3)
 * 
 * @returns Agent executor configured for the active provider
 */
export async function createAgent(): Promise<any> {
  const config = getConfig();
  const provider = config.llmProvider;

  logger.info('═══════════════════════════════════════════════════');
  logger.info('🚀 INITIALIZING AI AGENT');
  logger.info('═══════════════════════════════════════════════════');
  logger.info(`📡 Provider: ${provider.toUpperCase()}`);

  switch (provider) {
    case 'lmstudio':
      logger.info('🔧 Mode: ReAct Agent (Text-based reasoning)');
      logger.info('📋 Format: Thought → Action → Observation loop');
      return await createReactAgent();

    case 'lmstudio-fc':
      logger.info('🔧 Mode: LMStudio Function Calling (OpenAI-compatible API)');
      logger.info('📋 Format: Direct tool invocation via OpenAI SDK');
      return await createLMStudioFunctionCallingAgent();

    case 'gemini':
      logger.info('🔧 Mode: Native Function Calling (Official Google SDK - Option 3)');
      logger.info('📋 Format: Direct tool invocation via @google/genai');
      return await createGeminiNativeAgent();

    default:
      throw new Error(
        `Unknown LLM provider: ${provider}. ` +
        `Valid options: lmstudio, lmstudio-fc, gemini. ` +
        `Set LLM_PROVIDER in .env file.`
      );
  }
}

/**
 * Get the current agent mode description
 */
export function getAgentMode(): {
  provider: LLMProvider;
  mode: string;
  description: string;
} {
  const config = getConfig();
  const provider = config.llmProvider;

  if (provider === 'lmstudio') {
    return {
      provider: 'lmstudio',
      mode: 'ReAct',
      description: 'Text-based reasoning with Thought/Action/Observation loop',
    };
  } else if (provider === 'lmstudio-fc') {
    return {
      provider: 'lmstudio-fc',
      mode: 'Function Calling',
      description: 'OpenAI-compatible function calling with direct tool invocation',
    };
  } else if (provider === 'gemini') {
    return {
      provider: 'gemini',
      mode: 'Function Calling',
      description: 'Native tool orchestration with direct invocation',
    };
  } else {
    return {
      provider: provider as LLMProvider,
      mode: 'Unknown',
      description: 'Unknown agent mode',
    };
  }
}

/**
 * Execute a command with the appropriate agent
 * Automatically creates and uses the correct agent type
 * 
 * @param prompt - User command or question
 * @returns Agent response with output and optional intermediate steps
 */
export async function executeCommand(
  prompt: string
): Promise<{ output: string; intermediateSteps?: any[] }> {
  logger.info('═══════════════════════════════════════════════════');
  logger.info('📨 NEW COMMAND');
  logger.info('═══════════════════════════════════════════════════');
  logger.info(`💬 Prompt: "${prompt}"`);
  logger.info('');

  const agent = await createAgent();

  logger.info('');
  logger.info('⚙️  EXECUTING COMMAND...');
  logger.info('');

  try {
    const result = await agent.invoke({ input: prompt });

    logger.info('');
    logger.info('═══════════════════════════════════════════════════');
    logger.info('✅ COMMAND COMPLETED SUCCESSFULLY');
    logger.info('═══════════════════════════════════════════════════');

    return {
      output: result.output,
      intermediateSteps: result.intermediateSteps,
    };
  } catch (error) {
    logger.error('');
    logger.error('═══════════════════════════════════════════════════');
    logger.error('❌ COMMAND FAILED');
    logger.error('═══════════════════════════════════════════════════');
    logger.error('Error:', error);

    throw error;
  }
}
