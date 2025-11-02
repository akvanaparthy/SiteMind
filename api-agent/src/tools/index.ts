/**
 * LangChain Tools Export
 * Central export for all agent tools
 */

import { blogTools } from './blog-tools';
import { ticketTools } from './ticket-tools';
import { orderTools } from './order-tools';
import { siteTools } from './site-tools';
import { logsTools } from './logs-tools';

/**
 * All available tools for the agent
 * Total: 21 tools
 */
export const allTools = [
  ...blogTools,      // 5 tools: create, update, publish, trash, get
  ...ticketTools,    // 5 tools: get, getOpen, close, updatePriority, assign
  ...orderTools,     // 5 tools: get, getPending, updateStatus, processRefund, notifyCustomer
  ...siteTools,      // 4 tools: getStatus, getAnalytics, toggleMaintenance, clearCache
  ...logsTools,      // 2 tools: getAgentLogs, getLogById
];

/**
 * Tools organized by category
 */
export const toolsByCategory = {
  blog: blogTools,
  ticket: ticketTools,
  order: orderTools,
  site: siteTools,
  logs: logsTools,
};

/**
 * Tool names for reference
 */
export const toolNames = allTools.map(tool => tool.name);

/**
 * Get tool by name
 */
export function getToolByName(name: string) {
  return allTools.find(tool => tool.name === name);
}

/**
 * Re-export individual tool arrays
 */
export { blogTools, ticketTools, orderTools, siteTools, logsTools };

/**
 * Re-export individual tools
 */
export * from './blog-tools';
export * from './ticket-tools';
export * from './order-tools';
export * from './site-tools';
export * from './logs-tools';
