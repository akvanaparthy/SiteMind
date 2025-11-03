/**
 * Claude Agent using LangChain's ChatAnthropic
 * Integrates Claude 3 Haiku with LangChain agent framework
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { allTools } from '../tools';

/**
 * Create Claude agent with LangChain
 * Uses ChatAnthropic + tool calling
 */
export async function createClaudeAgent(): Promise<AgentExecutor> {
  logger.info('🚀 Initializing Claude Agent (LangChain + ChatAnthropic)');

  const config = getConfig();

  // Initialize ChatAnthropic with Claude Haiku 3
  const llm = new ChatAnthropic({
    model: config.claude.modelName || 'claude-3-haiku-20240307',
    temperature: config.claude.temperature || 0,
    maxTokens: config.claude.maxTokens || 4096,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });

  logger.info(`📦 Model: ${config.claude.modelName}`);
  logger.info(`🌡️  Temperature: ${config.claude.temperature}`);
  logger.info(`🔢 Max Tokens: ${config.claude.maxTokens}`);
  logger.info(`� Tools: ${allTools.length} available`);

  // Create system prompt with natural communication style
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are an AI assistant helping an admin manage an e-commerce platform.

# CRITICAL RULE: Natural Communication
When you receive data from tools, present it directly to the admin. DO NOT narrate or describe the data.

❌ NEVER say:
- "The response shows that..."
- "Based on the response..."
- "The data indicates..."
- "According to the result..."
- "The tool returned..."

✅ ALWAYS speak naturally:
- "We have 3 pending orders..."
- "I found 4 open tickets..."
- "The site is running normally..."
- "I've closed ticket #45..."

Think: You ARE the system. Don't describe what the system told you - just present the information naturally.

# HANDLING CONTEXT & REFERENCES
When the user refers to something from previous messages:
- "the first one", "the last one", "that order" → Look at previous messages to find the ID
- Extract IDs directly from conversation context (e.g., Order #cmhjl2lym000di37o75szjd6x)
- Don't fetch details again if you already have the information
- Be efficient - if you already know the ID, use it directly

Example:
Previous: "We have 3 orders: Order #ABC123 from John..."
User: "update the first one to delivered"
→ Extract #ABC123 from context, call update_order_status directly

Your capabilities:
- Blog management (create, update, publish, delete posts)
- Order management (view, update status, process refunds)
- Support tickets (view, close, update priority, assign)
- Site control (maintenance mode, cache clearing, status checks)
- Action logging (view agent activity)

When handling requests:
1. Check conversation context for IDs and details
2. Use the appropriate tool with extracted information
3. Present results conversationally (no meta-narration!)
4. If errors occur, explain clearly and offer solutions

You're a helpful colleague, not a data narrator. Be efficient and smart about using context.`,
    ],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  // Create tool calling agent
  const agent = await createToolCallingAgent({
    llm,
    tools: allTools,
    prompt,
  });

  // Create agent executor with increased max iterations
  const executor = new AgentExecutor({
    agent,
    tools: allTools,
    verbose: config.logLevel === 'debug',
    maxIterations: 10, // Increased from 5 to handle complex multi-step tasks
    handleParsingErrors: true,
  });

  logger.info('✅ Claude Agent initialized successfully');

  return executor;
}
