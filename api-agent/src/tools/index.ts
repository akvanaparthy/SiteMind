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
 * Total: 45 tools (21 original + 24 new)
 */
export const allTools = [
  ...blogTools,       // 5 tools: create, update, publish, trash, get
  ...ticketTools,     // 5 tools: get, getOpen, close, updatePriority, assign
  ...orderTools,      // 5 tools: get, getPending, updateStatus, processRefund, notifyCustomer
  ...siteTools,       // 4 tools: getStatus, getAnalytics, toggleMaintenance, clearCache
  ...logsTools,       // 2 tools: getAgentLogs, getLogById
  ...customerTools,   // 6 tools: getDetails, getOrders, getTickets, updateInfo, flag, getStats
  ...productTools,    // 6 tools: updateStock, setPrice, toggleAvailability, getLowStock, create, bulkUpdate
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
