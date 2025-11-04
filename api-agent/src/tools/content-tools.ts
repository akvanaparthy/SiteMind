/**
 * Content Management Tools
 * Tools for advanced blog post management including scheduling, SEO, and AI generation
 */

import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { makeRequest } from '../utils/api-client';
import { logger } from '../utils/logger';

/**
 * Schedule a blog post for future publishing
 */
export const schedulePostTool = new DynamicStructuredTool({
  name: 'schedule_post',
  description: 'Schedule a draft blog post to be automatically published at a specific date and time',
  schema: z.object({
    postId: z.number().describe('The ID of the post to schedule'),
    publishDate: z.string().describe('Date and time to publish (ISO 8601 format: YYYY-MM-DDTHH:mm:ss)'),
  }),
  func: async ({ postId, publishDate }) => {
    try {
      logger.info(`Scheduling post ${postId} for ${publishDate}`);
      const response = await makeRequest('POST', `/posts/${postId}/schedule`, {
        publishDate,
      });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to schedule post:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to schedule blog post',
      });
    }
  },
});

/**
 * Generate blog post content using AI
 */
export const generatePostContentTool = new DynamicStructuredTool({
  name: 'generate_post_content',
  description: 'Generate blog post content using AI based on a topic or outline. Creates title, content, and excerpt',
  schema: z.object({
    topic: z.string().describe('The topic or outline for the blog post'),
    tone: z.enum(['professional', 'casual', 'technical', 'friendly']).optional().describe('Writing tone (default: professional)'),
    length: z.enum(['short', 'medium', 'long']).optional().describe('Content length (default: medium)'),
  }),
  func: async ({ topic, tone = 'professional', length = 'medium' }) => {
    try {
      logger.info(`Generating blog post content for topic: ${topic}`);
      const response = await makeRequest('POST', '/posts/generate', {
        topic,
        tone,
        length,
      });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to generate post content:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate blog post content',
      });
    }
  },
});

/**
 * Optimize post for SEO
 */
export const optimizeSeoTool = new DynamicStructuredTool({
  name: 'optimize_seo',
  description: 'Analyze a blog post and get SEO optimization suggestions including keywords, meta descriptions, and readability',
  schema: z.object({
    postId: z.number().describe('The ID of the post to optimize'),
  }),
  func: async ({ postId }) => {
    try {
      logger.info(`Getting SEO suggestions for post ${postId}`);
      const response = await makeRequest('POST', `/posts/${postId}/seo`, {});
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to optimize SEO:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to get SEO suggestions',
      });
    }
  },
});

/**
 * Create a static page
 */
export const createPageTool = new DynamicStructuredTool({
  name: 'create_page',
  description: 'Create a static page (e.g., About Us, Terms of Service, Privacy Policy)',
  schema: z.object({
    title: z.string().describe('Page title'),
    slug: z.string().describe('URL slug (e.g., "about-us", "privacy-policy")'),
    content: z.string().describe('Page content (HTML or Markdown)'),
    template: z.enum(['default', 'full-width', 'sidebar']).optional().describe('Page template'),
  }),
  func: async ({ title, slug, content, template = 'default' }) => {
    try {
      logger.info(`Creating static page: ${title}`);
      const response = await makeRequest('POST', '/pages', {
        title,
        slug,
        content,
        template,
      });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to create page:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to create page',
      });
    }
  },
});

/**
 * Get post analytics
 */
export const getPostAnalyticsTool = new DynamicStructuredTool({
  name: 'get_post_analytics',
  description: 'Get analytics for a blog post including views, engagement, and reader metrics',
  schema: z.object({
    postId: z.number().describe('The ID of the post'),
    period: z.number().optional().describe('Number of days to analyze (default: 30)'),
  }),
  func: async ({ postId, period = 30 }) => {
    try {
      logger.info(`Getting analytics for post ${postId}`);
      const response = await makeRequest('GET', `/posts/${postId}/analytics?period=${period}`);
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to get post analytics:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve post analytics',
      });
    }
  },
});

/**
 * Bulk schedule posts
 */
export const bulkSchedulePostsTool = new DynamicStructuredTool({
  name: 'bulk_schedule_posts',
  description: 'Schedule multiple blog posts at once with specified intervals',
  schema: z.object({
    postIds: z.array(z.number()).describe('Array of post IDs to schedule'),
    startDate: z.string().describe('Start date for first post (ISO 8601 format)'),
    interval: z.number().describe('Days between each post publication'),
  }),
  func: async ({ postIds, startDate, interval }) => {
    try {
      logger.info(`Bulk scheduling ${postIds.length} posts starting ${startDate}`);
      const response = await makeRequest('POST', '/posts/bulk-schedule', {
        postIds,
        startDate,
        interval,
      });
      return JSON.stringify(response);
    } catch (error: any) {
      logger.error('Failed to bulk schedule posts:', error);
      return JSON.stringify({
        success: false,
        error: error.message || 'Failed to bulk schedule posts',
      });
    }
  },
});

// Export all content management tools
export const contentTools = [
  schedulePostTool,
  generatePostContentTool,
  optimizeSeoTool,
  createPageTool,
  getPostAnalyticsTool,
  bulkSchedulePostsTool,
];
