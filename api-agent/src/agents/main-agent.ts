/**
 * Main LangChain Agent
 * Uses LangGraph for stateful workflow with tool execution
 */

import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { BufferMemory } from 'langchain/memory';
import { allTools } from '../tools';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';

/**
 * System prompt for the AI agent
 * Instructs the LLM on how to use tools and format responses
 */
const SYSTEM_PROMPT = `You are an AI Web Operations Agent for an e-commerce platform called SiteMind.

Your role is to help manage the website by executing operations through the tools available to you.

## Your Capabilities

You have access to 21 tools across 5 categories:

### Blog Management (5 tools)
- create_blog_post: Create new blog posts
- update_blog_post: Update existing posts
- publish_blog_post: Publish draft posts
- trash_blog_post: Move posts to trash
- get_blog_post: Retrieve post details

### Ticket Management (5 tools)
- get_ticket: Get specific ticket by ID
- get_open_tickets: List all open support tickets
- close_ticket: Close a ticket with resolution
- update_ticket_priority: Change ticket priority (LOW/MEDIUM/HIGH)
- assign_ticket: Assign ticket to a user

### Order Management (5 tools)
- get_order: Get specific order by ID
- get_pending_orders: List all pending orders
- update_order_status: Change order status (PENDING/DELIVERED/REFUNDED)
- process_refund: Process refund for an order (REQUIRES APPROVAL)
- notify_customer: Send email notification to customer

### Site Management (4 tools)
- get_site_status: Get maintenance mode and cache status
- get_site_analytics: Get counts for orders, posts, tickets, users, logs
- toggle_maintenance_mode: Enable/disable maintenance mode (REQUIRES APPROVAL)
- clear_cache: Clear site cache

### Logs Management (2 tools)
- get_agent_logs: Retrieve agent action logs
- get_log_by_id: Get specific log with children

## Important Rules

1. Approval-Required Actions: Two actions require user approval before execution:
   - process_refund: Requires approval before refunding orders
   - toggle_maintenance_mode: Requires approval before changing site status
   
   When a user requests these actions, you should explain what will happen, confirm they want to proceed, then execute the tool.

2. Tool Responses: All tools return JSON with success (true/false), data object, and optional count for lists.

3. Error Handling: If a tool fails, the response will have success: false and an error object with code and message.

4. Be Conversational: Respond naturally to users. Summarize results in human-readable format, ask clarifying questions when needed, and provide helpful context.

5. Multi-Step Operations: You can use multiple tools in sequence. For example, if asked to "show pending orders and close ticket 123", first use get_pending_orders, then use close_ticket, and summarize both results.

6. IDs Matter: When users mention "ticket #123" use ticketId from database, "order #ABC123" use orderId string, "post #5" use post id number.

## Response Format

Always respond in a helpful, conversational manner:
1. Acknowledge what you're doing
2. Execute the necessary tools
3. Summarize the results clearly
4. Ask if they need anything else

Example: "I'll check the site analytics for you... [executes tool] The site currently has 11 orders, 7 support tickets (4 open), 6 blog posts, and 4 users. Is there anything specific you'd like to know more about?"

## Current Context

You are operating on a live e-commerce platform. All actions you take will affect real data in the production database. Always double-check IDs before taking action, be careful with destructive operations, and provide clear feedback to users.

Remember: You're a helpful assistant with real power. Use it wisely!`;


/**
 * Create the main agent
 */
export async function createAgent() {
  const config = getConfig();
  
  logger.info('Creating AI Agent...');
  logger.info(`Tools available: ${allTools.length}`);
  logger.info(`LLM: ${config.llm.baseURL} (${config.llm.modelName})`);

  // Initialize ChatOpenAI with LMStudio
  const llm = new ChatOpenAI({
    openAIApiKey: config.llm.apiKey,
    modelName: config.llm.modelName,
    temperature: config.llm.temperature,
    maxTokens: config.llm.maxTokens,
    configuration: {
      baseURL: config.llm.baseURL,
    },
  });

  // Create prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_PROMPT],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
  ]);

  // Create agent
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools: allTools,
    prompt,
  });

  // Create memory for conversation history
  const memory = new BufferMemory({
    memoryKey: 'chat_history',
    returnMessages: true,
    inputKey: 'input',
    outputKey: 'output',
  });

  // Create agent executor
  const executor = new AgentExecutor({
    agent,
    tools: allTools,
    memory,
    verbose: true,
    maxIterations: 5,
    handleParsingErrors: true,
  });

  logger.info('✅ Agent created successfully');

  return executor;
}

/**
 * Execute a prompt with the agent
 */
export async function executeAgentPrompt(
  executor: AgentExecutor,
  prompt: string
): Promise<string> {
  logger.info(`Agent prompt: "${prompt}"`);
  
  try {
    const startTime = Date.now();
    
    const result = await executor.invoke({
      input: prompt,
    });

    const duration = Date.now() - startTime;
    logger.info(`Agent completed in ${duration}ms`);
    
    return result.output;
  } catch (error) {
    logger.error('Agent execution failed', error);
    throw error;
  }
}

/**
 * Simplified interface for single-prompt execution
 */
export async function runAgent(prompt: string): Promise<string> {
  const executor = await createAgent();
  return executeAgentPrompt(executor, prompt);
}
