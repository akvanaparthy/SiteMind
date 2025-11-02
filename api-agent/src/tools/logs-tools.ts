/**
 * LangChain Tools for Agent Log Management
 * Wraps logs API actions as DynamicStructuredTool
 */

import { DynamicStructuredTool, DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';
import { logsAPI } from '../utils/api-client';
import { logger } from '../utils/logger';
import { parseToolInput } from '../utils/schema-helper';

/**
 * Get all agent logs
 * Using DynamicStructuredTool with empty schema for Gemini compatibility
 */
export const getAgentLogsTool = new DynamicStructuredTool({
  name: 'get_agent_logs',
  description: `Retrieve agent logs. Returns most recent 50 logs by default. This tool requires NO parameters (or you can optionally specify limit as number).
  
Returns JSON response:
{
  "success": true,
  "action": "getAgentLogs",
  "message": "Retrieved X logs",
  "data": {
    "logs": [
      {
        "id": 150,
        "task": "Refunded order #456",
        "status": "SUCCESS",
        "timestamp": "2025-10-31T12:00:00.000Z",
        "details": [...]
      },
      ...
    ],
    "count": 50
  },
  "logId": 144
}`,
  schema: z.object({}),
  func: async (input: string | object) => {
    try {
      // Tool requires no parameters - ignore input
      logger.debug('Tool: get_agent_logs - Called (using default limit 50)');
      const result = await logsAPI.getAll(); // Use default limit
      logger.info('Tool: get_agent_logs - Success', { count: result.data?.count });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: get_agent_logs - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'getAgentLogs',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Get a specific log by ID
 */
export const getLogByIdTool = new DynamicStructuredTool({
  name: 'get_log_by_id',
  description: `Retrieve a specific agent log entry by its ID, including all hierarchical children logs.
  
Returns JSON response:
{
  "success": true,
  "action": "getLogById",
  "message": "Log retrieved successfully",
  "data": {
    "log": {
      "id": 150,
      "task": "Refunded order #456",
      "status": "SUCCESS",
      "timestamp": "2025-10-31T12:00:00.000Z",
      "details": [...],
      "children": [
        { "id": 151, "task": "Updated order status", ... },
        { "id": 152, "task": "Sent email to customer", ... }
      ]
    }
  },
  "logId": 145
}`,
  schema: z.object({
    id: z.coerce.number().describe('ID of the log entry to retrieve'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number}>(input);
      logger.debug('Tool: get_log_by_id', parsed);
      const result = await logsAPI.get(parsed.id);
      logger.info('Tool: get_log_by_id - Success', { logId: parsed.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: get_log_by_id - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'getLogById',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Export all logs tools
 */
export const logsTools = [
  getAgentLogsTool,
  getLogByIdTool,
];
