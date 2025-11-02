/**
 * Gemini Native Agent (Option 3: Hybrid Approach)
 * 
 * Uses official @google/genai SDK for Gemini function calling
 * Reuses existing LangChain tool implementations for maximum compatibility
 * 
 * Expected performance: 90-100% tool success rate (vs 75% with LMStudio/ReAct)
 */

import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import { allTools } from '../tools';
import { allToolsToGemini } from '../utils/zod-converter';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';

// Type for agent execution result
export interface GeminiAgentResult {
  success: boolean;
  output: string;
  error?: string;
  toolCalls?: Array<{
    name: string;
    args: any;
    result: any;
  }>;
}

/**
 * Create Gemini Native Agent with official SDK
 * 
 * @returns Agent executor with invoke() method
 */
export async function createGeminiNativeAgent() {
  const config = getConfig();
  
  logger.info('🤖 Creating Gemini Native Agent (Option 3)...');
  logger.info(`📝 Provider: Google Gemini`);
  logger.info(`🔧 Model: ${config.gemini.modelName}`);
  logger.info(`🛠️  Tools: ${allTools.length} available`);

  // Validate Gemini configuration
  if (!config.gemini.apiKey) {
    throw new Error('GOOGLE_API_KEY is required for Gemini agent');
  }

  // Initialize Google GenAI client
  const client = new GoogleGenAI({
    apiKey: config.gemini.apiKey,
  });

  // Convert all LangChain tools to Gemini format
  let geminiTools: FunctionDeclaration[];
  try {
    geminiTools = allToolsToGemini(allTools as any);
    logger.info(`✅ Converted ${geminiTools.length} tools to Gemini format`);
  } catch (error) {
    logger.error('❌ Failed to convert tools:', error);
    throw error;
  }

  /**
   * Execute a command with the Gemini agent
   * Uses automatic function calling with iterative loop
   * 
   * @param prompt - User command/question
   * @returns Execution result
   */
  async function execute(prompt: string): Promise<GeminiAgentResult> {
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`📥 Executing command: "${prompt}"`);
    logger.info(`${'='.repeat(60)}\n`);

    const toolCalls: Array<{ name: string; args: any; result: any }> = [];
    let messages: any[] = [{ role: 'user', parts: [{ text: prompt }] }];
    let iterations = 0;
    const maxIterations = 10;

    try {
      while (iterations++ < maxIterations) {
        logger.info(`🔄 Iteration ${iterations}/${maxIterations}`);

        // Generate content with function calling
        const response = await client.models.generateContent({
          model: config.gemini.modelName,
          contents: messages,
          config: {
            tools: [{ functionDeclarations: geminiTools }],
            toolConfig: {
              functionCallingConfig: {
                mode: FunctionCallingConfigMode.AUTO,
              },
            },
          },
        });

        // Check if response has function calls
        const functionCalls = response.functionCalls;
        
        if (!functionCalls || functionCalls.length === 0) {
          // No more function calls - return final text response
          const finalText = response.text || 'Task completed successfully';
          logger.info(`✅ Final response: ${finalText}`);
          
          return {
            success: true,
            output: finalText,
            toolCalls,
          };
        }

        logger.info(`🔧 Function calls requested: ${functionCalls.length}`);

        // Execute each function call
        for (const call of functionCalls) {
          const callName = call.name || 'unknown';
          const callArgs = call.args || {};
          
          logger.info(`\n  📞 Calling: ${callName}`);
          logger.info(`  📋 Args: ${JSON.stringify(callArgs)}`);

          // Find the matching LangChain tool
          const tool = allTools.find(t => t.name === callName);
          
          if (!tool) {
            const error = `Tool "${callName}" not found`;
            logger.error(`  ❌ ${error}`);
            
            // Add function response with error
            messages.push({
              role: 'model',
              parts: [{ functionCall: call }],
            });
            messages.push({
              role: 'user',
              parts: [{
                functionResponse: {
                  name: callName,
                  response: { error },
                },
              }],
            });
            
            continue;
          }

          try {
            // Execute tool (uses parseToolInput internally to handle object args)
            const result = await tool.func(callArgs as any);
            logger.info(`  ✅ Result: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);

            // Track tool call
            toolCalls.push({
              name: callName,
              args: callArgs,
              result: JSON.parse(result),
            });

            // Add function call to conversation
            messages.push({
              role: 'model',
              parts: [{ functionCall: call }],
            });

            // Add function response to conversation
            messages.push({
              role: 'user',
              parts: [{
                functionResponse: {
                  name: callName,
                  response: JSON.parse(result),
                },
              }],
            });
          } catch (error: any) {
            const errorMsg = error.message || String(error);
            logger.error(`  ❌ Error: ${errorMsg}`);

            // Add function call to conversation
            messages.push({
              role: 'model',
              parts: [{ functionCall: call }],
            });

            // Add error response to conversation
            messages.push({
              role: 'user',
              parts: [{
                functionResponse: {
                  name: callName,
                  response: { error: errorMsg },
                },
              }],
            });
          }
        }

        logger.info(''); // Empty line for readability
      }

      // Max iterations reached
      logger.warn(`⚠️  Max iterations (${maxIterations}) reached`);
      return {
        success: false,
        output: 'Max iterations reached without completion',
        error: 'MAX_ITERATIONS',
        toolCalls,
      };

    } catch (error: any) {
      logger.error('❌ Agent execution error:', error);
      return {
        success: false,
        output: '',
        error: error.message || String(error),
        toolCalls,
      };
    }
  }

  // Return agent executor compatible with existing interface
  return {
    async invoke(input: { input: string }): Promise<{ output: string }> {
      const result = await execute(input.input);
      return { output: result.output };
    },
    
    // Additional method for detailed results
    async execute(prompt: string): Promise<GeminiAgentResult> {
      return execute(prompt);
    },
  };
}
