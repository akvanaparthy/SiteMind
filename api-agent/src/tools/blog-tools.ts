/**
 * LangChain Tools for Blog Management
 * Wraps blog API actions as DynamicStructuredTool
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { blogAPI } from '../utils/api-client';
import { logger } from '../utils/logger';
import { parseToolInput } from '../utils/schema-helper';

/**
 * Create a new blog post
 */
export const createBlogPostTool = new DynamicStructuredTool({
  name: 'create_blog_post',
  description: `Create a new blog post with title, content, and optional excerpt.
  
Returns JSON response:
{
  "success": true,
  "action": "createBlogPost",
  "message": "Blog post created successfully",
  "data": {
    "post": { "id": 1, "title": "...", "slug": "...", "status": "DRAFT", ... }
  },
  "logId": 123
}`,
  schema: z.object({
    title: z.string().describe('The blog post title'),
    content: z.string().describe('The full blog post content'),
    excerpt: z.string().optional().describe('Optional short excerpt/summary'),
    authorId: z.coerce.number().optional().default(5).describe('ID of the author user (defaults to 5 - Admin)'),
  }),
  func: async (input) => {
    try {
      // Parse input (handles both string JSON and object)
      const parsed = parseToolInput<{
        title: string;
        content: string;
        excerpt?: string;
        authorId?: number;
      }>(input);
      
      logger.debug('Tool: create_blog_post', parsed);
      // Ensure authorId has a default value
      const createData = {
        title: parsed.title,
        content: parsed.content,
        excerpt: parsed.excerpt,
        authorId: parsed.authorId ?? 1, // Default to author ID 1 if not provided
      };
      const result = await blogAPI.create(createData);
      logger.info('Tool: create_blog_post - Success', { postId: result.data?.post?.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: create_blog_post - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'createBlogPost',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Update an existing blog post
 */
export const updateBlogPostTool = new DynamicStructuredTool({
  name: 'update_blog_post',
  description: `Update an existing blog post's title, content, or excerpt.
  
Returns JSON response:
{
  "success": true,
  "action": "updateBlogPost",
  "message": "Blog post updated successfully",
  "data": {
    "post": { "id": 1, "title": "...", "updatedAt": "...", ... }
  },
  "logId": 124
}`,
  schema: z.object({
    id: z.coerce.number().describe('ID of the blog post to update'),
    title: z.string().optional().describe('New title'),
    content: z.string().optional().describe('New content'),
    excerpt: z.string().optional().describe('New excerpt'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number; title?: string; content?: string; excerpt?: string}>(input);
      logger.debug('Tool: update_blog_post', parsed);
      const result = await blogAPI.update(parsed);
      logger.info('Tool: update_blog_post - Success', { postId: parsed.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: update_blog_post - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'updateBlogPost',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Publish a blog post
 */
export const publishBlogPostTool = new DynamicStructuredTool({
  name: 'publish_blog_post',
  description: `Publish a blog post by changing its status from DRAFT to PUBLISHED.
  
Returns JSON response:
{
  "success": true,
  "action": "publishBlogPost",
  "message": "Blog post published successfully",
  "data": {
    "post": { "id": 1, "status": "PUBLISHED", "slug": "...", ... }
  },
  "logId": 125
}`,
  schema: z.object({
    id: z.coerce.number().describe('ID of the blog post to publish'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number}>(input);
      logger.debug('Tool: publish_blog_post', parsed);
      const result = await blogAPI.publish(parsed.id);
      logger.info('Tool: publish_blog_post - Success', { postId: parsed.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: publish_blog_post - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'publishBlogPost',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Trash/Delete a blog post
 */
export const trashBlogPostTool = new DynamicStructuredTool({
  name: 'delete_blog_post',
  description: `Delete or trash a blog post by ID. Use this when user says "delete", "remove", "trash", or "get rid of" a blog post.
  
Returns JSON response:
{
  "success": true,
  "action": "trashBlogPost",
  "message": "Blog post moved to trash",
  "data": {
    "post": { "id": 1, "status": "TRASHED", ... }
  },
  "logId": 126
}`,
  schema: z.object({
    id: z.coerce.number().describe('ID of the blog post to delete/trash'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number}>(input);
      logger.debug('Tool: delete_blog_post', parsed);
      const result = await blogAPI.trash(parsed.id);
      logger.info('Tool: delete_blog_post - Success', { postId: parsed.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: delete_blog_post - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'trashBlogPost',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Get a blog post by ID
 */
export const getBlogPostTool = new DynamicStructuredTool({
  name: 'get_blog_post',
  description: `Retrieve a blog post by its ID.
  
Returns JSON response:
{
  "success": true,
  "action": "getBlogPost",
  "message": "Blog post retrieved successfully",
  "data": {
    "post": { "id": 1, "title": "...", "content": "...", "status": "...", ... }
  },
  "logId": 127
}`,
  schema: z.object({
    id: z.coerce.number().describe('ID of the blog post to retrieve'),
  }),
  func: async (input) => {
    try {
      const parsed = parseToolInput<{id: number}>(input);
      logger.debug('Tool: get_blog_post', parsed);
      const result = await blogAPI.get(parsed.id);
      logger.info('Tool: get_blog_post - Success', { postId: parsed.id });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      logger.error('Tool: get_blog_post - Failed', error);
      return JSON.stringify({
        success: false,
        action: 'getBlogPost',
        error: {
          code: 'TOOL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },
});

/**
 * Export all blog tools
 */
export const blogTools = [
  createBlogPostTool,
  updateBlogPostTool,
  publishBlogPostTool,
  trashBlogPostTool,
  getBlogPostTool,
];
