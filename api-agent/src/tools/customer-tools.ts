/**
 * Customer Management Tools
 * Tools for managing customer accounts, viewing history, and flagging users
 */

import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { makeRequest } from '../utils/api-client';
import { logger } from '../utils/logger';

/**
 * List all customers
 */
export const listCustomersTool = new DynamicStructuredTool({
  name: 'list_customers',
  description: 'Retrieve a comprehensive list of ALL customers in the system. Returns customer basic information including id, name, email, and role. Use this when asked to "list customers", "show all customers", "get customers", or "list all users". Supports pagination with limit and offset parameters.',
  schema: z.object({
    limit: z.number().optional().describe('Maximum number of customers to return (default: 50)'),
    offset: z.number().optional().describe('Number of customers to skip (for pagination)'),
  }),
  func: async ({ limit, offset }) => {
    try {
      logger.info(`Listing customers (limit: ${limit || 50}, offset: ${offset || 0})`);
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await makeRequest('GET', `/customers${queryString}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to list customers:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve customers',
      });
    }
  },
});

/**
 * Get customer details by ID
 */
export const getCustomerDetailsTool = new DynamicStructuredTool({
  name: 'get_customer_details',
  description: 'Get detailed information about a customer including their profile, contact info, and account status',
  schema: z.object({
    customerId: z.number().describe('The ID of the customer'),
  }),
  func: async ({ customerId }) => {
    try {
      logger.info(`Getting customer details for ID: ${customerId}`);
      const response = await makeRequest('GET', `/customers/${customerId}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get customer details:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve customer details',
      });
    }
  },
});

/**
 * Get customer order history
 */
export const getCustomerOrdersTool = new DynamicStructuredTool({
  name: 'get_customer_orders',
  description: 'Get all orders placed by a specific customer, sorted by date (newest first)',
  schema: z.object({
    customerId: z.number().describe('The ID of the customer'),
    limit: z.number().optional().describe('Maximum number of orders to return (default: 10)'),
  }),
  func: async ({ customerId, limit }) => {
    try {
      logger.info(`Getting orders for customer ${customerId}`);
      const params = limit ? `?limit=${limit}` : '';
      const response = await makeRequest('GET', `/customers/${customerId}/orders${params}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get customer orders:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve customer orders',
      });
    }
  },
});

/**
 * Get customer support ticket history
 */
export const getCustomerTicketsTool = new DynamicStructuredTool({
  name: 'get_customer_tickets',
  description: 'Get all support tickets created by a specific customer',
  schema: z.object({
    customerId: z.number().describe('The ID of the customer'),
    status: z.enum(['OPEN', 'CLOSED', 'ALL']).optional().describe('Filter by ticket status'),
  }),
  func: async ({ customerId, status }) => {
    try {
      logger.info(`Getting tickets for customer ${customerId}`);
      const params = status && status !== 'ALL' ? `?status=${status}` : '';
      const response = await makeRequest('GET', `/customers/${customerId}/tickets${params}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get customer tickets:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve customer tickets',
      });
    }
  },
});

/**
 * Update customer information
 */
export const updateCustomerInfoTool = new DynamicStructuredTool({
  name: 'update_customer_info',
  description: 'Update customer profile information such as name, email, or phone',
  schema: z.object({
    customerId: z.number().describe('The ID of the customer'),
    name: z.string().optional().describe('New customer name'),
    email: z.string().email().optional().describe('New email address'),
    phone: z.string().optional().describe('New phone number'),
  }),
  func: async ({ customerId, name, email, phone }) => {
    try {
      logger.info(`Updating customer ${customerId} information`);
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;

      const response = await makeRequest('PUT', `/customers/${customerId}`, updateData);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to update customer info:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to update customer information',
      });
    }
  },
});

/**
 * Flag a customer for review
 */
export const flagCustomerTool = new DynamicStructuredTool({
  name: 'flag_customer',
  description: 'Flag a customer account for review due to suspicious activity, repeated issues, or policy violations',
  schema: z.object({
    customerId: z.number().describe('The ID of the customer to flag'),
    reason: z.string().describe('Reason for flagging (e.g., "Multiple refund requests", "Suspicious orders")'),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().describe('Severity level of the flag'),
  }),
  func: async ({ customerId, reason, severity = 'MEDIUM' }) => {
    try {
      logger.info(`Flagging customer ${customerId}: ${reason}`);
      const response = await makeRequest('POST', `/customers/${customerId}/flag`, {
        reason,
        severity,
      });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to flag customer:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to flag customer',
      });
    }
  },
});

/**
 * Get customer statistics
 */
export const getCustomerStatsTool = new DynamicStructuredTool({
  name: 'get_customer_stats',
  description: 'Get statistics about a customer including total orders, total spent, average order value, and ticket count',
  schema: z.object({
    customerId: z.number().describe('The ID of the customer'),
  }),
  func: async ({ customerId }) => {
    try {
      logger.info(`Getting stats for customer ${customerId}`);
      const response = await makeRequest('GET', `/customers/${customerId}/stats`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get customer stats:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve customer statistics',
      });
    }
  },
});

// Export all customer tools
export const customerTools = [
  listCustomersTool,
  getCustomerDetailsTool,
  getCustomerOrdersTool,
  getCustomerTicketsTool,
  updateCustomerInfoTool,
  flagCustomerTool,
  getCustomerStatsTool,
];
