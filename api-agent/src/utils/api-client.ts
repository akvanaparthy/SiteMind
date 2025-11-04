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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
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
    makeRequest('POST', '/posts', { type: 'create', ...data }),

  update: (data: { id: number; title?: string; content?: string; excerpt?: string }) =>
    makeRequest('PUT', '/posts', { type: 'update', ...data }),

  publish: (id: number) => makeRequest('PUT', '/posts', { type: 'publish', id }),

  trash: (id: number) => makeRequest('PUT', '/posts', { type: 'trash', id }),

  get: (id: number) => makeRequest('GET', `/posts?type=get&id=${id}`),
};

/**
 * Ticket Actions
 */
export const ticketAPI = {
  get: (id: number) => makeRequest('GET', `/tickets?type=get&id=${id}`),

  getOpen: () => makeRequest('GET', '/tickets?type=getOpen'),

  close: (id: number, resolution?: string) =>
    makeRequest('PUT', '/tickets', { type: 'close', id, resolution }),

  updatePriority: (id: number, priority: 'LOW' | 'MEDIUM' | 'HIGH') =>
    makeRequest('PUT', '/tickets', { type: 'updatePriority', id, priority }),

  assign: (id: number, assigneeId: number) =>
    makeRequest('PUT', '/tickets', { type: 'assign', id, assigneeId }),
};

/**
 * Order Actions
 */
export const orderAPI = {
  get: (id: number) => makeRequest('GET', `/orders?type=get&id=${id}`),

  getAll: () => makeRequest('GET', '/orders'),

  getPending: () => makeRequest('GET', '/orders?type=getPending'),

  updateStatus: (id: number, status: 'PENDING' | 'DELIVERED' | 'REFUNDED') =>
    makeRequest('PUT', '/orders', { type: 'updateStatus', id, status }),

  processRefund: (id: number, reason: string) =>
    makeRequest('POST', '/orders', { type: 'refund', id, reason }),

  notifyCustomer: (id: number, subject: string, message: string) =>
    makeRequest('POST', '/orders', { type: 'notify', id, subject, message }),
};

/**
 * Site Actions
 */
export const siteAPI = {
  getStatus: () => makeRequest('GET', '/site?type=status'),

  getAnalytics: () => makeRequest('GET', '/site?type=analytics'),

  toggleMaintenance: (enabled: boolean) =>
    makeRequest('PUT', '/site', { type: 'maintenance', enabled }),

  clearCache: () => makeRequest('POST', '/site', { type: 'clearCache' }),
};

/**
 * Agent Logs
 */
export const logsAPI = {
  getAll: (limit?: number) => makeRequest('GET', `/logs${limit ? `?limit=${limit}` : ''}`),

  get: (id: number) => makeRequest('GET', `/logs?id=${id}`),
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
