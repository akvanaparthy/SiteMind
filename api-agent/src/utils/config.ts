/**
 * Configuration loader for Agent Service
 * Loads configuration from environment variables
 */

import * as dotenv from 'dotenv';
import { AgentConfig } from '../types/agent';

// Load .env file
dotenv.config();

export type LLMProvider = 'claude';

/**
 * Load and validate agent configuration
 */
export function loadConfig(): AgentConfig {
  const config: AgentConfig = {
    port: parseInt(process.env.AGENT_PORT || '3002', 10),
    host: process.env.AGENT_HOST || 'localhost',
    
    llmProvider: 'claude',
    
    // Claude configuration (Anthropic)
    // LangChain uses ANTHROPIC_API_KEY by convention
    claude: {
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '',
      apiUrl: process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages',
      modelName: process.env.CLAUDE_MODEL_NAME || 'claude-3-haiku-20240307',
      temperature: parseFloat(process.env.CLAUDE_TEMPERATURE || '0.0'),
      maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '4096', 10),
    },
    
    nextjsApiUrl: process.env.NEXTJS_API_URL || 'http://localhost:3000/api',
    nextjsApiTimeout: parseInt(process.env.NEXTJS_API_TIMEOUT || '30000', 10),
    
    wsPath: process.env.WS_PATH || '/ws',
    wsCorsOrigin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
    
    logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
    maxLogsInMemory: parseInt(process.env.MAX_LOGS_IN_MEMORY || '1000', 10),
    approvalTimeout: parseInt(process.env.APPROVAL_TIMEOUT || '300000', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  };

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

  // Validate Claude configuration
  if (!config.claude?.apiKey) {
    errors.push('Claude API Key is required (ANTHROPIC_API_KEY or CLAUDE_API_KEY)');
  }
  if (!config.claude?.modelName) {
    errors.push('Claude model name is required (CLAUDE_MODEL_NAME)');
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
