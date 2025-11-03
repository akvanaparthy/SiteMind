/**
 * LangChain Tools for Order Management
 * Wraps order API actions as DynamicStructuredTool
 */

import { DynamicStructuredTool, DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';
import { orderAPI } from '../utils/api-client';
import { logger } from '../utils/logger';
import { parseToolInput } from '../utils/schema-helper';

/**
 * Get an order by order ID
 */
export const getOrderTool = new DynamicStructuredTool({
  name: 'get_order',
  description: `Retrieve an order by its order ID.
  
Returns JSON response:
{
  "success": true,
  "action": "getOrder",
  "message": "Order retrieved successfully",
  "data": {
    "order": { "id": 1, "orderId": "...", "total": 99.99, "status": "...", "items": [...], ... }
  },
  "logId": 133
}`,
  schema: z.object({
    id: z.coerce.number().describe('Numeric order ID'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number}>(input);
      logger.debug('Tool: get_order - input received:', JSON.stringify(parsed));
      const result = await orderAPI.get(parsed.id);
      logger.info('Tool: get_order - Success', { orderId: parsed.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: get_order - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'getOrder',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Get all pending orders
 */
export const getPendingOrdersTool = new DynamicStructuredTool({
  name: 'get_pending_orders',
  description: `Retrieve all orders with PENDING status that need attention. This tool requires NO parameters.
  
Returns JSON response:
{
  "success": true,
  "action": "getPendingOrders",
  "message": "Found X pending orders",
  "data": {
    "orders": [{ "orderId": "...", "total": 99.99, "createdAt": "...", ... }],
    "count": 3
  },
  "logId": 134
}`,
  schema: z.object({}),
  func: async (input: string | object) => {
    try {
      // Tool requires no parameters - ignore input
      logger.debug('Tool: get_pending_orders - Called (no parameters needed)');
      const result = await orderAPI.getPending();
      logger.info('Tool: get_pending_orders - Success', { count: result.data?.count });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: get_pending_orders - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'getPendingOrders',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Update order status
 */
export const updateOrderStatusTool = new DynamicStructuredTool({
  name: 'update_order_status',
  description: `Change the status of an order (PENDING, DELIVERED, REFUNDED).
  
Returns JSON response:
{
  "success": true,
  "action": "updateOrderStatus",
  "message": "Order status updated to DELIVERED",
  "data": {
    "order": { "orderId": "...", "status": "DELIVERED", ... }
  },
  "logId": 135
}`,
  schema: z.object({
    id: z.coerce.number().describe('Numeric order ID'),
    status: z.string()
      .transform(val => val.toUpperCase())
      .pipe(z.enum(['PENDING', 'DELIVERED', 'REFUNDED']))
      .describe('New order status (PENDING, DELIVERED, or REFUNDED - case insensitive)'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number; status: string}>(input);
      logger.debug('Tool: update_order_status', parsed);
      // Cast to the correct enum type
      const status = parsed.status as 'PENDING' | 'DELIVERED' | 'REFUNDED';
      const result = await orderAPI.updateStatus(parsed.id, status);
      logger.info('Tool: update_order_status - Success', { orderId: parsed.id, status: status });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: update_order_status - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'updateOrderStatus',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Process refund for an order (requires approval)
 */
export const processRefundTool = new DynamicStructuredTool({
  name: 'process_refund',
  description: `Process a refund for an order. This action REQUIRES APPROVAL from admin.
  
Returns JSON response with approval requirement:
{
  "success": true,
  "action": "processRefund",
  "message": "Refund request pending approval",
  "status": "pending_approval",
  "approval": {
    "approvalId": "...",
    "action": "processRefund",
    "description": "Refund order #... for $99.99",
    "timeout": 300000
  },
  "logId": 136
}

After approval:
{
  "success": true,
  "action": "processRefund",
  "message": "Refund processed successfully",
  "data": {
    "order": { "orderId": "...", "status": "REFUNDED", "refundAmount": 99.99, ... }
  },
  "logId": 137
}`,
  schema: z.object({
    id: z.coerce.number().describe('Numeric order ID'),
    reason: z.string().describe('Reason for the refund'),
  }),
  func: async (input: any) => {
    try {
      const parsed = parseToolInput<{id: number; reason: string}>(input);
      logger.debug('Tool: process_refund', parsed);
      const result = await orderAPI.processRefund(parsed.id, parsed.reason);
      logger.info('Tool: process_refund - Request sent', { orderId: parsed.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: process_refund - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'processRefund',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Notify customer about order
 */
export const notifyCustomerTool = new DynamicStructuredTool({
  name: 'notify_customer',
  description: `Send a notification to the customer about their order via email.
  
Returns JSON response:
{
  "success": true,
  "action": "notifyCustomer",
  "message": "Customer notified successfully",
  "data": {
    "orderId": "...",
    "emailSent": true,
    "subject": "...",
    "sentTo": "customer@example.com"
  },
  "logId": 138
}`,
  schema: z.object({
    id: z.coerce.number().describe('Numeric order ID'),
    subject: z.string().describe('Email subject line'),
    message: z.string().optional().default('Notification about your order').describe('Email message body (defaults to generic message if not provided)'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number; subject: string; message?: string}>(input);
      logger.debug('Tool: notify_customer', parsed);
      // Use default message if not provided
      const message = parsed.message ?? 'Notification about your order';
      const result = await orderAPI.notifyCustomer(parsed.id, parsed.subject, message);
      logger.info('Tool: notify_customer - Success', { orderId: parsed.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: notify_customer - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'notifyCustomer',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Export all order tools
 */
export const orderTools = [
  getOrderTool,
  getPendingOrdersTool,
  updateOrderStatusTool,
  processRefundTool,
  notifyCustomerTool,
];
