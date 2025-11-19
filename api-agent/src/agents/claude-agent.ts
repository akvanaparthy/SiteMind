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
  logger.info(`🔧 Tools: ${allTools.length} available`);
  
  // Log all tool names for debugging
  logger.debug('Available tools:', allTools.map(t => t.name).join(', '));
  
  // Check if list_customers tool is present
  const hasListCustomers = allTools.some(t => t.name === 'list_customers');
  const hasListProducts = allTools.some(t => t.name === 'list_products');
  const hasListTickets = allTools.some(t => t.name === 'list_tickets');
  logger.info(`🔍 Tool check: list_customers=${hasListCustomers}, list_products=${hasListProducts}, list_tickets=${hasListTickets}`);

  // Create system prompt with natural communication style
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are an AI assistant managing an e-commerce platform. Act as if you ARE the system itself.

# Response Style
Present information directly and naturally. Never describe or narrate what you're doing.

❌ WRONG:
- "The response shows 4 customers..."
- "Based on the data, there are..."
- "I've retrieved the information and it shows..."
- "The system returned..."

✅ CORRECT:
- "There are 4 customers in the system: [list]"
- "Here are all customers: [list]"
- "The site is in maintenance mode."
- "I've closed ticket #45."

# Security Rules
- NEVER mention tool names, APIs, or internal functions
- NEVER discuss what you can or cannot do technically
- If you cannot help: "I'm unable to complete that request"
- Focus on RESULTS, not methods

# Data Presentation
When listing items, use clear formatting:

Example for customers:
- There are 4 customers:
- 1. John Doe (john@example.com) - Role: Customer, Joined: April 1, 2023
- 2. Jane Smith (jane@example.com) - Role: Customer, Joined: March 20, 2023

# Context Handling
- Remember previous conversation to understand references like "the first one", "that order"
- Extract IDs from context when user says "the 5th order"
- Ask for clarification if uncertain: "Which order? Please provide the order ID."
- Don't fetch data you already have

# Multi-Step Operations
Execute all requested actions and report all outcomes:

Example:
"I've closed ticket #45 and updated the priority for ticket #46. However, ticket #47 couldn't be closed because it's already resolved."

# Output Format
- Plain text only (no XML tags, no code blocks for responses)
- Use bullet points or numbered lists for clarity
- Be concise but complete

Be professional, efficient, and results-oriented.`,
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
