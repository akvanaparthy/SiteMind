# AI Agent Communication Style Guide

## Problem Identified

The agent was responding in a meta-narrative style, describing the data instead of presenting it naturally:

**Before (❌ Robotic):**
- "The response shows that there are 3 pending orders..."
- "Based on the response, the ticket has been closed..."
- "The data indicates that maintenance mode is..."

**After (✅ Natural):**
- "We have 3 pending orders that need attention..."
- "I've closed ticket #45 for Alice Johnson"
- "The site is running normally with maintenance mode disabled"

## Solution Applied

### System Prompt Update

Updated `api-agent/src/agents/claude-agent.ts` with explicit communication guidelines:

```typescript
# CRITICAL RULE: Natural Communication
When you receive data from tools, present it directly to the admin. 
DO NOT narrate or describe the data.

❌ NEVER say:
- "The response shows that..."
- "Based on the response..."
- "The data indicates..."
- "According to the result..."
- "The tool returned..."

✅ ALWAYS speak naturally:
- "We have 3 pending orders..."
- "I found 4 open tickets..."
- "The site is running normally..."
- "I've closed ticket #45..."

Think: You ARE the system. Don't describe what the system told you - 
just present the information naturally.
```

### Key Principle

**The agent should embody the system, not narrate about it.**

Instead of acting as a middleman reporting what the tools return, the agent speaks as if it IS the platform - providing information directly and naturally.

## Test Results

### Example 1: Listing Orders
**Command:** "show me all pending orders"  
**Response:** "We have 3 pending orders that need attention."

✅ Natural, conversational, direct

### Example 2: Site Status
**Command:** "what's the site status?"  
**Response:** "The site is running normally. Maintenance mode is disabled, and the cache was last cleared about 2 hours ago."

✅ Informative, professional, natural flow

### Example 3: Support Tickets
**Command:** "show me open support tickets"  
**Response:** "We have 3 open support tickets that need attention:

1. Bulk order inquiry from Jane Smith
2. Order not received from John Doe  
3. Defective headphones from John Doe

Let me know if you need me to take any action on these open tickets."

✅ Clear, organized, proactive

## Implementation Details

**File Modified:**
- `api-agent/src/agents/claude-agent.ts` - System prompt in ChatPromptTemplate

**Also Updated (for consistency):**
- `lib/system-prompt.ts` - Added communication style section with examples

**No Breaking Changes:**
- Tool implementations unchanged
- Response formatting unchanged
- API contracts unchanged
- Only affects LLM's natural language generation

## Best Practices

### ✅ Do This:
- Speak in first person when appropriate ("I've updated...", "I found...")
- Use "we have" for collective states ("We have 3 orders...")
- Present information directly and clearly
- Be conversational yet professional
- Offer next steps or ask if more help is needed

### ❌ Don't Do This:
- Narrate about the data ("The response shows...")
- Use meta-language ("According to the system...")
- Describe the tool output ("The tool returned...")
- Over-explain the process unless asked
- Be overly robotic or formal

## Future Considerations

### Temperature Setting
Currently set to `0` for consistency and predictability. Consider:
- Increasing to `0.3-0.5` for more natural variation
- Testing with different temperatures to find sweet spot

### Persona Enhancement
Potential improvements:
- Add personality traits (helpful, efficient, proactive)
- Include context-aware responses (time of day greetings)
- Customize tone based on urgency (urgent tickets vs routine queries)

### Multi-turn Conversations
- Maintain context across exchanges
- Remember previous commands in session
- Provide continuity in long interactions

## Monitoring

**What to Watch:**
- User feedback on agent responses
- Any reversion to meta-narrative language
- Consistency across different command types
- Clarity and usefulness of responses

**Success Metrics:**
- Natural-sounding responses (qualitative)
- User satisfaction with communication style
- Reduced need for response clarification
- Positive feedback in user testing

---

**Last Updated:** November 3, 2025  
**Status:** ✅ Implemented and Tested  
**Impact:** High (improved user experience across all agent interactions)
