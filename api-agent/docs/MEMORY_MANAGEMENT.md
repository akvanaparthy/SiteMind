# Memory Management Guide

## Quick Reference

### When to Clear Memory

**Always run after:**
```bash
npm run clear-memory
```

1. ✅ Updating system prompt in `src/agents/claude-agent.ts`
2. ✅ Adding new tools
3. ✅ Changing agent behavior
4. ✅ Agent giving outdated/incorrect responses

### Why?

Pinecone stores past agent interactions as vectors. Old memories can:
- Make agent repeat old (incorrect) responses
- Prevent new behavior from taking effect
- Cause agent to remember when tools didn't exist

## Usage

```bash
cd api-agent
npm run clear-memory
```

Output:
```
🧹 Clearing Pinecone memory...
📡 Connecting to index: sitemind-agent-memory...
📂 Namespace: agent-memory
🗑️  Deleting all memory vectors...
✅ Pinecone memory cleared successfully!
```

## Technical Details

- **Location**: `src/scripts/clear-memory.ts`
- **What it does**: Deletes all vectors from the `agent-memory` namespace in Pinecone
- **Index**: `sitemind-agent-memory` (from `PINECONE_INDEX` env var)
- **Namespace**: `agent-memory` (from `PINECONE_NAMESPACE` env var)

## Best Practice Workflow

1. Make changes to agent (prompt, tools, etc.)
2. Clear memory: `npm run clear-memory`
3. Restart agent service (if running)
4. Test the changes

This ensures the agent starts with a clean slate and doesn't fall back to old behaviors.
