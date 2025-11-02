/**
 * LangChain Tools for Site Management
 * Wraps site control API actions as DynamicStructuredTool
 */

import { DynamicStructuredTool, DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';
import { siteAPI } from '../utils/api-client';
import { logger } from '../utils/logger';
import { parseToolInput } from '../utils/schema-helper';

/**
 * Get site status
 */
export const getSiteStatusTool = new DynamicStructuredTool({
  name: 'get_site_status',
  description: `Get current site status including maintenance mode and cache status. This tool requires NO parameters.
  
Returns JSON response:
{
  "success": true,
  "action": "getSiteStatus",
  "message": "Site status retrieved",
  "data": {
    "maintenanceMode": false,
    "lastCacheClear": "2025-10-31T12:00:00.000Z",
    "uptime": "5d 12h 30m"
  },
  "logId": 139
}`,
  schema: z.object({}),
  func: async (input: string | object) => {
    try {
      // Tool requires no parameters - ignore input
      logger.debug('Tool: get_site_status - Called (no parameters needed)');
      const result = await siteAPI.getStatus();
      logger.info('Tool: get_site_status - Success');
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: get_site_status - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'getSiteStatus',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Get site analytics
 */
export const getSiteAnalyticsTool = new DynamicStructuredTool({
  name: 'get_site_analytics',
  description: `Get site analytics including counts of orders, posts, tickets, users, and logs. This tool requires NO parameters.
  
Returns JSON response:
{
  "success": true,
  "action": "getSiteAnalytics",
  "message": "Analytics retrieved",
  "data": {
    "orders": { "total": 10, "pending": 3, "delivered": 5, "refunded": 2 },
    "posts": { "total": 3, "published": 2, "draft": 1 },
    "tickets": { "total": 5, "open": 2, "closed": 3 },
    "users": { "total": 3 },
    "logs": { "total": 150 }
  },
  "logId": 140
}`,
  schema: z.object({}),
  func: async (input: string | object) => {
    try {
      // Tool requires no parameters - ignore input
      logger.debug('Tool: get_site_analytics - Called (no parameters needed)');
      const result = await siteAPI.getAnalytics();
      logger.info('Tool: get_site_analytics - Success');
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: get_site_analytics - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'getSiteAnalytics',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Toggle maintenance mode (requires approval)
 */
export const toggleMaintenanceModeTool = new DynamicStructuredTool({
  name: 'toggle_maintenance_mode',
  description: `Enable or disable site maintenance mode. Input: {"enabled": true} to enable or {"enabled": false} to disable. This action REQUIRES APPROVAL from admin.
  
Returns JSON response with approval requirement:
{
  "success": true,
  "action": "toggleMaintenanceMode",
  "message": "Maintenance mode change pending approval",
  "status": "pending_approval",
  "approval": {
    "approvalId": "...",
    "action": "toggleMaintenanceMode",
    "description": "Enable maintenance mode",
    "timeout": 300000
  },
  "logId": 141
}

After approval:
{
  "success": true,
  "action": "toggleMaintenanceMode",
  "message": "Maintenance mode enabled",
  "data": {
    "maintenanceMode": true,
    "changedAt": "2025-10-31T12:00:00.000Z"
  },
  "logId": 142
}`,
  schema: z.object({
    enabled: z.union([
      z.boolean(),
      z.string().transform(val => val.toLowerCase() === 'true' || val === '1')
    ]).describe('true to enable maintenance mode, false to disable (accepts boolean or string)'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{enabled: boolean}>(input);
      logger.debug('Tool: toggle_maintenance_mode', parsed);
      const result = await siteAPI.toggleMaintenance(parsed.enabled);
      logger.info('Tool: toggle_maintenance_mode - Request sent', { enabled: parsed.enabled });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: toggle_maintenance_mode - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'toggleMaintenanceMode',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Clear site cache
 */
export const clearCacheTool = new DynamicStructuredTool({
  name: 'clear_cache',
  description: `Clear the site cache to force fresh data loading. This tool requires NO parameters.
  
Returns JSON response:
{
  "success": true,
  "action": "clearCache",
  "message": "Cache cleared successfully",
  "data": {
    "clearedAt": "2025-10-31T12:00:00.000Z",
    "itemsCleared": 1250
  },
  "logId": 143
}`,
  schema: z.object({}),
  func: async (input: string | object) => {
    try {
      // Tool requires no parameters - ignore input
      logger.debug('Tool: clear_cache - Called (no parameters needed)');
      const result = await siteAPI.clearCache();
      logger.info('Tool: clear_cache - Success');
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: clear_cache - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'clearCache',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Export all site tools
 */
export const siteTools = [
  getSiteStatusTool,
  getSiteAnalyticsTool,
  toggleMaintenanceModeTool,
  clearCacheTool,
];
