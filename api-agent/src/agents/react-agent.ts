/**
 * Main LangChain Agent (ReAct Version)
 * Uses ReAct agent pattern which works better with local LLMs
 * and has less context overhead than OpenAI Functions agent
 */

import { AgentExecutor, createReactAgent as langchainCreateReactAgent } from 'langchain/agents';
import { PromptTemplate } from '@langchain/core/prompts';
import { allTools } from '../tools';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { checkLMStudioHealth, requestModelLoad } from '../utils/lmstudio-client';
import { createLLM, getCurrentProvider, getLLMInfo } from '../utils/llm-factory';

/**
 * System prompt for the ReAct agent
 * Shorter and more focused for local LLMs
 */
const REACT_PROMPT_TEMPLATE = `You are an AI Web Operations Agent for the SiteMind e-commerce platform.

You help manage the website by executing operations. You have access to these tools:

{tools}

Use this EXACT format - DO NOT deviate:

Question: the input question you must answer
Thought: think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action (must be valid JSON)
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

CRITICAL FORMAT RULES - MUST FOLLOW EXACTLY:
1. ALWAYS write "Thought:" before thinking
2. ALWAYS write "Action:" before the tool name
3. ALWAYS write "Action Input:" before the JSON parameters
4. Action names use snake_case (e.g., process_refund NOT processRefund)
5. Action Input must be SINGLE-LINE compact JSON - NO newlines, NO formatting, NO extra spaces
6. Action Input example: {{"orderId": "123", "reason": "defect"}}
7. If a tool needs NO parameters, use empty object: {{}}
8. NEVER write prose or explanations after "Action Input:" - ONLY JSON
9. NEVER skip directly to "Final Answer:" without calling a tool first
10. Always close all JSON braces and quotes on the SAME line
11. Two actions require approval: process_refund and toggle_maintenance_mode
12. ONLY use "Final Answer:" after you have an Observation from a tool
13. Be conversational in your Final Answer

WRONG FORMAT EXAMPLES (DO NOT DO THIS):
❌ Action Input: Let me retrieve the logs...
❌ Action Input: {{"id": "1"
}}
❌ Final Answer: Here are the logs... (without calling tool first)

CORRECT FORMAT EXAMPLES:
✅ Action: get_order
✅ Action Input: {{"orderId": "abc123"}}
✅ Action: get_open_tickets  
✅ Action Input: {{}}

Begin!

Question: {input}
Thought: {agent_scratchpad}`;

/**
 * Create a ReAct Agent
 * Better for local LLMs, uses less context
 */
export async function createReactAgent() {
  const config = getConfig();
  const provider = getCurrentProvider();
  const llmInfo = getLLMInfo();
  
  logger.info('Creating ReAct Agent...');
  logger.info(`Tools available: ${allTools.length}`);
  logger.info(`LLM Provider: ${provider}`);
  logger.info(`Model: ${llmInfo.modelName}`);
  logger.info(`Temperature: ${llmInfo.temperature}, Max Tokens: ${llmInfo.maxTokens}`);

  // Check LMStudio health only if using LMStudio
  if (provider === 'lmstudio') {
    // Check if LMStudio has a model loaded
    const status = await checkLMStudioHealth();
  
    if (!status.connected) {
      logger.error('❌ LMStudio is not running or not accessible');
      logger.info('💡 Please ensure LMStudio is running and the server is started');
      logger.info(`   Expected at: ${config.llm.baseURL}`);
      throw new Error('LMStudio not accessible. Please start LMStudio and the local server.');
    }

    if (!status.modelLoaded) {
      logger.error('❌ No model loaded in LMStudio');
      logger.info('💡 Please load a model in LMStudio:');
      logger.info('   1. Open LMStudio application');
      logger.info('   2. Go to "Local Server" tab');
      logger.info('   3. Select a model from the dropdown (e.g., qwen2.5-coder-32b)');
      logger.info('   4. Click "Start Server" button');
      logger.info('   5. Wait for the model to load (may take 1-2 minutes)');
      logger.info('   6. Re-run your command');
      
      if (config.llm.autoLoad) {
        await requestModelLoad();
      }
      
      throw new Error('No model loaded in LMStudio. Please load a model manually.');
    }

    logger.info(`✅ Model loaded: ${status.modelName}`);
  } else if (provider === 'gemini') {
    logger.info('✅ Using Google Gemini - no health check needed');
  }

  // Create LLM using factory (supports both LMStudio and Gemini)
  logger.info('🔧 Creating LLM instance...');
  const llm = createLLM(config.llm.temperature, config.llm.maxTokens);

  // Create prompt template
  const prompt = PromptTemplate.fromTemplate(REACT_PROMPT_TEMPLATE);

  // Create ReAct agent
  const agent = await langchainCreateReactAgent({
    llm,
    tools: allTools,
    prompt,
  });

  // Create agent executor
  const executor = new AgentExecutor({
    agent,
    tools: allTools,
    verbose: true,
    maxIterations: 15, // Increased to allow retries
    // Let LangChain handle parsing errors automatically
    returnIntermediateSteps: true,
  });

  logger.info('✅ ReAct Agent created successfully');

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
export async function runReactAgent(prompt: string): Promise<string> {
  const executor = await createReactAgent();
  return executeAgentPrompt(executor, prompt);
}
