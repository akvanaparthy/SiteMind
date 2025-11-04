/**
 * LangChain Tools for Ticket Management
 * Wraps ticket API actions as DynamicStructuredTool
 */

import { DynamicStructuredTool, DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ticketAPI, makeRequest } from '../utils/api-client';
import { logger } from '../utils/logger';
import { parseToolInput } from '../utils/schema-helper';

/**
 * List all tickets
 */
export const listTicketsTool = new DynamicStructuredTool({
  name: 'list_tickets',
  description: `Retrieve all support tickets with optional filters. This tool requires NO parameters, but you can filter by status or priority.
  
Returns JSON response:
{
  "success": true,
  "action": "listTickets",
  "data": {
    "tickets": [{ "id": 1, "subject": "...", "status": "...", "priority": "...", ... }],
    "count": 10
  }
}`,
  schema: z.object({
    status: z.enum(['OPEN', 'CLOSED']).optional().describe('Filter by status (OPEN or CLOSED)'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().describe('Filter by priority'),
    limit: z.number().optional().describe('Maximum number of tickets to return'),
  }),
  func: async ({ status, priority, limit }) => {
    try {
      logger.info(`Listing tickets (status: ${status || 'all'}, priority: ${priority || 'all'})`);
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (limit) params.append('limit', limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await makeRequest('GET', `/tickets${queryString}`);
      return JSON.stringify(response, null, 2);
    } catch (error) {
      logger.error('Tool: list_tickets - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'listTickets',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Create a new support ticket
 */
export const createTicketTool = new DynamicStructuredTool({
  name: 'create_ticket',
  description: `Create a new support ticket for a customer.
  
Returns JSON response:
{
  "success": true,
  "action": "createTicket",
  "message": "Ticket created successfully",
  "data": {
    "ticket": { "id": 6, "ticketId": "...", "subject": "...", "status": "OPEN", ... }
  }
}`,
  schema: z.object({
    customerId: z.number().describe('ID of the customer creating the ticket'),
    subject: z.string().describe('Ticket subject/title'),
    description: z.string().describe('Detailed description of the issue'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().describe('Ticket priority (defaults to MEDIUM)'),
  }),
  func: async ({ customerId, subject, description, priority }) => {
    try {
      logger.info(`Creating ticket for customer ${customerId}: ${subject}`);
      const response = await makeRequest('POST', '/tickets', {
        customerId,
        subject,
        description,
        priority: priority || 'MEDIUM',
      });
      return JSON.stringify(response, null, 2);
    } catch (error) {
      logger.error('Tool: create_ticket - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'createTicket',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Search tickets
 */
export const searchTicketsTool = new DynamicStructuredTool({
  name: 'search_tickets',
  description: `Search for tickets by subject, description keywords, or customer. Returns matching tickets.`,
  schema: z.object({
    query: z.string().describe('Search query (subject keywords, description, or customer name)'),
    limit: z.number().optional().describe('Maximum number of results (default: 20)'),
  }),
  func: async ({ query, limit }) => {
    try {
      logger.info(`Searching tickets: "${query}"`);
      const params = new URLSearchParams();
      params.append('search', query);
      if (limit) params.append('limit', limit.toString());
      const response = await makeRequest('GET', `/tickets?${params.toString()}`);
      return JSON.stringify(response, null, 2);
    } catch (error) {
      logger.error('Tool: search_tickets - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'searchTickets',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Get a ticket by ID
 */
export const getTicketTool = new DynamicStructuredTool({
  name: 'get_ticket',
  description: `Retrieve a support ticket by its ID.
  
Returns JSON response:
{
  "success": true,
  "action": "getTicket",
  "message": "Ticket retrieved successfully",
  "data": {
    "ticket": { "id": 1, "ticketId": "...", "subject": "...", "status": "...", "priority": "...", ... }
  },
  "logId": 128
}`,
  schema: z.object({
    id: z.coerce.number().describe('ID of the ticket to retrieve'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number}>(input);
      logger.debug('Tool: get_ticket', parsed);
      const result = await ticketAPI.get(parsed.id);
      logger.info('Tool: get_ticket - Success', { ticketId: parsed.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: get_ticket - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'getTicket',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Get all open tickets
 */
export const getOpenTicketsTool = new DynamicStructuredTool({
  name: 'get_open_tickets',
  description: `Retrieve all open support tickets that need attention. This tool requires NO parameters.
  
Returns JSON response:
{
  "success": true,
  "action": "getOpenTickets",
  "message": "Found X open tickets",
  "data": {
    "tickets": [{ "id": 1, "subject": "...", "priority": "...", ... }],
    "count": 5
  },
  "logId": 129
}`,
  schema: z.object({}),
  func: async (input: string | object) => {
    try {
      // Tool requires no parameters - ignore input
      logger.debug('Tool: get_open_tickets - Called (no parameters needed)');
      const result = await ticketAPI.getOpen();
      logger.info('Tool: get_open_tickets - Success', { count: result.data?.count });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: get_open_tickets - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'getOpenTickets',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Close a ticket
 */
export const closeTicketTool = new DynamicStructuredTool({
  name: 'close_ticket',
  description: `Close a support ticket with an optional resolution message.
  
Returns JSON response:
{
  "success": true,
  "action": "closeTicket",
  "message": "Ticket closed successfully",
  "data": {
    "ticket": { "id": 1, "status": "CLOSED", "resolution": "...", ... }
  },
  "logId": 130
}`,
  schema: z.object({
    id: z.coerce.number().describe('ID of the ticket to close'),
    resolution: z.string().optional().describe('Optional resolution message'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number; resolution?: string}>(input);
      logger.debug('Tool: close_ticket', parsed);
      const result = await ticketAPI.close(parsed.id, parsed.resolution);
      logger.info('Tool: close_ticket - Success', { ticketId: parsed.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: close_ticket - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'closeTicket',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Update ticket priority
 */
export const updateTicketPriorityTool = new DynamicStructuredTool({
  name: 'update_ticket_priority',
  description: `UPDATE/CHANGE the priority level of a support ticket. Use this when you need to SET or CHANGE priority to LOW, MEDIUM, or HIGH. Do NOT use this just to view a ticket.
  
Returns JSON response:
{
  "success": true,
  "action": "updateTicketPriority",
  "message": "Ticket priority updated to HIGH",
  "data": {
    "ticket": { "id": 1, "priority": "HIGH", ... }
  },
  "logId": 131
}`,
  schema: z.object({
    id: z.coerce.number().describe('ID of the ticket'),
    priority: z.string()
      .transform(val => val.toUpperCase())
      .pipe(z.enum(['LOW', 'MEDIUM', 'HIGH']))
      .describe('New priority level (LOW, MEDIUM, or HIGH - case insensitive)'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number; priority: string}>(input);
      logger.debug('Tool: update_ticket_priority', parsed);
      // Cast to the correct enum type
      const priority = parsed.priority as 'LOW' | 'MEDIUM' | 'HIGH';
      const result = await ticketAPI.updatePriority(parsed.id, priority);
      logger.info('Tool: update_ticket_priority - Success', { ticketId: parsed.id, priority: priority });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: update_ticket_priority - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'updateTicketPriority',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Assign ticket to a user
 */
export const assignTicketTool = new DynamicStructuredTool({
  name: 'assign_ticket',
  description: `Assign a support ticket to a specific user (support agent). If you don't specify assigneeId, it defaults to Admin (user #5).
  
Returns JSON response:
{
  "success": true,
  "action": "assignTicket",
  "message": "Ticket assigned to user #3",
  "data": {
    "ticket": { "id": 1, "assigneeId": 3, ... }
  },
  "logId": 132
}`,
  schema: z.object({
    id: z.coerce.number().describe('ID of the ticket to assign'),
    assigneeId: z.coerce.number().optional().default(5).describe('ID of the user to assign the ticket to (defaults to 5 - Admin)'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number; assigneeId?: number}>(input);
      logger.debug('Tool: assign_ticket', parsed);
      // Use default assigneeId (5 - Admin) if not provided
      const assigneeId = parsed.assigneeId ?? 5;
      const result = await ticketAPI.assign(parsed.id, assigneeId);
      logger.info('Tool: assign_ticket - Success', { ticketId: parsed.id, assigneeId: assigneeId });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: assign_ticket - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'assignTicket',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Export all ticket tools
 */
export const ticketTools = [
  listTicketsTool,
  searchTicketsTool,
  createTicketTool,
  getTicketTool,
  getOpenTicketsTool,
  closeTicketTool,
  updateTicketPriorityTool,
  assignTicketTool,
];
