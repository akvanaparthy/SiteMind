/**
 * Schema Helper for Cross-Provider Compatibility
 * 
 * Ensures tool schemas work with both:
 * - ReAct agents (text-based, may send stringified JSON)
 * - Function calling agents (Gemini native, sends structured data)
 */

import { z } from 'zod';

/**
 * Parse input that may be a string or object
 * Used in tool func() to handle both provider types
 * 
 * @param input - Input from LLM (may be string JSON or object)
 * @returns Parsed object
 */
export function parseToolInput<T>(input: unknown): T {
  // If already an object, return it
  if (typeof input === 'object' && input !== null) {
    return input as T;
  }

  // If string, try to parse as JSON
  if (typeof input === 'string') {
    try {
      return JSON.parse(input) as T;
    } catch (error) {
      throw new Error(`Invalid JSON input: ${input}`);
    }
  }

  throw new Error(`Unexpected input type: ${typeof input}`);
}

/**
 * Create a schema that works with both ReAct and Function Calling
 * 
 * For ReAct: Accepts string or object, parses if needed
 * For Gemini: Pure z.object() schema without transforms
 * 
 * @param schema - The base Zod object schema
 * @returns Schema compatible with both agent types
 */
export function createCrossProviderSchema<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): z.ZodObject<T> {
  // Return the pure schema without any transforms
  // This ensures Gemini sees it as type OBJECT
  // Input parsing will be handled in the func() instead
  return schema;
}
