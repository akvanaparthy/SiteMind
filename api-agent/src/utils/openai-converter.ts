/**
 * OpenAI Tool Converter
 * 
 * Converts LangChain DynamicStructuredTool schemas to OpenAI function calling format.
 * Used for LMStudio function calling agent (OpenAI-compatible API).
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

/**
 * OpenAI Function Calling Format
 */
export interface OpenAIFunction {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
      additionalProperties?: boolean;
    };
  };
}

/**
 * Convert a single LangChain tool to OpenAI function format
 */
export function langChainToolToOpenAI(tool: DynamicStructuredTool<any>): OpenAIFunction {
  // Convert Zod schema to JSON Schema
  const jsonSchema = zodToJsonSchema(tool.schema, {
    target: 'openApi3',
    $refStrategy: 'none',
  });

  // Extract properties and required fields
  const properties = (jsonSchema as any).properties || {};
  const required = (jsonSchema as any).required || [];

  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties,
        required,
        additionalProperties: false,
      },
    },
  };
}

/**
 * Convert all LangChain tools to OpenAI function format
 */
export function allToolsToOpenAI(tools: DynamicStructuredTool<any>[]): OpenAIFunction[] {
  return tools.map((tool) => langChainToolToOpenAI(tool));
}

/**
 * Validate that a tool has been properly converted
 */
export function validateOpenAIFunction(func: OpenAIFunction): boolean {
  try {
    // Check required fields
    if (!func.type || func.type !== 'function') return false;
    if (!func.function.name || typeof func.function.name !== 'string') return false;
    if (!func.function.description || typeof func.function.description !== 'string') return false;
    if (!func.function.parameters || typeof func.function.parameters !== 'object') return false;
    if (func.function.parameters.type !== 'object') return false;
    if (!func.function.parameters.properties) return false;
    if (!Array.isArray(func.function.parameters.required)) return false;

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Preview OpenAI function for debugging
 */
export function previewOpenAIFunction(func: OpenAIFunction): void {
  console.log('\n=== OpenAI Function ===');
  console.log(`Name: ${func.function.name}`);
  console.log(`Description: ${func.function.description}`);
  console.log(`Parameters:`, JSON.stringify(func.function.parameters, null, 2));
  console.log('======================\n');
}
