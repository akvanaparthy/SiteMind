/**
 * API Client for calling Next.js backend actions
 */

import { getConfig } from './config';
import { logger } from './logger';
import { ActionAPIResponse } from '../types/agent';

/**
 * Make HTTP request to Next.js API
 */
export async function makeRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<any> {
  const config = getConfig();
  const url = `${config.nextjsApiUrl}${endpoint}`;

  logger.debug(`API Request: ${method} ${url}`, body);

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(config.nextjsApiTimeout),
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      logger.error(`API Error: ${method} ${url}`, {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    logger.debug(`API Response: ${method} ${url}`, data);
    return data;
  } catch (error) {
    logger.error(`API Request failed: ${method} ${url}`, error);
    throw error;
  }
}

/**
 * Blog Actions
 */
export const blogAPI = {
  create: (data: { title: string; content: string; excerpt?: string; authorId: number }) =>
    makeRequest('/posts', 'POST', { type: 'create', ...data }),

  update: (data: { id: number; title?: string; content?: string; excerpt?: string }) =>
    makeRequest('/posts', 'PUT', { type: 'update', ...data }),

  publish: (id: number) => makeRequest('/posts', 'PUT', { type: 'publish', id }),

  trash: (id: number) => makeRequest('/posts', 'PUT', { type: 'trash', id }),

  get: (id: number) => makeRequest(`/posts?type=get&id=${id}`, 'GET'),
};

/**
 * Ticket Actions
 */
export const ticketAPI = {
  get: (id: number) => makeRequest(`/tickets?type=get&id=${id}`, 'GET'),

  getOpen: () => makeRequest('/tickets?type=getOpen', 'GET'),

  close: (id: number, resolution?: string) =>
    makeRequest('/tickets', 'PUT', { type: 'close', id, resolution }),

  updatePriority: (id: number, priority: 'LOW' | 'MEDIUM' | 'HIGH') =>
    makeRequest('/tickets', 'PUT', { type: 'updatePriority', id, priority }),

  assign: (id: number, assigneeId: number) =>
    makeRequest('/tickets', 'PUT', { type: 'assign', id, assigneeId }),
};

/**
 * Order Actions
 */
export const orderAPI = {
  get: (id: number) => makeRequest(`/orders?type=get&id=${id}`, 'GET'),

  getPending: () => makeRequest('/orders?type=getPending', 'GET'),

  updateStatus: (id: number, status: 'PENDING' | 'DELIVERED' | 'REFUNDED') =>
    makeRequest('/orders', 'PUT', { type: 'updateStatus', id, status }),

  processRefund: (id: number, reason: string) =>
    makeRequest('/orders', 'POST', { type: 'refund', id, reason }),

  notifyCustomer: (id: number, subject: string, message: string) =>
    makeRequest('/orders', 'POST', { type: 'notify', id, subject, message }),
};

/**
 * Site Actions
 */
export const siteAPI = {
  getStatus: () => makeRequest('/site?type=status', 'GET'),

  getAnalytics: () => makeRequest('/site?type=analytics', 'GET'),

  toggleMaintenance: (enabled: boolean) =>
    makeRequest('/site', 'PUT', { type: 'maintenance', enabled }),

  clearCache: () => makeRequest('/site', 'POST', { type: 'clearCache' }),
};

/**
 * Agent Logs
 */
export const logsAPI = {
  getAll: (limit?: number) => makeRequest(`/logs${limit ? `?limit=${limit}` : ''}`, 'GET'),

  get: (id: number) => makeRequest(`/logs?id=${id}`, 'GET'),
};

/**
 * Generic API client
 */
export const apiClient = {
  blog: blogAPI,
  ticket: ticketAPI,
  order: orderAPI,
  site: siteAPI,
  logs: logsAPI,
};

/**
 * Validate API response format
 */
export function validateActionResponse(response: any): ActionAPIResponse {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid API response: not an object');
  }

  if (typeof response.success !== 'boolean') {
    throw new Error('Invalid API response: missing success field');
  }

  if (typeof response.action !== 'string') {
    throw new Error('Invalid API response: missing action field');
  }

  return response as ActionAPIResponse;
}
