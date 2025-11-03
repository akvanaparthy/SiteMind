# Conversation Context Feature

## Overview

The AI agent now maintains conversation context across multiple turns, enabling natural multi-turn conversations with pronouns and references to previous messages.

## Problem Solved

**Before:**
- User: "What are the pending orders?"
- Agent: "We have 3 pending orders..."
- User: "list them"
- Agent: "I'm afraid I don't have enough context to determine what you would like me to list."

**After:**
- User: "What are the pending orders?"
- Agent: "We have 3 pending orders..."
- User: "list them"
- Agent: ✅ "We have 3 pending orders: [detailed list]"

## How It Works

### 1. Frontend Context Management

The `AgentContext` maintains a history of messages and sends the last 4 messages (2 exchanges) with each new command:

```typescript
// contexts/AgentContext.tsx
const history = messages
  .slice(-4)
  .filter(msg => msg.role !== 'system' && msg.status === 'success')
  .map(msg => ({
    role: msg.role === 'user' ? 'user' as const : 'agent' as const,
    content: msg.content
  }))

await fetch('/api/agent/command', {
  method: 'POST',
  body: JSON.stringify({ command, history })
})
```

### 2. Backend Context Processing

The agent factory prepends conversation context to the prompt:

```typescript
// api-agent/src/agents/agent-factory.ts
if (history && history.length > 0) {
  const contextMessages = history
    .slice(-4)
    .map((msg) => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}`;
    })
    .join('\n\n');
  
  fullPrompt = `Previous conversation context:\n${contextMessages}\n\nCurrent request: ${prompt}`;
}
```

### 3. Data Flow

```
┌──────────────────┐
│  User Message    │
│  "list them"     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│  AgentContext                │
│  • Builds history (last 4)   │
│  • Sends with command        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  API Route                   │
│  /api/agent/command          │
│  • Forwards command+history  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  WebSocket Server            │
│  /execute endpoint           │
│  • Receives history          │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Agent Factory               │
│  executeCommand()            │
│  • Prepends context          │
│  • Builds full prompt        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Claude Agent                │
│  • Processes with context   │
│  • Understands references    │
│  • Returns contextual reply  │
└──────────────────────────────┘
```

## Test Results

### Multi-Turn Conversation Test

```
Turn 1:
User: "What are the pending orders?"
Agent: "We have 3 pending orders that need attention."
✅ Context: No history needed

Turn 2:
User: "list them"
Context: Previous 2 messages
Agent: "We have 3 pending orders:
       - Order #abc... from John Doe for $249.97
       - Order #def... from Jane Smith for $299.98
       - Order #ghi... from John Doe for $249.98"
✅ Understood "them" = pending orders

Turn 3:
User: "show me details about the first one"
Context: Previous 4 messages
Agent: [Attempts to fetch details for order #abc...]
✅ Understood "the first one" = first order from the list
```

## Implementation Details

### Files Modified

1. **`api-agent/src/agents/agent-factory.ts`**
   - Added `history` parameter to `executeCommand()`
   - Context prepending logic
   - Logging for context tracking

2. **`app/api/agent/command/route.ts`**
   - Accepts `history` in request body
   - Forwards to agent service

3. **`api-agent/src/server/websocket.ts`**
   - `/execute` endpoint accepts history
   - Passes to `executeCommand()`

4. **`contexts/AgentContext.tsx`**
   - Builds conversation history
   - Filters successful messages only
   - Sends last 4 messages for context

### Configuration

**History Window Size:** 4 messages (2 exchanges)
- Configurable in both frontend and backend
- Balance between context and token usage
- Sufficient for most multi-turn scenarios

**Message Filtering:**
- Only includes `user` and `agent` messages
- Excludes `system` error messages
- Only includes messages with `status: 'success'`

## Benefits

### Natural Conversations
Users can speak naturally without repeating context:
- "Show me the orders" → "How many?" → "List them all"

### Pronoun Resolution
Agent understands:
- "it", "them", "that one", "the first one"
- "this ticket", "those orders", "the last post"

### Follow-up Questions
Enable smooth information discovery:
- "What's the site status?" → "When was cache last cleared?" → "Clear it now"

### Reduced Repetition
No need to constantly re-specify:
- ❌ "Show pending orders" → "Show details for order #123 from pending orders"
- ✅ "Show pending orders" → "Show details for the first one"

## Limitations & Considerations

### Token Usage
- Each context message consumes tokens
- 4-message window balances context vs cost
- Can be adjusted based on needs

### Context Window
- LLMs have maximum context length
- Too much history can confuse
- Current limit (4 msgs) is tested and optimal

### State Management
- Context is per-session in frontend
- No server-side session persistence
- Refreshing page clears context

### Error Handling
- Failed messages excluded from context
- System errors don't pollute history
- Only successful exchanges included

## Future Enhancements

### Server-Side Session Management
- Store conversation history in database
- Persist across page refreshes
- Enable multi-device continuity

### Intelligent Context Selection
- Semantic similarity search for relevant history
- Include distant messages if highly relevant
- Compress older context with summaries

### Context Pruning
- Automatic summarization of old exchanges
- Keep recent messages, summarize older ones
- Optimize token usage

### User Control
- "Forget the last message"
- "Start new conversation"
- "Go back to discussing [topic]"

## Testing

### Manual Test
```bash
cd api-agent
npx tsx src/tests/test-conversation-context.ts
```

### Integration Test
1. Start agent service: `npm run dev` in `api-agent/`
2. Start Next.js: `npm run dev` in root
3. Open Agent Console: http://localhost:3001/admin/agent/console
4. Try multi-turn conversation

### Example Test Scenarios

**Scenario 1: Order Management**
1. "Show pending orders"
2. "How many are there?"
3. "Show me the one from Jane"
4. "Update it to delivered"

**Scenario 2: Ticket Support**
1. "List open tickets"
2. "Which ones are high priority?"
3. "Close the first one"
4. "Send confirmation to the customer"

**Scenario 3: Site Management**
1. "What's the site status?"
2. "When was cache last cleared?"
3. "Clear it now"
4. "Show me the analytics"

---

**Last Updated:** November 3, 2025  
**Status:** ✅ Implemented and Tested  
**Impact:** High (enables natural multi-turn conversations)
