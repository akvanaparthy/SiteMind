/**
 * Analytics & Reporting Tools
 * Tools for generating business insights, reports, and metrics
 */

import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { makeRequest } from '../utils/api-client';
import { logger } from '../utils/logger';

/**
 * Get revenue report for a date range
 */
export const getRevenueReportTool = new DynamicStructuredTool({
  name: 'get_revenue_report',
  description: 'Get detailed revenue report including total sales, order count, average order value for a date range',
  schema: z.object({
    startDate: z.string().describe('Start date (YYYY-MM-DD)'),
    endDate: z.string().describe('End date (YYYY-MM-DD)'),
    groupBy: z.enum(['day', 'week', 'month']).optional().describe('Group results by time period'),
  }),
  func: async ({ startDate, endDate, groupBy }) => {
    try {
      logger.info(`Getting revenue report from ${startDate} to ${endDate}`);
      const params = new URLSearchParams({ startDate, endDate });
      if (groupBy) params.append('groupBy', groupBy);
      
      const response = await makeRequest('GET', `/analytics/revenue?${params.toString()}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get revenue report:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve revenue report',
      });
    }
  },
});

/**
 * Get top selling products
 */
export const getTopProductsTool = new DynamicStructuredTool({
  name: 'get_top_products',
  description: 'Get the best-selling products ranked by units sold or revenue',
  schema: z.object({
    limit: z.number().optional().describe('Number of top products to return (default: 10)'),
    sortBy: z.enum(['units', 'revenue']).optional().describe('Sort by units sold or revenue (default: revenue)'),
    period: z.string().optional().describe('Time period in days (e.g., "7", "30", "90")'),
  }),
  func: async ({ limit = 10, sortBy = 'revenue', period }) => {
    try {
      logger.info(`Getting top ${limit} products by ${sortBy}`);
      const params = new URLSearchParams({ limit: limit.toString(), sortBy });
      if (period) params.append('period', period);
      
      const response = await makeRequest('GET', `/analytics/top-products?${params.toString()}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get top products:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve top products',
      });
    }
  },
});

/**
 * Get customer satisfaction score
 */
export const getCustomerSatisfactionTool = new DynamicStructuredTool({
  name: 'get_customer_satisfaction_score',
  description: 'Get customer satisfaction metrics based on ticket ratings, resolution time, and feedback',
  schema: z.object({
    period: z.number().optional().describe('Number of days to analyze (default: 30)'),
  }),
  func: async ({ period = 30 }) => {
    try {
      logger.info(`Getting customer satisfaction score for last ${period} days`);
      const response = await makeRequest('GET', `/analytics/csat?period=${period}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get customer satisfaction:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve customer satisfaction score',
      });
    }
  },
});

/**
 * Get conversion rate analytics
 */
export const getConversionRateTool = new DynamicStructuredTool({
  name: 'get_conversion_rate',
  description: 'Get conversion rate metrics including visitor-to-customer conversion, cart abandonment rate',
  schema: z.object({
    period: z.number().optional().describe('Number of days to analyze (default: 30)'),
  }),
  func: async ({ period = 30 }) => {
    try {
      logger.info(`Getting conversion rate for last ${period} days`);
      const response = await makeRequest('GET', `/analytics/conversion-rate?period=${period}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get conversion rate:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve conversion rate',
      });
    }
  },
});

/**
 * Export report in various formats
 */
export const exportReportTool = new DynamicStructuredTool({
  name: 'export_report',
  description: 'Generate and export a report in CSV or PDF format',
  schema: z.object({
    reportType: z.enum(['revenue', 'orders', 'products', 'customers', 'tickets']).describe('Type of report to export'),
    format: z.enum(['csv', 'pdf']).describe('Export format'),
    startDate: z.string().optional().describe('Start date for the report (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('End date for the report (YYYY-MM-DD)'),
  }),
  func: async ({ reportType, format, startDate, endDate }) => {
    try {
      logger.info(`Exporting ${reportType} report as ${format}`);
      const response = await makeRequest('POST', `/analytics/export`, {
        reportType,
        format,
        startDate,
        endDate,
      });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to export report:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to export report',
      });
    }
  },
});

/**
 * Get sales forecast
 */
export const getSalesForecastTool = new DynamicStructuredTool({
  name: 'get_sales_forecast',
  description: 'Get sales forecast prediction for upcoming period based on historical data',
  schema: z.object({
    period: z.number().describe('Number of days to forecast'),
  }),
  func: async ({ period }) => {
    try {
      logger.info(`Getting sales forecast for next ${period} days`);
      const response = await makeRequest('GET', `/analytics/forecast?period=${period}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get sales forecast:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve sales forecast',
      });
    }
  },
});

// Export all analytics tools
export const analyticsTools = [
  getRevenueReportTool,
  getTopProductsTool,
  getCustomerSatisfactionTool,
  getConversionRateTool,
  exportReportTool,
  getSalesForecastTool,
];
