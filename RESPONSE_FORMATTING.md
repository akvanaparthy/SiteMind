# AI Agent Response Formatting

## Problem

Claude's LangChain integration returns responses in a structured array format:
```json
[
  {
    "index": 0,
    "type": "text",
    "text": "The actual response content..."
  }
]
```

This was being displayed as raw JSON in the frontend chat interface instead of showing the clean text.

## Solution

### 1. Backend Formatting (`api-agent/src/agents/agent-factory.ts`)

The `executeCommand` function now intelligently formats Claude's response:

```typescript
// Handle different output formats
if (typeof output === 'string') {
  formattedOutput = output;
} else if (Array.isArray(output)) {
  // Extract text from Claude's content blocks
  formattedOutput = output
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\n\n');
} else if (output && typeof output === 'object') {
  // Handle object responses
  if (output.text) {
    formattedOutput = output.text;
  } else if (output.content) {
    formattedOutput = Array.isArray(output.content)
      ? output.content.map((c: any) => c.text || JSON.stringify(c)).join('\n')
      : output.content;
  } else {
    formattedOutput = JSON.stringify(output, null, 2);
  }
} else {
  formattedOutput = String(output);
}

return {
  output: formattedOutput,      // Clean text for display
  rawOutput: output,             // Original response for debugging
  intermediateSteps: result.intermediateSteps,
};
```

### 2. Frontend Parsing (`contexts/AgentContext.tsx`)

The context handles the formatted response and provides fallback parsing:

```typescript
// Extract and format the output
let content: string
const data = result.data

if (data.output && typeof data.output === 'string') {
  content = data.output
} else if (data.output && typeof data.output === 'object') {
  // Handle array or object output
  if (Array.isArray(data.output)) {
    content = data.output
      .filter((item: any) => item.type === 'text' || item.text)
      .map((item: any) => item.text || JSON.stringify(item))
      .join('\n\n')
  } else {
    content = JSON.stringify(data.output, null, 2)
  }
} else {
  content = 'Command executed successfully'
}
```

### 3. UI Display (`app/admin/agent/console/page.tsx`)

Added a helper function to format content with JSON detection:

```typescript
function formatMessageContent(content: string): React.ReactNode {
  // Check if content looks like JSON
  if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content)
      // If it's an array of content blocks from Claude
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
        return parsed
          .filter(block => block.type === 'text')
          .map((block, idx) => <div key={idx}>{block.text}</div>)
      }
      // Otherwise show formatted JSON
      return <pre className="font-mono text-xs overflow-x-auto">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    } catch {
      // Not valid JSON, treat as regular text
    }
  }
  
  // Regular text content
  return content
}
```

## Response Flow

```
┌─────────────────────┐
│   Claude API        │
│   (LangChain)       │
└──────────┬──────────┘
           │
           │ Returns: [{ type: 'text', text: '...' }]
           ▼
┌─────────────────────┐
│ agent-factory.ts    │
│ executeCommand()    │
│                     │
│ • Detects format    │
│ • Extracts text     │
│ • Returns clean str │
└──────────┬──────────┘
           │
           │ { output: "Clean text", rawOutput: [...] }
           ▼
┌─────────────────────┐
│ /api/agent/command  │
│ (Next.js API)       │
└──────────┬──────────┘
           │
           │ { success: true, data: { output: "..." } }
           ▼
┌─────────────────────┐
│ AgentContext.tsx    │
│                     │
│ • Parses response   │
│ • Handles fallbacks │
│ • Updates messages  │
└──────────┬──────────┘
           │
           │ content: "Final display text"
           ▼
┌─────────────────────┐
│ Agent Console UI    │
│                     │
│ • Formats content   │
│ • Detects JSON      │
│ • Renders cleanly   │
└─────────────────────┘
```

## Testing

Run the response formatting test:

```bash
cd api-agent
npx tsx src/tests/test-response-format.ts
```

This will:
1. Execute several test commands
2. Show the formatted output
3. Display raw output for comparison
4. Verify proper text extraction

## Example Outputs

### Before Fix:
```json
[
  {
    "index": 0,
    "type": "text",
    "text": "The response shows that there are 3 pending orders..."
  }
]
```

### After Fix:
```
The response shows that there are 3 pending orders that need attention. The key details for each order are:

• Order ID: cmhjl... - Customer: John Doe - Items: 2 x Wireless Headphones - Total: $299.98
• Order ID: cmhjl... - Customer: Jane Smith - Items: 1 x Smart Watch - Total: $199.99
• Order ID: cmhjl... - Customer: Bob Wilson - Items: 3 x USB Cables - Total: $29.97

This provides a good overview of the pending orders.
```

## Benefits

1. **Clean UI**: Users see natural text responses, not JSON structures
2. **Debugging**: Raw output preserved in `rawOutput` field
3. **Robust**: Multiple fallback parsing strategies
4. **Flexible**: Handles strings, arrays, objects, and complex structures
5. **Type-safe**: TypeScript ensures proper handling at each layer

## Edge Cases Handled

- ✅ Claude content blocks (array of { type, text })
- ✅ Plain string responses
- ✅ Nested object structures
- ✅ Empty or null responses
- ✅ Tool execution results
- ✅ Error messages
- ✅ Multi-line formatted text
- ✅ JSON data responses

---

**Last Updated**: November 3, 2025  
**Status**: ✅ Implemented and Tested
