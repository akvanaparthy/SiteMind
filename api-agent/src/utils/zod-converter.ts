/**
 * Zod to JSON Schema Converter for Gemini Function Calling
 * 
 * Converts LangChain tool Zod schemas to Gemini-compatible JSON Schema format.
 * This allows reuse of existing tool definitions with the official @google/genai SDK.
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
import { DynamicStructuredTool } from '@langchain/core/tools';
import type { FunctionDeclaration } from '@google/genai';

/**
 * Convert a single LangChain DynamicStructuredTool to Gemini FunctionDeclaration
 * 
 * @param tool - LangChain tool with Zod schema
 * @returns Gemini-compatible function declaration
 */
export function langChainToolToGemini(tool: DynamicStructuredTool): FunctionDeclaration {
  // Convert Zod schema to JSON Schema
  const jsonSchema = zodToJsonSchema(tool.schema, {
    $refStrategy: 'none',  // Inline all references (no $ref pointers)
    target: 'openApi3',    // OpenAPI 3.0 format (Gemini compatible)
    definitionPath: 'definitions', // Where to place definitions
    // Remove unsupported fields
    removeAdditionalStrategy: 'strict',
  });

  // Extract properties and required fields from JSON Schema
  const schemaProperties = (jsonSchema as any).properties || {};
  const requiredFields = (jsonSchema as any).required || [];

  // Build Gemini-compatible parameter schema
  const parametersJsonSchema: any = {
    type: 'object',
    properties: schemaProperties,
  };

  // Only add required array if there are required fields
  if (requiredFields.length > 0) {
    parametersJsonSchema.required = requiredFields;
  }

  // Return Gemini function declaration
  return {
    name: tool.name,
    description: tool.description,
    parameters: parametersJsonSchema,
  };
}

/**
 * Convert all LangChain tools to Gemini function declarations
 * 
 * @param tools - Array of LangChain tools
 * @returns Array of Gemini function declarations
 */
export function allToolsToGemini(tools: DynamicStructuredTool[]): FunctionDeclaration[] {
  return tools.map(tool => {
    try {
      return langChainToolToGemini(tool);
    } catch (error) {
      console.error(`Error converting tool "${tool.name}":`, error);
      throw new Error(`Failed to convert tool "${tool.name}" to Gemini format: ${error}`);
    }
  });
}

/**
 * Validate that a tool's schema is convertible to JSON Schema
 * Useful for testing/debugging
 * 
 * @param tool - LangChain tool to validate
 * @returns True if valid, throws error otherwise
 */
export function validateToolSchema(tool: DynamicStructuredTool): boolean {
  try {
    const geminiTool = langChainToolToGemini(tool);
    
    // Basic validation
    if (!geminiTool.name || geminiTool.name.length === 0) {
      throw new Error('Tool name is required');
    }
    
    if (!geminiTool.description || geminiTool.description.length === 0) {
      throw new Error('Tool description is required');
    }
    
    if (!geminiTool.parameters || typeof geminiTool.parameters !== 'object') {
      throw new Error('Tool parameters must be an object');
    }

    const params = geminiTool.parameters as any;
    if (params.type !== 'object') {
      throw new Error('Tool parameters type must be "object"');
    }
    
    console.log(`✅ Tool "${tool.name}" is valid for Gemini`);
    return true;
  } catch (error) {
    console.error(`❌ Tool "${tool.name}" validation failed:`, error);
    throw error;
  }
}

/**
 * Get a formatted preview of how a tool will look in Gemini
 * Useful for debugging
 * 
 * @param tool - LangChain tool
 * @returns Pretty-printed JSON string
 */
export function previewGeminiTool(tool: DynamicStructuredTool): string {
  const geminiTool = langChainToolToGemini(tool);
  return JSON.stringify(geminiTool, null, 2);
}
