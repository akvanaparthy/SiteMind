import { LogStatus, AgentLog, Prisma } from '@prisma/client';
import prisma from './prisma';

/**
 * Action step detail for hierarchical logging
 */
export interface ActionStep {
  action: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  error?: string;
  data?: any;
}

/**
 * Options for creating a new agent log
 */
export interface LogActionOptions {
  task: string;
  status?: LogStatus;
  details?: ActionStep[];
  metadata?: Record<string, any>;
  parentId?: number;
  agentName?: string;
}

/**
 * Options for filtering agent logs
 */
export interface GetLogsOptions {
  status?: LogStatus;
  taskId?: string;
  parentId?: number | null;
  includeChildren?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
}

/**
 * Create a new agent log entry
 * 
 * @param options - Logging options
 * @returns The created log entry
 * 
 * @example
 * ```ts
 * const log = await logAction({
 *   task: 'Refund order #456',
 *   status: LogStatus.PENDING,
 *   details: [
 *     { action: 'Query order', status: 'success', timestamp: new Date().toISOString() }
 *   ],
 *   metadata: { orderId: '456', amount: 99.99 }
 * });
 * ```
 */
export async function logAction(options: LogActionOptions): Promise<AgentLog> {
  try {
    const log = await prisma.agentLog.create({
      data: {
        task: options.task,
        status: options.status ?? LogStatus.PENDING,
        details: (options.details ?? []) as unknown as Prisma.InputJsonValue,
        metadata: (options.metadata ?? {}) as unknown as Prisma.InputJsonValue,
        parentId: options.parentId,
        agentName: options.agentName ?? 'AI Agent',
      },
      include: {
        children: true,
        parent: true,
      },
    });

    return log;
  } catch (error) {
    console.error('[Agent Logger] Failed to create log:', error);
    throw new Error('Failed to create agent log');
  }
}

/**
 * Update the status of an existing agent log
 * 
 * @param logId - The log ID or taskId
 * @param status - New status
 * @param additionalDetails - Optional new details to append
 * @returns The updated log entry
 * 
 * @example
 * ```ts
 * await updateLogStatus(log.id, LogStatus.SUCCESS, [
 *   { action: 'Sent confirmation email', status: 'success', timestamp: new Date().toISOString() }
 * ]);
 * ```
 */
export async function updateLogStatus(
  logId: number | string,
  status: LogStatus,
  additionalDetails?: ActionStep[]
): Promise<AgentLog> {
  try {
    // Find the log by ID or taskId
    const existingLog = typeof logId === 'number'
      ? await prisma.agentLog.findUnique({ where: { id: logId } })
      : await prisma.agentLog.findUnique({ where: { taskId: logId } });

    if (!existingLog) {
      throw new Error(`Log with ID/taskId ${logId} not found`);
    }

    // Merge existing details with new details
    const currentDetails = (existingLog.details as unknown as ActionStep[]) ?? [];
    const updatedDetails = additionalDetails
      ? [...currentDetails, ...additionalDetails]
      : currentDetails;

    const updatedLog = await prisma.agentLog.update({
      where: { id: existingLog.id },
      data: {
        status,
        details: updatedDetails as unknown as Prisma.InputJsonValue,
      },
      include: {
        children: true,
        parent: true,
      },
    });

    return updatedLog;
  } catch (error) {
    console.error('[Agent Logger] Failed to update log status:', error);
    throw new Error('Failed to update agent log status');
  }
}

/**
 * Add a child log entry to an existing parent log
 * 
 * @param parentLogId - Parent log ID
 * @param childOptions - Options for the child log
 * @returns The created child log entry
 * 
 * @example
 * ```ts
 * const childLog = await addChildLog(parentLog.id, {
 *   task: 'Send confirmation email',
 *   status: LogStatus.SUCCESS
 * });
 * ```
 */
export async function addChildLog(
  parentLogId: number,
  childOptions: Omit<LogActionOptions, 'parentId'>
): Promise<AgentLog> {
  return logAction({
    ...childOptions,
    parentId: parentLogId,
  });
}

/**
 * Retrieve agent logs with optional filtering
 * 
 * @param options - Filter and pagination options
 * @returns Array of agent logs
 * 
 * @example
 * ```ts
 * // Get all successful logs
 * const successLogs = await getAgentLogs({ status: LogStatus.SUCCESS });
 * 
 * // Get top-level logs (no parent)
 * const topLevelLogs = await getAgentLogs({ parentId: null, includeChildren: true });
 * 
 * // Get recent 10 logs
 * const recentLogs = await getAgentLogs({ limit: 10, orderBy: 'desc' });
 * ```
 */
export async function getAgentLogs(options: GetLogsOptions = {}): Promise<AgentLog[]> {
  try {
    const {
      status,
      taskId,
      parentId,
      includeChildren = false,
      limit,
      offset,
      orderBy = 'desc',
    } = options;

    const logs = await prisma.agentLog.findMany({
      where: {
        ...(status && { status }),
        ...(taskId && { taskId }),
        ...(parentId !== undefined && { parentId }),
      },
      include: {
        children: includeChildren,
        parent: true,
      },
      orderBy: {
        timestamp: orderBy,
      },
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
    });

    return logs;
  } catch (error) {
    console.error('[Agent Logger] Failed to retrieve logs:', error);
    throw new Error('Failed to retrieve agent logs');
  }
}

/**
 * Get a single agent log by ID or taskId
 * 
 * @param logId - Log ID or taskId
 * @param includeChildren - Whether to include child logs
 * @returns The log entry or null if not found
 */
export async function getAgentLog(
  logId: number | string,
  includeChildren: boolean = true
): Promise<AgentLog | null> {
  try {
    const log = typeof logId === 'number'
      ? await prisma.agentLog.findUnique({
          where: { id: logId },
          include: { children: includeChildren, parent: true },
        })
      : await prisma.agentLog.findUnique({
          where: { taskId: logId },
          include: { children: includeChildren, parent: true },
        });

    return log;
  } catch (error) {
    console.error('[Agent Logger] Failed to retrieve log:', error);
    return null;
  }
}

/**
 * Delete old logs (for cleanup/maintenance)
 * 
 * @param olderThanDays - Delete logs older than this many days
 * @returns Number of logs deleted
 */
export async function cleanupOldLogs(olderThanDays: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.agentLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error('[Agent Logger] Failed to cleanup logs:', error);
    throw new Error('Failed to cleanup old logs');
  }
}

/**
 * Get agent logs statistics
 * 
 * @returns Statistics about agent logs
 */
export async function getLogStats() {
  try {
    const [total, pending, success, failed] = await Promise.all([
      prisma.agentLog.count(),
      prisma.agentLog.count({ where: { status: LogStatus.PENDING } }),
      prisma.agentLog.count({ where: { status: LogStatus.SUCCESS } }),
      prisma.agentLog.count({ where: { status: LogStatus.FAILED } }),
    ]);

    return {
      total,
      pending,
      success,
      failed,
      successRate: total > 0 ? ((success / total) * 100).toFixed(2) + '%' : '0%',
    };
  } catch (error) {
    console.error('[Agent Logger] Failed to get log stats:', error);
    throw new Error('Failed to get log statistics');
  }
}

/**
 * Helper function to create a pending log and return an update function
 * Useful for tracking long-running operations
 * 
 * @param task - Task description
 * @param metadata - Optional metadata
 * @returns Object with log and update function
 * 
 * @example
 * ```ts
 * const { log, update, complete, fail } = await startLogging('Process refund', { orderId: '456' });
 * 
 * await update('Querying order details');
 * await update('Verifying refund eligibility');
 * await update('Processing refund');
 * await complete('Refund processed successfully');
 * ```
 */
export async function startLogging(
  task: string,
  metadata?: Record<string, any>,
  agentName?: string
) {
  const log = await logAction({
    task,
    status: LogStatus.PENDING,
    metadata,
    agentName,
    details: [],
  });

  const details: ActionStep[] = [];

  return {
    log,
    /**
     * Add a successful step
     */
    update: async (action: string, data?: any) => {
      details.push({
        action,
        status: 'success',
        timestamp: new Date().toISOString(),
        data,
      });
      await updateLogStatus(log.id, LogStatus.PENDING, [details[details.length - 1]]);
    },
    /**
     * Mark the entire task as complete
     */
    complete: async (finalAction?: string) => {
      if (finalAction) {
        details.push({
          action: finalAction,
          status: 'success',
          timestamp: new Date().toISOString(),
        });
      }
      await updateLogStatus(log.id, LogStatus.SUCCESS, finalAction ? [details[details.length - 1]] : undefined);
    },
    /**
     * Mark the task as failed
     */
    fail: async (action: string, error: string) => {
      details.push({
        action,
        status: 'failed',
        timestamp: new Date().toISOString(),
        error,
      });
      await updateLogStatus(log.id, LogStatus.FAILED, [details[details.length - 1]]);
    },
  };
}

export default {
  logAction,
  updateLogStatus,
  addChildLog,
  getAgentLogs,
  getAgentLog,
  cleanupOldLogs,
  getLogStats,
  startLogging,
};
