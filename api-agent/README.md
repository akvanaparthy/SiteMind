# SiteMind AI Agent Service

> **Claude 3 Haiku-powered AI agent for e-commerce web operations**

## Overview

The SiteMind Agent Service is a TypeScript-based AI agent that uses **Claude 3 Haiku** (Anthropic) to autonomously manage e-commerce operations including:

- 📝 Blog post creation and management
- 📦 Order processing and refunds
- 🎫 Support ticket handling
- ⚙️ Site configuration and maintenance
- 📊 Action logging and audit trails

## Architecture

```
┌─────────────────────────────────────────┐
│   Admin Dashboard (Next.js Frontend)    │
│         WebSocket Connection             │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Agent Service (WebSocket Server)     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│        Claude 3 Haiku Agent              │
│   (Anthropic Messages API + Tool Use)    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         21 Tools (5 Categories)          │
│  • Blog Tools (5)                        │
│  • Order Tools (5)                       │
│  • Ticket Tools (3)                      │
│  • Site Tools (2)                        │
│  • Log Tools (6)                         │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│      Next.js Backend API (REST)          │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│          PostgreSQL Database             │
└──────────────────────────────────────────┘
```

## Features

### ✅ Claude 3 Haiku Integration
- Native tool calling via Anthropic Messages API
- Cost-effective testing with fast response times
- Proper error handling and retry logic

### ✅ 21 Operational Tools
All tools use Zod schemas for validation:

**Blog Management:**
- `create_blog_post` - Create new blog posts
- `update_blog_post` - Update existing posts
- `publish_blog_post` - Publish draft posts
- `delete_blog_post` - Delete posts
- `list_blog_posts` - Query posts with filters

**Order Management:**
- `get_order` - Retrieve order details
- `update_order_status` - Change order status
- `refund_order` - Process refunds
- `list_orders` - Query orders with filters
- `get_order_stats` - Get order statistics

**Support Tickets:**
- `create_ticket` - Create new tickets
- `close_ticket` - Close existing tickets
- `list_tickets` - Query tickets with filters

**Site Control:**
- `toggle_maintenance_mode` - Enable/disable maintenance
- `clear_cache` - Clear site cache

**Action Logging:**
- `create_log` - Log agent actions
- `get_log` - Retrieve log entries
- `list_logs` - Query logs with filters
- `update_log_status` - Update log status
- `add_log_step` - Add sub-task steps
- `get_recent_logs` - Get recent activity

### ✅ Real-time Communication
- WebSocket server for live updates
- Push notifications to admin dashboard
- Status tracking and health monitoring

## Installation

### Prerequisites
- Node.js 18+ and npm
- Claude API key from [Anthropic Console](https://console.anthropic.com/)
- Next.js backend running on port 3000 (see main project)

### Setup

1. **Install dependencies:**
   ```bash
   cd api-agent
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` and add your Claude API key:**
   ```env
   CLAUDE_API_KEY=sk-ant-api03-...
   ```

4. **Start the service:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

The service will start on `http://localhost:3002` by default.

## Configuration

All configuration is done via environment variables in `.env`:

### Required Variables
```env
# Claude API Configuration
CLAUDE_API_KEY=your_api_key_here
CLAUDE_MODEL_NAME=claude-3-haiku-20240307
```

### Optional Variables
```env
# Agent Service
AGENT_PORT=3002
AGENT_HOST=localhost

# Claude Settings
CLAUDE_TEMPERATURE=0.0
CLAUDE_MAX_TOKENS=4096

# Backend Integration
NEXTJS_API_URL=http://localhost:3000/api

# WebSocket
WS_PATH=/ws
WS_CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Usage

### Testing Tools

Test individual tools:
```bash
npm run test:individual
```

Test all tools:
```bash
npm run test:tools
```

### Sending Commands

The agent accepts natural language commands via WebSocket:

**Example commands:**
- "Create a blog post about AI trends"
- "Refund order #12345"
- "Close ticket #67890"
- "Enable maintenance mode"
- "Show me recent orders"

## Project Structure

```
api-agent/
├── src/
│   ├── agents/
│   │   ├── agent-factory.ts      # Agent creation and routing
│   │   └── claude-agent.ts       # Claude 3 Haiku implementation
│   ├── server/
│   │   └── websocket.ts          # WebSocket server
│   ├── tools/
│   │   ├── blog-tools.ts         # Blog management (5 tools)
│   │   ├── order-tools.ts        # Order operations (5 tools)
│   │   ├── ticket-tools.ts       # Support tickets (3 tools)
│   │   ├── site-tools.ts         # Site control (2 tools)
│   │   ├── logs-tools.ts         # Action logging (6 tools)
│   │   └── index.ts              # Tool registry
│   ├── types/
│   │   └── agent.ts              # TypeScript interfaces
│   ├── utils/
│   │   ├── api-client.ts         # Next.js API integration
│   │   ├── claude-client.ts      # Anthropic SDK wrapper
│   │   ├── config.ts             # Configuration loader
│   │   ├── logger.ts             # Logging utility
│   │   └── schema-helper.ts      # Zod schema helpers
│   ├── tests/
│   │   ├── test-all-tools-manual.ts
│   │   └── test-individual-tool.ts
│   └── index.ts                  # Main entry point
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## API Integration

The agent communicates with the Next.js backend via REST API:

```typescript
// Example: Creating a blog post
POST http://localhost:3000/api/posts
{
  "action": "create",
  "title": "My Post",
  "content": "...",
  "status": "draft"
}
```

All API responses follow this format:
```typescript
{
  success: boolean;
  action: string;
  timestamp: string;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}
```

## Tool Development

To add a new tool:

1. **Define the schema in `src/tools/[category]-tools.ts`:**
   ```typescript
   import { z } from 'zod';
   
   export const myToolSchema = z.object({
     param1: z.string().describe('Description of param1'),
     param2: z.number().optional().describe('Optional param2'),
   });
   ```

2. **Implement the function:**
   ```typescript
   export async function myToolFunc(args: z.infer<typeof myToolSchema>) {
     // Call Next.js API
     return await apiClient.post('/my-endpoint', {
       action: 'my_action',
       ...args,
     });
   }
   ```

3. **Register in `src/tools/index.ts`:**
   ```typescript
   import { myToolSchema, myToolFunc } from './my-tools';
   
   export const allTools = [
     {
       name: 'my_tool',
       description: 'What this tool does',
       schema: myToolSchema,
       func: myToolFunc,
     },
     // ... other tools
   ];
   ```

Claude will automatically discover and use the new tool!

## Debugging

### Enable Debug Logging
```env
LOG_LEVEL=debug
```

### Check WebSocket Connection
```bash
# In browser console (from admin dashboard)
console.log('WS connected:', wsClient.connected);
```

### Test Claude API Directly
```bash
npm run test:individual
# Select a tool to test
```

## Troubleshooting

### "Claude API key not configured"
- Ensure `CLAUDE_API_KEY` is set in `.env`
- Verify the API key is valid at [Anthropic Console](https://console.anthropic.com/)

### "Cannot connect to Next.js API"
- Ensure the Next.js backend is running on port 3000
- Check `NEXTJS_API_URL` in `.env`

### WebSocket connection fails
- Verify `AGENT_PORT` is not in use
- Check firewall settings
- Ensure `WS_CORS_ORIGIN` matches your frontend URL

## Performance

**Claude 3 Haiku specs:**
- ⚡ Fast response times (< 3s typical)
- 💰 Cost-effective ($0.25/MTok input, $1.25/MTok output)
- 📊 200K context window
- 🎯 4096 max output tokens (configurable)

**Recommended limits for testing:**
- `CLAUDE_TEMPERATURE=0.0` (deterministic)
- `CLAUDE_MAX_TOKENS=4096` (full responses)

## License

MIT

## Support

For issues or questions, please check:
- Main project documentation: `../agents.md`
- Anthropic API docs: https://docs.anthropic.com/
- Claude models: https://www.anthropic.com/claude

---

**Built with ❤️ using Claude 3 Haiku and TypeScript**
