/**
 * LMStudio Client Utility
 * Handles connection to LMStudio with health checks and auto-loading
 */

import { ChatOpenAI } from '@langchain/openai';
import { getConfig } from './config';
import { logger } from './logger';

export interface LMStudioStatus {
  connected: boolean;
  modelLoaded: boolean;
  modelName?: string;
  error?: string;
}

/**
 * Check if LMStudio is running and model is loaded
 */
export async function checkLMStudioHealth(): Promise<LMStudioStatus> {
  const config = getConfig();
  
  try {
    logger.debug('Checking LMStudio health', { url: config.llm.baseURL });

    // Try to make a simple request to LMStudio
    const response = await fetch(`${config.llm.baseURL}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        connected: false,
        modelLoaded: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json() as any;
    const models = data.data || [];

    if (models.length === 0) {
      return {
        connected: true,
        modelLoaded: false,
        error: 'No model loaded in LMStudio',
      };
    }

    logger.info('LMStudio connected', { 
      models: models.map((m: any) => m.id),
      activeModel: models[0]?.id 
    });

    return {
      connected: true,
      modelLoaded: true,
      modelName: models[0]?.id,
    };
  } catch (error) {
    logger.error('Failed to connect to LMStudio', error);
    return {
      connected: false,
      modelLoaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Attempt to load a model in LMStudio
 * Note: LMStudio doesn't have an API to load models programmatically
 * This function returns instructions for the user
 */
export async function requestModelLoad(): Promise<{ success: boolean; message: string }> {
  const config = getConfig();
  
  logger.warn('Model auto-loading not supported by LMStudio API');
  logger.info('Please load model manually in LMStudio', {
    recommendedModel: config.llm.modelName,
    steps: [
      '1. Open LMStudio',
      '2. Go to the Local Server tab',
      '3. Select your model from the dropdown',
      '4. Click "Start Server"',
    ],
  });

  return {
    success: false,
    message: `Please manually load model "${config.llm.modelName}" in LMStudio and start the server`,
  };
}

/**
 * Create LangChain ChatOpenAI instance for LMStudio
 */
export function createLLM(temperature?: number, maxTokens?: number): ChatOpenAI {
  const config = getConfig();

  logger.debug('Creating LLM instance', {
    baseURL: config.llm.baseURL,
    model: config.llm.modelName,
    temperature: temperature ?? config.llm.temperature,
    maxTokens: maxTokens ?? config.llm.maxTokens,
  });

  return new ChatOpenAI({
    modelName: config.llm.modelName,
    temperature: temperature ?? config.llm.temperature,
    maxTokens: maxTokens ?? config.llm.maxTokens,
    timeout: config.llm.timeout,
    configuration: {
      baseURL: config.llm.baseURL,
      apiKey: config.llm.apiKey,
    },
  });
}

/**
 * Test LLM with a simple prompt
 */
export async function testLLM(): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    logger.info('Testing LLM with simple prompt...');
    
    const llm = createLLM(0.1, 50);
    const response = await llm.invoke('Say "Hello, I am ready to assist!" and nothing else.');

    logger.info('LLM test successful', { response: response.content });

    return {
      success: true,
      response: response.content as string,
    };
  } catch (error) {
    logger.error('LLM test failed', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Initialize LMStudio connection with retries
 */
export async function initializeLMStudio(maxRetries: number = 3): Promise<LMStudioStatus> {
  let lastStatus: LMStudioStatus | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    logger.info(`Initializing LMStudio (attempt ${attempt}/${maxRetries})...`);

    const status = await checkLMStudioHealth();
    lastStatus = status;

    if (status.connected && status.modelLoaded) {
      logger.info('✅ LMStudio initialized successfully', {
        modelName: status.modelName,
      });

      // Test with a simple prompt
      const testResult = await testLLM();
      if (testResult.success) {
        logger.info('✅ LLM test passed');
        return status;
      } else {
        logger.warn('LLM test failed, but connection is established');
        return status;
      }
    }

    if (!status.connected) {
      logger.warn(`LMStudio not connected: ${status.error}`);
      
      if (attempt < maxRetries) {
        const delay = 2000 * attempt;
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } else if (!status.modelLoaded) {
      logger.warn('LMStudio connected but no model loaded');
      
      if (getConfig().llm.autoLoad) {
        await requestModelLoad();
      }
      
      return status; // Don't retry, user needs to load model manually
    }
  }

  logger.error('Failed to initialize LMStudio after retries', lastStatus);
  throw new Error(`LMStudio initialization failed: ${lastStatus?.error || 'Unknown error'}`);
}
