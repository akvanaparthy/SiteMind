/**
 * Agent Logger Client
 * Logs agent actions to the Next.js backend API
 */

import { makeRequest } from './api-client';
import { logger } from './logger';

export interface ActionStep {
  action: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  error?: string;
  data?: any;
}

export interface LogResult {
  logId: number;
  taskId: string;
}

/**
 * Start logging an agent action
 */
export async function startAgentLog(
  task: string,
  metadata?: Record<string, any>
): Promise<LogResult> {
  try {
    const response = await makeRequest('/logs', 'POST', {
      action: 'create',
      task,
      status: 'PENDING',
      metadata,
      agentName: 'Claude Haiku 3',
    });

    logger.info(`📝 Created agent log: ${response.taskId}`);
    return response;
  } catch (error: any) {
    logger.error('Failed to create agent log:', error);
    // Return a dummy log ID to prevent execution failure
    return { logId: -1, taskId: 'error' };
  }
}

/**
 * Update an agent log with a new step
 */
export async function updateAgentLog(
  logId: number,
  action: string,
  status: 'success' | 'failed' = 'success',
  data?: any,
  error?: string
): Promise<void> {
  if (logId === -1) return; // Skip if log creation failed

  try {
    const step: ActionStep = {
      action,
      status,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
      ...(error && { error }),
    };

    await makeRequest('/logs', 'POST', {
      action: 'update',
      logId,
      step,
    });
  } catch (err: any) {
    logger.error('Failed to update agent log:', err);
  }
}

/**
 * Complete an agent log with success status
 */
export async function completeAgentLog(
  logId: number,
  finalMessage?: string
): Promise<void> {
  if (logId === -1) return;

  try {
    await makeRequest('/logs', 'POST', {
      action: 'complete',
      logId,
      status: 'SUCCESS',
      ...(finalMessage && { finalMessage }),
    });

    logger.info(`✅ Completed agent log ID: ${logId}`);
  } catch (error: any) {
    logger.error('Failed to complete agent log:', error);
  }
}

/**
 * Mark an agent log as failed
 */
export async function failAgentLog(
  logId: number,
  errorMessage: string
): Promise<void> {
  if (logId === -1) return;

  try {
    await makeRequest('/logs', 'POST', {
      action: 'complete',
      logId,
      status: 'FAILED',
      errorMessage,
    });

    logger.error(`❌ Failed agent log ID: ${logId}`);
  } catch (error: any) {
    logger.error('Failed to mark agent log as failed:', error);
  }
}

/**
 * Helper class to manage logging for a single operation
 */
export class AgentLogSession {
  private logId: number;
  private taskId: string;

  private constructor(logId: number, taskId: string) {
    this.logId = logId;
    this.taskId = taskId;
  }

  static async start(task: string, metadata?: Record<string, any>): Promise<AgentLogSession> {
    const { logId, taskId } = await startAgentLog(task, metadata);
    return new AgentLogSession(logId, taskId);
  }

  async update(action: string, data?: any): Promise<void> {
    await updateAgentLog(this.logId, action, 'success', data);
  }

  async updateWithError(action: string, error: string): Promise<void> {
    await updateAgentLog(this.logId, action, 'failed', undefined, error);
  }

  async complete(finalMessage?: string): Promise<void> {
    await completeAgentLog(this.logId, finalMessage);
  }

  async fail(errorMessage: string): Promise<void> {
    await failAgentLog(this.logId, errorMessage);
  }

  getLogId(): number {
    return this.logId;
  }

  getTaskId(): string {
    return this.taskId;
  }
}
