# 🚀 SiteMind Startup Guide

Complete guide to start and run the SiteMind AI Agent platform.

---

## 📋 Prerequisites

### Required Software
- **Node.js**: v20.17.0 or later
- **PostgreSQL**: v14 or later
- **npm**: v10 or later

### Required API Keys
- **Anthropic API Key**: Get from https://console.anthropic.com/
- **Pinecone API Key** (optional): Get from https://www.pinecone.io/

---

## 🔧 Initial Setup (First Time Only)

### 1. Install Dependencies

```powershell
# Install root project dependencies
cd C:\Disk\Projs\SiteMind
npm install

# Install agent service dependencies
cd api-agent
npm install
```

### 2. Setup Database

```powershell
# Create PostgreSQL database
# Using psql or pgAdmin, create database named 'sitemind'

# From root directory
cd C:\Disk\Projs\SiteMind

# Create .env.local file with database URL
echo DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/sitemind > .env.local

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:push

# Seed database with test data
npm run db:seed
```

### 3. Configure Agent Service

```powershell
cd C:\Disk\Projs\SiteMind\api-agent

# .env file should already exist with these settings:
# ANTHROPIC_API_KEY=your_key_here
# NEXTJS_API_URL=http://localhost:3000/api
# NEXTJS_API_TIMEOUT=30000

# Verify your Anthropic API key is set
notepad .env
```

**Important**: Make sure `ANTHROPIC_API_KEY` is set in `api-agent/.env`

---

## 🎯 Starting the Platform (Every Time)

### Option A: Manual Start (Recommended for Development)

#### Terminal 1: Start Next.js Backend
```powershell
cd C:\Disk\Projs\SiteMind
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.5.6
- Local:        http://localhost:3001
- Network:      http://192.168.x.x:3001

✓ Ready in 2.3s
```

**Note**: Next.js is configured to always run on port **3001** to avoid conflicts.

#### Terminal 2: Start Agent Service
```powershell
cd C:\Disk\Projs\SiteMind\api-agent
npm run dev
```

**Expected Output:**
```
🚀 Starting SiteMind Agent Service...
📋 Loading configuration...
✅ Configuration loaded
🌐 Starting WebSocket server...
✅ WebSocket server running

✨ Agent Service is ready!

📊 Status:
   - WebSocket: ws://localhost:3002/ws
   - Claude Model: claude-3-haiku-20240307
   - Next.js API: http://localhost:3001/api
   - Log Level: info
```

#### Terminal 3: Run Tests (Optional)
```powershell
cd C:\Disk\Projs\SiteMind\api-agent
npm run test:tools
```

### Option B: Using npm-run-all (Parallel Start)

```powershell
# Install npm-run-all globally (first time only)
npm install -g npm-run-all

# From root directory, add to package.json scripts:
# "dev:all": "npm-run-all --parallel dev dev:agent"
# "dev:agent": "cd api-agent && npm run dev"

# Then start everything:
npm run dev:all
```

---

## ✅ Verification Checklist

After starting both services, verify:

### 1. Next.js Backend Running
```powershell
# Test blog API
curl http://localhost:3001/api/posts?type=get&id=1

# Should return: {"success": false, "error": "Post not found"} (if no data seeded yet)
# OR: {"success": true, "action": "getBlogPost", "data": {...}}
```

### 2. Agent Service Running
```powershell
# Check logs in Terminal 2
# Should show: "✨ Agent Service is ready!"
```

### 3. Test Single Tool
```powershell
cd C:\Disk\Projs\SiteMind\api-agent
npx tsx src/tests/test-single-tool.ts get_site_status "What is the site status?"
```

**Expected**: Agent calls `get_site_status` tool and returns site information.

### 4. Interactive Tool Testing
```powershell
cd C:\Disk\Projs\SiteMind\api-agent
npx tsx src/tests/test-interactive.ts
```

Review each tool one by one.

---

## 🐛 Troubleshooting

### Issue: "Port 3000 is already in use"

**This should no longer happen!** Next.js is configured to always use port **3001**.

If you still see port conflicts:
```powershell
# Find what's using port 3001
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess

# Kill it if needed
Stop-Process -Id <PROCESS_ID> -Force
```

### Issue: "Cannot find module '@langchain/anthropic'"

**Solution**:
```powershell
cd C:\Disk\Projs\SiteMind\api-agent
npm install @langchain/anthropic@latest
```

### Issue: "EPERM: operation not permitted, open '.next/trace'"

**Solution**:
```powershell
# Close all Node processes
Get-Process node | Stop-Process -Force

# Delete .next folder
cd C:\Disk\Projs\SiteMind
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

### Issue: "Prisma Client not generated"

**Solution**:
```powershell
cd C:\Disk\Projs\SiteMind
npm run db:generate
```

### Issue: "Database connection failed"

**Solution**:
```powershell
# Verify PostgreSQL is running
Get-Service postgresql*

# Test connection
psql -U postgres -d sitemind -c "SELECT 1"

# Check DATABASE_URL in .env.local
echo $env:DATABASE_URL
```

### Issue: "All tool calls timing out"

**Causes**:
1. Next.js backend not running
2. Wrong port in api-agent/.env
3. Firewall blocking localhost

**Solution**:
```powershell
# Check if Next.js is responding
curl http://localhost:3001/api/site?type=status

# Verify port in api-agent/.env is set to 3001
notepad api-agent\.env
# NEXTJS_API_URL should be: http://localhost:3001/api
```

### Issue: "fetch failed" errors

**Solution**:
```powershell
# 1. Check if Next.js is running
curl http://localhost:3001

# 2. Check Windows Firewall
# Allow Node.js through firewall

# 3. Try using 127.0.0.1 instead of localhost
# In api-agent/.env:
NEXTJS_API_URL=http://127.0.0.1:3001/api
```

---

## 📊 Testing the Platform

### Quick Health Check
```powershell
# Terminal 1: Next.js should be running on port 3001
curl http://localhost:3001/api/site?type=status

# Terminal 2: Agent service should show "ready"
# Check logs in terminal
```

### Test Individual Tool
```powershell
cd C:\Disk\Projs\SiteMind\api-agent
npx tsx src/tests/test-single-tool.ts get_site_status "Show site status"
```

### Test All 21 Tools (Interactive)
```powershell
cd C:\Disk\Projs\SiteMind\api-agent
npx tsx src/tests/test-interactive.ts

# Review each tool:
# - [p]ass: Tool worked correctly
# - [f]ail: Tool failed
# - [s]kip: Skip this test
# - [r]epeat: Run again
# - [q]uit: Stop testing
```

### Test All Tools (Automated)
```powershell
cd C:\Disk\Projs\SiteMind\api-agent
npm run test:tools
```

---

## 📱 Access Points

Once everything is running:

### Next.js Application
- **Frontend**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3001/admin
- **API**: http://localhost:3001/api

### Agent Service
- **WebSocket**: ws://localhost:3002/ws
- **Logs**: Terminal 2 (agent service terminal)

### Database
- **Prisma Studio**: 
  ```powershell
  npm run db:studio
  ```
  Opens at http://localhost:5555

---

## 🔄 Daily Development Workflow

### Starting Your Day
```powershell
# Terminal 1
cd C:\Disk\Projs\SiteMind
npm run dev

# Terminal 2
cd C:\Disk\Projs\SiteMind\api-agent
npm run dev

# Terminal 3 (for testing/commands)
cd C:\Disk\Projs\SiteMind\api-agent
```

### Making Changes

#### Backend Changes (Next.js API Routes)
- Edit files in `app/api/`
- Next.js hot-reloads automatically
- Test with curl or browser

#### Agent Changes (Tools, Prompts)
- Edit files in `api-agent/src/`
- Agent service hot-reloads with tsx watch
- Test with interactive tool tester

#### Database Changes
```powershell
# 1. Edit prisma/schema.prisma
# 2. Generate migration
npm run db:migrate

# 3. Update Prisma client
npm run db:generate
```

### Ending Your Day
```powershell
# Ctrl+C in each terminal to stop services
# Or close terminals
```

---

## 📦 Production Deployment

### Build for Production
```powershell
# Build Next.js
cd C:\Disk\Projs\SiteMind
npm run build

# Build Agent Service
cd api-agent
npm run build
```

### Run Production
```powershell
# Start Next.js
npm start

# Start Agent Service
cd api-agent
npm start
```

### Environment Variables (Production)
```bash
# .env.production
DATABASE_URL=postgresql://user:pass@prod-db:5432/sitemind
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXTJS_API_URL=https://your-domain.com/api
NODE_ENV=production
```

---

## 🎓 Quick Command Reference

```powershell
# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to DB
npm run db:migrate      # Create migration
npm run db:seed         # Seed test data
npm run db:studio       # Open Prisma Studio

# Development
npm run dev             # Start Next.js (root)
npm run dev             # Start Agent (api-agent/)
npm run lint            # Lint code

# Testing
npm run test:tools      # Test all tools (api-agent/)
npm run test:individual # Test one tool (api-agent/)

# Production
npm run build           # Build Next.js
npm start               # Start production server
```

---

## 📝 Notes

### Port Configuration
- **Next.js**: **3001** (fixed, no conflicts!)
- **Agent Service**: 3002
- **Prisma Studio**: 5555
- **PostgreSQL**: 5432

### File Locations
- **Next.js Config**: `.env.local` (root)
- **Agent Config**: `api-agent/.env`
- **Database Schema**: `prisma/schema.prisma`
- **API Routes**: `app/api/*/route.ts`
- **Agent Tools**: `api-agent/src/tools/*.ts`

### Important URLs
- Anthropic Console: https://console.anthropic.com/
- Claude Model: claude-3-haiku-20240307
- Cost: $0.25/MTok input, $1.25/MTok output

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Both terminals show no errors
2. ✅ curl http://localhost:3000/api/site?type=status returns JSON
3. ✅ Interactive test successfully calls tools
4. ✅ Agent logs show "✨ Agent Service is ready!"
5. ✅ WebSocket connection shows connected clients

---

## 🆘 Getting Help

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Review `FIXES_APPLIED.md` for known issues
3. Check agent logs in Terminal 2
4. Test API directly with curl
5. Verify all prerequisites are installed

---

**Last Updated**: November 3, 2025  
**Platform Version**: 1.0.0  
**Claude Model**: claude-3-haiku-20240307
