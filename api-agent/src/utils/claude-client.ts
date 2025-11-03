import Anthropic from '@anthropic-ai/sdk';
import { getConfig } from './config';
import { logger } from './logger';

/**
 * Claude Client using official Anthropic SDK
 * Uses the Messages API for Claude 3 models (including Haiku)
 */

export interface ClaudeMessageOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

/**
 * Send a message to Claude using the Messages API
 * @param userMessage - The user's message content
 * @param opts - Optional configuration overrides
 * @returns The assistant's response text
 */
export async function claudeMessage(
  userMessage: string,
  opts: ClaudeMessageOptions = {}
): Promise<string> {
  const config = getConfig();
  const claude = config.claude;
  
  if (!claude || !claude.apiKey) {
    throw new Error('Claude API key not configured (CLAUDE_API_KEY)');
  }

  const model = opts.model || claude.modelName || 'claude-3-haiku-20240307';
  const maxTokens = opts.maxTokens ?? claude.maxTokens ?? 4096;
  const temperature = opts.temperature ?? claude.temperature ?? 0.0;

  logger.debug('[Claude] Sending message', { model, maxTokens, temperature });

  const anthropic = new Anthropic({
    apiKey: claude.apiKey,
  });

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: opts.system,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract text from response
    const textContent = message.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    logger.debug('[Claude] Response received', { 
      length: textContent.length,
      stopReason: message.stop_reason 
    });

    return textContent;
  } catch (error: any) {
    logger.error('[Claude] API Error', { 
      message: error.message,
      status: error.status 
    });
    throw new Error(`Claude API error: ${error.message}`);
  }
}

/**
 * Send a message to Claude with tool use capability
 * @param userMessage - The user's message
 * @param tools - Array of tool definitions
 * @param opts - Optional configuration
 * @returns The complete message response (may include tool use)
 */
export async function claudeMessageWithTools(
  userMessage: string,
  tools: any[],
  opts: ClaudeMessageOptions = {}
): Promise<Anthropic.Message> {
  const config = getConfig();
  const claude = config.claude;
  
  if (!claude || !claude.apiKey) {
    throw new Error('Claude API key not configured (CLAUDE_API_KEY)');
  }

  const model = opts.model || claude.modelName || 'claude-3-haiku-20240307';
  const maxTokens = opts.maxTokens ?? claude.maxTokens ?? 4096;
  const temperature = opts.temperature ?? claude.temperature ?? 0.0;

  logger.debug('[Claude] Sending message with tools', { 
    model, 
    maxTokens, 
    temperature,
    toolCount: tools.length 
  });

  const anthropic = new Anthropic({
    apiKey: claude.apiKey,
  });

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: opts.system,
      tools,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    logger.debug('[Claude] Response received', { 
      stopReason: message.stop_reason,
      contentBlocks: message.content.length
    });

    return message;
  } catch (error: any) {
    logger.error('[Claude] API Error', { 
      message: error.message,
      status: error.status 
    });
    throw new Error(`Claude API error: ${error.message}`);
  }
}
