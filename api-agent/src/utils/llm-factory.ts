/**
 * LLM Factory
 * Provides unified interface for creating LLM instances from different providers
 */

import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { createLLM as createLMStudioLLM } from './lmstudio-client';
import { createGeminiLLM } from './gemini-client';
import { getConfig } from './config';
import { LLMProvider } from '../types/agent';

/**
 * Create an LLM instance based on the configured provider
 * 
 * @param temperature - Temperature for generation (0-1)
 * @param maxTokens - Maximum output tokens
 * @returns BaseChatModel instance (either ChatOpenAI for LMStudio or ChatGoogleGenerativeAI for Gemini)
 */
export function createLLM(
  temperature?: number,
  maxTokens?: number
): BaseChatModel {
  const config = getConfig();
  const provider = config.llmProvider;

  console.log(`[LLM Factory] Creating LLM with provider: ${provider}`);

  switch (provider) {
    case 'gemini':
      return createGeminiLLM(temperature, maxTokens);
    
    case 'lmstudio':
      return createLMStudioLLM(temperature, maxTokens);
    
    default:
      throw new Error(`Unknown LLM provider: ${provider}. Valid options: lmstudio, gemini`);
  }
}

/**
 * Get the current LLM provider from configuration
 * 
 * @returns Current LLM provider
 */
export function getCurrentProvider(): LLMProvider {
  const config = getConfig();
  return config.llmProvider;
}

/**
 * Check if a specific provider is currently active
 * 
 * @param provider - Provider to check
 * @returns True if the provider is active
 */
export function isProviderActive(provider: LLMProvider): boolean {
  return getCurrentProvider() === provider;
}

/**
 * Get information about the current LLM configuration
 * 
 * @returns Object with provider info
 */
export function getLLMInfo(): {
  provider: LLMProvider;
  modelName: string;
  temperature: number;
  maxTokens: number;
} {
  const config = getConfig();
  
  if (config.llmProvider === 'gemini') {
    return {
      provider: 'gemini',
      modelName: config.gemini.modelName,
      temperature: config.gemini.temperature,
      maxTokens: config.gemini.maxTokens,
    };
  } else {
    return {
      provider: 'lmstudio',
      modelName: config.llm.modelName,
      temperature: config.llm.temperature,
      maxTokens: config.llm.maxTokens,
    };
  }
}
