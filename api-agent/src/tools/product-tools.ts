/**
 * Product Management Tools
 * Tools for managing product inventory, pricing, and availability
 */

import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { makeRequest } from '../utils/api-client';
import { logger } from '../utils/logger';

/**
 * Update product stock quantity
 */
export const updateProductStockTool = new DynamicStructuredTool({
  name: 'update_product_stock',
  description: 'Update the stock quantity for a product. Can set absolute value or adjust by relative amount',
  schema: z.object({
    productId: z.number().describe('The ID of the product'),
    quantity: z.number().describe('New stock quantity (use positive for increase, negative for decrease)'),
    mode: z.enum(['set', 'adjust']).optional().describe('Mode: "set" to set absolute value, "adjust" to add/subtract (default: set)'),
  }),
  func: async ({ productId, quantity, mode = 'set' }) => {
    try {
      logger.info(`Updating stock for product ${productId}: ${mode} ${quantity}`);
      const response = await makeRequest('PUT', `/products/${productId}/stock`, {
        quantity,
        mode,
      });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to update product stock:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to update product stock',
      });
    }
  },
});

/**
 * Update product price
 */
export const setProductPriceTool = new DynamicStructuredTool({
  name: 'set_product_price',
  description: 'Change the price of a product',
  schema: z.object({
    productId: z.number().describe('The ID of the product'),
    price: z.number().positive().describe('New price in dollars'),
  }),
  func: async ({ productId, price }) => {
    try {
      logger.info(`Setting price for product ${productId} to $${price}`);
      const response = await makeRequest('PUT', `/products/${productId}/price`, { price });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to set product price:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to set product price',
      });
    }
  },
});

/**
 * Toggle product availability
 */
export const toggleProductAvailabilityTool = new DynamicStructuredTool({
  name: 'toggle_product_availability',
  description: 'Enable or disable a product (make it visible/hidden on the store)',
  schema: z.object({
    productId: z.number().describe('The ID of the product'),
    active: z.boolean().describe('true to enable, false to disable'),
  }),
  func: async ({ productId, active }) => {
    try {
      logger.info(`Setting product ${productId} active status to ${active}`);
      const response = await makeRequest('PUT', `/products/${productId}/availability`, { active });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to toggle product availability:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to toggle product availability',
      });
    }
  },
});

/**
 * Get low stock products
 */
export const getLowStockProductsTool = new DynamicStructuredTool({
  name: 'get_low_stock_products',
  description: 'Get a list of products that are running low on stock',
  schema: z.object({
    threshold: z.number().optional().describe('Stock threshold (default: 10). Products with stock <= this value will be returned'),
  }),
  func: async ({ threshold = 10 }) => {
    try {
      logger.info(`Getting products with stock <= ${threshold}`);
      const response = await makeRequest('GET', `/products/low-stock?threshold=${threshold}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get low stock products:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve low stock products',
      });
    }
  },
});

/**
 * Create new product
 */
export const createProductTool = new DynamicStructuredTool({
  name: 'create_product',
  description: 'Add a new product to the store',
  schema: z.object({
    name: z.string().describe('Product name'),
    description: z.string().describe('Product description'),
    price: z.number().positive().describe('Product price'),
    stock: z.number().nonnegative().describe('Initial stock quantity'),
    category: z.string().optional().describe('Product category'),
    featured: z.boolean().optional().describe('Mark as featured product'),
  }),
  func: async ({ name, description, price, stock, category, featured }) => {
    try {
      logger.info(`Creating new product: ${name}`);
      const response = await makeRequest('POST', '/products', {
        name,
        description,
        price,
        stock,
        category,
        featured: featured || false,
        active: true,
      });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to create product:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to create product',
      });
    }
  },
});

/**
 * Bulk update products
 */
export const bulkUpdateProductsTool = new DynamicStructuredTool({
  name: 'bulk_update_products',
  description: 'Update multiple products at once (e.g., apply discount to category, adjust all stock)',
  schema: z.object({
    action: z.enum(['adjust_price', 'adjust_stock', 'set_category', 'toggle_active']).describe('Action to perform'),
    productIds: z.array(z.number()).describe('Array of product IDs to update'),
    value: z.union([z.string(), z.number(), z.boolean()]).describe('Value for the action (price multiplier, stock adjustment, category name, or boolean)'),
  }),
  func: async ({ action, productIds, value }) => {
    try {
      logger.info(`Bulk updating ${productIds.length} products: ${action}`);
      const response = await makeRequest('POST', '/products/bulk-update', {
        action,
        productIds,
        value,
      });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to bulk update products:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to bulk update products',
      });
    }
  },
});

// Export all product tools
export const productTools = [
  updateProductStockTool,
  setProductPriceTool,
  toggleProductAvailabilityTool,
  getLowStockProductsTool,
  createProductTool,
  bulkUpdateProductsTool,
];
