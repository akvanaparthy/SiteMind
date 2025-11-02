/**
 * Gemini Agent with Native Function Calling
 * Uses Google's native function calling instead of ReAct format
 * This avoids the hallucination issue where Gemini generates full conversations
 */

import { createToolCallingAgent } from 'langchain/agents';
import { AgentExecutor } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { allTools } from '../tools';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { createGeminiLLM } from '../utils/gemini-client';

/**
 * System prompt for Gemini function calling mode
 * Simpler than ReAct since Gemini handles tool orchestration natively
 */
const GEMINI_SYSTEM_PROMPT = `You are an AI Web Operations Agent for the SiteMind e-commerce platform.

Your role is to help manage the website by executing operations using the available tools.

**Key Guidelines:**
1. When a user asks you to perform an action, use the appropriate tool
2. If you need information before acting, use a getter tool first (get_order, get_ticket, etc.)
3. Two actions require approval: process_refund and toggle_maintenance_mode
4. Be conversational and helpful in your responses
5. After using a tool, explain what you did in a friendly way

**Available Operations:**
- Blog management (create, update, publish, trash posts)
- Support ticket handling (view, close, assign, update priority)
- Order processing (view, update status, process refunds, notify customers)
- Site control (maintenance mode, cache clearing, analytics)
- Agent logs (view execution history)

Always use tools to get current information rather than making assumptions.`;

/**
 * Create a Gemini Agent with native function calling
 * Uses LangChain's createToolCallingAgent for structured tool invocation
 */
export async function createGeminiAgent(): Promise<AgentExecutor> {
  logger.info('🤖 Creating Gemini Agent (Function Calling Mode)...');

  const config = getConfig();

  if (!config.gemini.apiKey) {
    throw new Error('Google API Key is required for Gemini agent. Set GOOGLE_API_KEY in .env');
  }

  logger.info(`🔧 Model: ${config.gemini.modelName}`);
  logger.info(`🌡️ Temperature: ${config.gemini.temperature}`);
  logger.info(`📊 Max Tokens: ${config.gemini.maxTokens}`);
  logger.info(`🛠️ Tools available: ${allTools.length}`);

  // Create Gemini LLM
  const llm = createGeminiLLM(config.gemini.temperature, config.gemini.maxTokens);

  // Bind tools to the LLM first (important for Gemini)
  const llmWithTools = llm.bindTools(allTools);
  logger.info('✅ Tools bound to Gemini LLM');

  // Create prompt template for tool calling
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', GEMINI_SYSTEM_PROMPT],
    ['placeholder', '{chat_history}'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  logger.info('✅ Gemini agent configured with native function calling');

  // Create tool-calling agent (uses model's native function calling)
  const agent = await createToolCallingAgent({
    llm: llmWithTools,
    tools: allTools,
    prompt,
  });

  // Create agent executor
  const executor = new AgentExecutor({
    agent,
    tools: allTools,
    verbose: true,
    maxIterations: 10,
    returnIntermediateSteps: true,
  });

  logger.info('✅ Gemini Agent created successfully');

  return executor;
}
