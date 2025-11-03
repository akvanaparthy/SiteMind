# 🚀 Quick Start Guide - SiteMind AI Agent Service

## Prerequisites
- Node.js 18+ installed
- Claude API key from [console.anthropic.com](https://console.anthropic.com/)

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd api-agent
npm install
```

### 2. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Claude API key
# CLAUDE_API_KEY=sk-ant-api03-xxxxx
```

### 3. Start the Service
```bash
npm run dev
```

You should see:
```
✨ Agent Service is ready!

📊 Status:
   - WebSocket: ws://localhost:3002/ws
   - Claude Model: claude-3-haiku-20240307
   - Next.js API: http://localhost:3000/api
   - Log Level: info
```

## Test Commands

### Test a Single Tool
```bash
npm run test:individual
```
Select a tool from the menu to test.

### Test All Tools
```bash
npm run test:tools
```

## Common Issues

### "Claude API key not configured"
**Solution:** Add your API key to `.env`:
```env
CLAUDE_API_KEY=sk-ant-api03-your-key-here
```

### "Cannot connect to Next.js API"
**Solution:** Start the Next.js backend first:
```bash
# In project root
npm run dev
```

### Port 3002 already in use
**Solution:** Change the port in `.env`:
```env
AGENT_PORT=3003
```

## Architecture Overview

```
┌─────────────────┐
│ Admin Dashboard │ (Next.js Frontend)
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│  Agent Service  │ (This service)
└────────┬────────┘
         │ Claude API
         ▼
┌─────────────────┐
│  Claude Haiku   │ (Anthropic)
└────────┬────────┘
         │ Tool Execution
         ▼
┌─────────────────┐
│  Next.js API    │ (Backend)
└────────┬────────┘
         │ Database
         ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```

## Available Tools (21)

### Blog Management (5)
- create_blog_post
- update_blog_post
- publish_blog_post
- delete_blog_post
- list_blog_posts

### Order Management (5)
- get_order
- update_order_status
- refund_order
- list_orders
- get_order_stats

### Support Tickets (3)
- create_ticket
- close_ticket
- list_tickets

### Site Control (2)
- toggle_maintenance_mode
- clear_cache

### Action Logging (6)
- create_log
- get_log
- list_logs
- update_log_status
- add_log_step
- get_recent_logs

## Example Commands

When integrated with the admin dashboard, you can send:

- "Create a blog post about AI trends in 2025"
- "Refund order #12345"
- "Close all pending tickets"
- "Show me today's orders"
- "Enable maintenance mode"

## Next Steps

1. ✅ Service is running
2. ⏭️ Start the Next.js backend (if not running)
3. ⏭️ Open admin dashboard at http://localhost:3000/admin
4. ⏭️ Test the AI agent from the console

## Documentation

- Full README: `api-agent/README.md`
- Remodel Summary: `api-agent/REMODEL_SUMMARY.md`
- Project Vision: `agents.md`

## Support

- Anthropic Docs: https://docs.anthropic.com/
- Claude API: https://console.anthropic.com/
- Issue Tracker: GitHub Issues (if configured)

---

**Ready to build! 🎉**
