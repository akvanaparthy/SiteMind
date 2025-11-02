/**
 * Configuration loader for Agent Service
 * Loads configuration from environment variables
 */

import * as dotenv from 'dotenv';
import { AgentConfig } from '../types/agent';

// Load .env file
dotenv.config();

export type LLMProvider = 'lmstudio' | 'lmstudio-fc' | 'gemini';

/**
 * Load and validate agent configuration
 */
export function loadConfig(): AgentConfig {
  const provider = (process.env.LLM_PROVIDER || 'lmstudio') as LLMProvider;
  
  const config: AgentConfig = {
    port: parseInt(process.env.AGENT_PORT || '3002', 10),
    host: process.env.AGENT_HOST || 'localhost',
    
    llmProvider: provider,
    
    llm: {
      baseURL: process.env.OPENAI_API_BASE || 'http://localhost:1234/v1',
      apiKey: process.env.OPENAI_API_KEY || 'lm-studio',
      modelName: process.env.LMSTUDIO_MODEL_NAME || process.env.LLM_MODEL_NAME || 'qwen/qwen2.5-coder-32b',
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.1'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '10000', 10),
      timeout: parseInt(process.env.LLM_TIMEOUT || '30000', 10),
      autoLoad: process.env.LLM_AUTO_LOAD === 'true',
    },
    
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY || '',
      modelName: process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash-exp',
      projectId: process.env.GOOGLE_PROJECT_ID || '',
      projectNumber: process.env.GOOGLE_PROJECT_NUMBER || '',
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.1'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '10000', 10),
    },
    
    nextjsApiUrl: process.env.NEXTJS_API_URL || 'http://localhost:3000/api',
    nextjsApiTimeout: parseInt(process.env.NEXTJS_API_TIMEOUT || '10000', 10),
    
    wsPath: process.env.WS_PATH || '/ws',
    wsCorsOrigin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
    
    logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
    maxLogsInMemory: parseInt(process.env.MAX_LOGS_IN_MEMORY || '1000', 10),
    approvalTimeout: parseInt(process.env.APPROVAL_TIMEOUT || '300000', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  };

  // Optional Pinecone configuration
  if (process.env.PINECONE_API_KEY) {
    config.pinecone = {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT || '',
      indexName: process.env.PINECONE_INDEX_NAME || 'sitemind-agent-memory',
      namespace: process.env.PINECONE_NAMESPACE || 'agent-memory',
      dimensions: parseInt(process.env.PINECONE_DIMENSIONS || '1536', 10),
    };
  }

  return config;
}

/**
 * Get configuration singleton
 */
let configInstance: AgentConfig | null = null;

export function getConfig(): AgentConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Reload configuration (useful for testing)
 */
export function reloadConfig(): AgentConfig {
  configInstance = loadConfig();
  return configInstance;
}

/**
 * Validate required environment variables
 */
export function validateConfig(config: AgentConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate based on provider
  if (config.llmProvider === 'lmstudio' || config.llmProvider === 'lmstudio-fc') {
    if (!config.llm.baseURL) {
      errors.push('LLM base URL is required for LMStudio (OPENAI_API_BASE)');
    }
  } else if (config.llmProvider === 'gemini') {
    if (!config.gemini?.apiKey) {
      errors.push('Google API Key is required for Gemini (GOOGLE_API_KEY)');
    }
    if (!config.gemini?.modelName) {
      errors.push('Gemini model name is required (GEMINI_MODEL_NAME)');
    }
  }

  if (!config.nextjsApiUrl) {
    errors.push('Next.js API URL is required (NEXTJS_API_URL)');
  }

  if (config.port < 1024 || config.port > 65535) {
    errors.push('Port must be between 1024 and 65535');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
