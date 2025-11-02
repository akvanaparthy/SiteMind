/**
 * Google Gemini Client
 * Handles connection and LLM creation for Google Gemini
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { getConfig } from './config';

/**
 * Create a Gemini LLM instance with the given configuration
 * 
 * @param temperature - Temperature for generation (0-1, default from config)
 * @param maxTokens - Maximum output tokens (default from config)
 * @returns ChatGoogleGenerativeAI instance
 */
export function createGeminiLLM(
  temperature?: number,
  maxTokens?: number
): ChatGoogleGenerativeAI {
  const config = getConfig();
  
  if (!config.gemini.apiKey) {
    throw new Error('Google API Key is not configured. Set GOOGLE_API_KEY in .env');
  }

  console.log('[Gemini Client] Creating Gemini LLM instance:', {
    model: config.gemini.modelName,
    temperature: temperature ?? config.gemini.temperature,
    maxTokens: maxTokens || config.gemini.maxTokens,
    projectId: config.gemini.projectId || '(not set)',
  });

  const llm = new ChatGoogleGenerativeAI({
    apiKey: config.gemini.apiKey,
    modelName: config.gemini.modelName,
    maxOutputTokens: maxTokens || config.gemini.maxTokens,
    temperature: temperature ?? config.gemini.temperature,
    // Optional: Add project ID if needed for billing/quota
    ...(config.gemini.projectId && {
      projectId: config.gemini.projectId,
    }),
  });

  console.log('[Gemini Client] ✅ Gemini LLM instance created successfully');

  return llm;
}

/**
 * Test Gemini connection by making a simple query
 * 
 * @returns Promise that resolves to true if connection successful
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    console.log('[Gemini Client] Testing Gemini connection...');
    
    const llm = createGeminiLLM(0, 50);
    const response = await llm.invoke([
      { role: 'user', content: 'Respond with just the word "ok"' }
    ]);
    
    console.log('[Gemini Client] ✅ Connection test successful:', response.content);
    return true;
  } catch (error) {
    console.error('[Gemini Client] ❌ Connection test failed:', error);
    return false;
  }
}
