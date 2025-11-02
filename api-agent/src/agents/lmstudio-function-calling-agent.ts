/**
 * LMStudio Function Calling Agent
 * 
 * Uses OpenAI SDK with LMStudio's local endpoint to enable function calling.
 * Compatible with Qwen 2.5 models and other LMStudio-supported models.
 */

import OpenAI from 'openai';
import { allTools } from '../tools';
import { allToolsToOpenAI, type OpenAIFunction } from '../utils/openai-converter';
import { logger } from '../utils/logger';

/**
 * LMStudio Function Calling Agent
 * Uses OpenAI-compatible API with local LMStudio server
 */
export async function createLMStudioFunctionCallingAgent() {
  logger.info('🚀 Initializing LMStudio Function Calling Agent...');

  // Initialize OpenAI client with LMStudio endpoint
  const openai = new OpenAI({
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'lm-studio', // LMStudio doesn't require real API key
  });

  // Convert all tools to OpenAI format
  const tools = allToolsToOpenAI(allTools);
  logger.info(`✅ Converted ${tools.length} tools to OpenAI format`);

  // Log tool names
  const toolNames = tools.map((t) => t.function.name);
  logger.info(`📋 Available tools: ${toolNames.join(', ')}`);

  /**
   * Execute a prompt with function calling support
   * IMPORTANT: Single-shot execution - user sends ONE command at a time
   */
  async function execute(prompt: string): Promise<{
    success: boolean;
    output: string;
    error?: string;
    toolCalls?: any[];
  }> {
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`📝 User Command: "${prompt}"`);
    logger.info(`${'='.repeat(60)}\n`);

    const startTime = Date.now();
    
    // System prompt - explains the agent's role and available actions
    const systemPrompt = `You are an AI agent for an e-commerce platform. You execute SINGLE commands from admins.

Your job: Analyze the user's command, call the RIGHT tool ONCE, and report the result.

CRITICAL RULES:
1. ALWAYS call a tool - never just respond with text
2. Call ONLY ONE tool per command
3. Use the EXACT tool name that matches the user's intent
4. Extract parameters from the user's command accurately
5. If unsure which tool, ask the user to clarify

Available actions (21 tools):
- Blog: create_blog_post, get_blog_post, update_blog_post, delete_blog_post, list_blog_posts
- Tickets: create_ticket, get_ticket, update_ticket, close_ticket, list_tickets
- Orders: create_order, get_order, update_order_status, process_refund, list_orders, get_pending_orders, send_order_notification
- Site: get_site_status, toggle_maintenance_mode, clear_cache, get_site_analytics, generate_approval_request, get_system_health
- Logs: log_agent_action, get_agent_logs, get_log_by_id

Example:
User: "Close ticket 45"
You: Call close_ticket with ticketId=45`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    const allToolCalls: any[] = [];
    let iteration = 0;
    const maxIterations = 2; // Reduced: 1 for tool call, 1 for response

    try {
      // Add timeout to prevent infinite loops
      const timeoutMs = 30000; // 30 seconds max
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Agent timeout - took longer than 30 seconds')), timeoutMs)
      );
      
      const executionPromise = (async () => {
        while (iteration < maxIterations) {
          iteration++;
          logger.info(`\n🔄 Step ${iteration}/${maxIterations}`);

          // Call LMStudio with tools (force tool use on first iteration)
          const response = await openai.chat.completions.create({
            model: 'local-model', // LMStudio uses whatever model is loaded
            messages,
            tools,
            tool_choice: iteration === 1 ? 'required' : 'auto', // Force tool call on first step
            temperature: 0.0, // Deterministic
            parallel_tool_calls: false, // Disable parallel tool calls - only one at a time
            max_tokens: 500, // Limit response length to prevent multiple tool generations
          });

        const message = response.choices[0].message;
        const finishReason = response.choices[0].finish_reason;

        logger.info(`📤 Finish Reason: ${finishReason}`);

        // Check if model wants to use tools
        if (finishReason === 'tool_calls' && message.tool_calls) {
          logger.info(`🔧 Model requested ${message.tool_calls.length} tool call(s)`);
          
          // SINGLE-SHOT MODE: Only execute the FIRST tool call
          if (message.tool_calls.length > 1) {
            logger.warn(`⚠️  Model requested ${message.tool_calls.length} tools, but we only execute the FIRST one (single-shot mode)`);
          }

          // Add assistant's message with tool calls to history
          messages.push(message);

          // Execute ONLY THE FIRST tool call (single-shot behavior)
          const toolCallsToExecute = [message.tool_calls[0]];
          
          for (const toolCall of toolCallsToExecute) {
            // Handle both function and custom tool call types
            const toolName = (toolCall as any).function?.name;
            const toolArgsString = (toolCall as any).function?.arguments;

            if (!toolName || !toolArgsString) {
              logger.warn(`⚠️  Skipping invalid tool call:`, toolCall);
              continue;
            }

            const toolArgs = JSON.parse(toolArgsString);

            logger.info(`\n🛠️  Executing Tool: ${toolName}`);
            logger.info(`📥 Arguments:`, toolArgs);

            // Find the actual tool
            const tool = allTools.find((t) => t.name === toolName);

            if (!tool) {
              logger.error(`❌ Tool not found: ${toolName}`);
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  error: `Tool '${toolName}' not found`,
                }),
              });
              continue;
            }

            try {
              // Execute the tool using parseToolInput + func
              const parsedInput = tool.schema.parse(toolArgs);
              const result = await (tool as any).func(parsedInput);

              logger.info(`✅ Tool Result:`, result);

              allToolCalls.push({
                tool: toolName,
                args: toolArgs,
                result,
                timestamp: new Date().toISOString(),
              });

              // Add tool result to messages
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: typeof result === 'string' ? result : JSON.stringify(result),
              });
              
              // SINGLE-SHOT MODE: Return immediately after first successful tool execution
              const duration = Date.now() - startTime;
              logger.info(`\n✅ Tool executed successfully in ${duration}ms`);
              logger.info(`🛑 Returning result (single-shot mode - no further iterations)`);
              
              return {
                success: true,
                output: typeof result === 'string' ? result : JSON.stringify(result),
                toolCalls: allToolCalls,
              };
              
            } catch (error: any) {
              logger.error(`❌ Tool Execution Error:`, error.message);

              allToolCalls.push({
                tool: toolName,
                args: toolArgs,
                error: error.message,
                timestamp: new Date().toISOString(),
              });

              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  error: error.message,
                }),
              });
            }
          }

          // Continue loop to get final response
          continue;
        }

        // Model provided final response (no more tool calls)
        if (message.content) {
          const duration = Date.now() - startTime;
          logger.info(`\n✅ Agent completed in ${duration}ms (${iteration} iterations)`);
          logger.info(`📝 Final Response: ${message.content}`);

          return {
            success: true,
            output: message.content,
            toolCalls: allToolCalls.length > 0 ? allToolCalls : undefined,
          };
        }

        // Unexpected finish reason
        logger.warn(`⚠️  Unexpected finish reason: ${finishReason}`);
        break;
      }

      // Max iterations reached - return what we have
      const duration = Date.now() - startTime;
      logger.warn(`\n⚠️  Reached max steps (${maxIterations}) - returning tool results`);
      
      if (allToolCalls.length > 0) {
        const lastToolCall = allToolCalls[allToolCalls.length - 1];
        return {
          success: true,
          output: typeof lastToolCall.result === 'string' 
            ? lastToolCall.result 
            : JSON.stringify(lastToolCall.result, null, 2),
          toolCalls: allToolCalls,
        };
      }
      
      throw new Error(`No tool called - agent failed to understand command`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`\n❌ Agent failed after ${duration}ms:`, error.message);

      return {
        success: false,
        output: '',
        error: error.message,
        toolCalls: allToolCalls.length > 0 ? allToolCalls : undefined,
      };
    }
  }

  /**
   * Compatibility wrapper for AgentExecutor interface
   */
  async function invoke({ input }: { input: string }) {
    return await execute(input);
  }

  return {
    execute,
    invoke,
    tools,
    provider: 'lmstudio-function-calling',
  };
}
