/**
 * LangChain Tools Export
 * Central export for all agent tools
 */

import { blogTools } from './blog-tools';
import { ticketTools } from './ticket-tools';
import { orderTools } from './order-tools';
import { siteTools } from './site-tools';
import { logsTools } from './logs-tools';
import { customerTools } from './customer-tools';
import { productTools } from './product-tools';
import { analyticsTools } from './analytics-tools';
import { contentTools } from './content-tools';

/**
 * All available tools for the agent
 * Total: 56 tools (21 original + 35 new)
 * 
 * Breakdown:
 * - Blog: 7 tools (list, search, get, create, update, publish, trash)
 * - Tickets: 8 tools (list, search, create, get, getOpen, close, updatePriority, assign)
 * - Orders: 5 tools (get, getAll, getPending, updateStatus, processRefund, notifyCustomer)
 * - Site: 4 tools (getStatus, getAnalytics, toggleMaintenance, clearCache)
 * - Logs: 2 tools (getAgentLogs, getLogById)
 * - Customers: 7 tools (list, getDetails, getOrders, getTickets, updateInfo, flag, getStats)
 * - Products: 9 tools (list, search, get, updateStock, setPrice, toggleAvailability, getLowStock, create, bulkUpdate)
 * - Analytics: 6 tools (getRevenue, getTopProducts, getSatisfaction, getConversion, export, forecast)
 * - Content: 6 tools (schedule, generate, optimizeSEO, createPage, getAnalytics, bulkSchedule)
 */
export const allTools = [
  ...blogTools,       // 7 tools: list, search, get, create, update, publish, trash
  ...ticketTools,     // 8 tools: list, search, create, get, getOpen, close, updatePriority, assign
  ...orderTools,      // 5 tools: get, getAll, getPending, updateStatus, processRefund, notifyCustomer
  ...siteTools,       // 4 tools: getStatus, getAnalytics, toggleMaintenance, clearCache
  ...logsTools,       // 2 tools: getAgentLogs, getLogById
  ...customerTools,   // 7 tools: list, getDetails, getOrders, getTickets, updateInfo, flag, getStats
  ...productTools,    // 9 tools: list, search, get, updateStock, setPrice, toggleAvailability, getLowStock, create, bulkUpdate
  ...analyticsTools,  // 6 tools: getRevenue, getTopProducts, getSatisfaction, getConversion, export, forecast
  ...contentTools,    // 6 tools: schedule, generate, optimizeSEO, createPage, getAnalytics, bulkSchedule
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
  customer: customerTools,
  product: productTools,
  analytics: analyticsTools,
  content: contentTools,
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
export { 
  blogTools, 
  ticketTools, 
  orderTools, 
  siteTools, 
  logsTools,
  customerTools,
  productTools,
  analyticsTools,
  contentTools,
};

/**
 * Re-export individual tools
 */
export * from './blog-tools';
export * from './ticket-tools';
export * from './order-tools';
export * from './site-tools';
export * from './logs-tools';
export * from './customer-tools';
export * from './product-tools';
export * from './analytics-tools';
export * from './content-tools';
