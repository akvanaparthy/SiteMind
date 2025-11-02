# SiteMind: Project Vision & Core Principles

**Last Updated:** November 2, 2025  
**Status:** Phase 1 (Backend & Agent) - 90% Complete

---

## 🎯 WHAT ARE WE BUILDING?

**SiteMind** is an **AI-native e-commerce platform** where an AI agent is a **first-class citizen** that can autonomously manage:
- Blog posts (create, update, publish, trash)
- Support tickets (create, close, prioritize, assign)
- Orders (query, update status, refund, notify customers)
- Site settings (maintenance mode, cache, analytics)

**This is NOT:**
- ❌ A basic e-commerce store with AI chatbot add-on
- ❌ A WordPress clone with automation scripts
- ❌ A dashboard that just displays data

**This IS:**
- ✅ An AI web operations platform where the agent can **execute real actions**
- ✅ A system where **every operation is logged and auditable**
- ✅ A WordPress-meets-modern-SaaS admin experience (Linear, Vercel, Notion vibes)
- ✅ A production-ready system where admins **watch the AI work in real-time**

---

## 🧠 WHY THIS ARCHITECTURE?

### Core Philosophy: AI-First Operations

Traditional platforms: `User → UI → Action → Database`  
**SiteMind:** `User → AI Agent → Tools → Next.js API → Database`

**Benefits:**
1. **Natural language control**: "Refund order #456 due to defect" instead of clicking through 5 screens
2. **Intelligent decision-making**: Agent can query data, analyze, and suggest actions
3. **Audit trail**: Every agent action is logged with reasoning steps
4. **Safety**: Critical operations (refunds, maintenance mode) require human approval

---

## 📐 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN DASHBOARD (Next.js)                 │
│  - Real-time agent activity feed (WebSocket)                │
│  - Admin approval UI (refunds, maintenance mode)            │
│  - Traditional CRUD interfaces (orders, tickets, posts)     │
└─────────────────────────────────────┬───────────────────────┘
                                      │
                            WebSocket (bidirectional)
                                      │
┌─────────────────────────────────────┴───────────────────────┐
│              AI AGENT SERVICE (Node.js/TypeScript)          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Agent Factory (routes by LLM provider)             │   │
│  │    ↓                  ↓                  ↓           │   │
│  │  ReAct Agent    LMStudio FC      Gemini Native      │   │
│  │  (Qwen/Llama)   (OpenAI API)     (@google/genai)    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         21 TOOLS (LangChain DynamicStructuredTool)  │   │
│  │  • Blog: 5 tools (create, update, publish, etc.)    │   │
│  │  • Tickets: 5 tools (get, close, assign, etc.)      │   │
│  │  • Orders: 5 tools (get, refund, notify, etc.)      │   │
│  │  • Site: 4 tools (status, analytics, cache, etc.)   │   │
│  │  • Logs: 2 tools (query logs, get stats)            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────┬───────────────────────┘
                                      │
                               HTTP REST API
                                      │
┌─────────────────────────────────────┴───────────────────────┐
│           NEXT.JS API ROUTES (Backend)                      │
│  • /api/orders    (CRUD + refund + notify)                  │
│  • /api/posts     (CRUD + publish + trash)                  │
│  • /api/tickets   (CRUD + close + assign)                   │
│  • /api/site      (status, analytics, maintenance)          │
│  • /api/logs      (agent activity logs)                     │
└─────────────────────────────────────┬───────────────────────┘
                                      │
                                 Prisma ORM
                                      │
┌─────────────────────────────────────┴───────────────────────┐
│              POSTGRESQL DATABASE                            │
│  • Users, Orders, Products, Tickets, Posts                  │
│  • SiteConfig (maintenance mode, cache timestamp)           │
│  • AgentLog (hierarchical task logs with parent/child)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 KEY DESIGN DECISIONS

### 1. Primary Agent Architecture
**Current Mode:** LMStudio Function Calling (`lmstudio-fc`) with Qwen Coder 32B

**Why LMStudio FC?**
- ✅ Local execution (privacy, zero API costs)
- ✅ OpenAI-compatible function calling (structured tool invocation)
- ✅ Qwen Coder 32B optimized for code/structured tasks
- ✅ 85%+ tool success rate (better than ReAct's 75%)

**Alternative Modes (Available but not primary):**
- **ReAct Agent** (`lmstudio`): Text-based reasoning (lower success rate, backup mode)
- **Gemini Native** (`gemini`): Paused due to API rate limiting issues

**Decision:** Focus on perfecting LMStudio FC mode first. Other modes remain available for future comparison/testing.

### 2. Next.js Backend as "Source of Truth"
**Agent tools don't access DB directly.** They call Next.js API routes.

**Why?**
- ✅ Single source of truth for business logic
- ✅ Validation, error handling, logging in one place
- ✅ Frontend and agent share same API
- ✅ Easy to add authentication/authorization later
- ✅ Can replace agent implementation without touching backend

### 3. Hierarchical Agent Logging
Every agent action creates an `AgentLog` with:
- **Task description** (human-readable)
- **Status** (pending, success, failed)
- **Details** (array of sub-steps with timestamps)
- **Parent/child relationships** (for multi-step operations)

**Why?** 
- Admins can see **exactly** what the agent did and why
- Debugging is trivial (full execution trace)
- Builds trust (transparency = accountability)

### 4. Approval Workflow for Critical Operations
Refunds and maintenance mode **require approval**.

**Flow:**
1. User: "Refund order #456" (in agent chat)
2. Agent: Calls `generateRefundApprovalRequest()` → returns `approvalId`
3. Agent: Returns `status: 'pending_approval'` with approval details
4. Frontend: Displays approval request in chat with "Approve" / "Deny" buttons
5. Admin: Clicks "Approve" (no timeout - approval persists until decision)
6. Frontend: Sends approval decision to agent
7. Agent: (If approved) Calls `processRefund(orderId, reason, approvalId)`

**Design Notes:**
- ✅ Approval UI appears **inline in chat** (not separate modal)
- ✅ No timeout - approval requests remain until explicitly approved/denied
- ✅ Admin can override/cancel actions in progress via chat commands
- ✅ All approvals logged with admin's decision

**Why?**
- ✅ Prevents accidental/malicious actions
- ✅ Human-in-the-loop for financial operations
- ✅ Compliance-friendly (audit trail)

---

## 🛠 TECH STACK RATIONALE

| Technology | Why This Choice? |
|------------|------------------|
| **Next.js 15** | App Router, Server Actions, API Routes, SSR, SSG - everything in one framework |
| **TypeScript** | Type safety prevents 90% of bugs. Non-negotiable for production systems. |
| **Prisma** | Best-in-class ORM for TypeScript. Type-safe queries, migrations, schema management. |
| **PostgreSQL** | Rock-solid relational DB. JSON support for flexible fields (order items, log details). |
| **LangChain** | Industry-standard AI framework. Tool abstraction works across all LLM providers. |
| **LangGraph** | Stateful workflows (future: multi-step agent planning, human-in-the-loop). |
| **Tailwind CSS** | Utility-first CSS for rapid UI development. Consistent design tokens. |
| **Framer Motion** | Best-in-class animations for React. Smooth, performant, declarative. |
| **WebSockets** | Real-time agent activity feed. Admins see AI work live. |
| **Docker** | Consistent dev environment. Easy PostgreSQL setup. |

---

## 🚀 PROJECT PHASES

### 🔄 Phase 1: Backend & Agent (85% Complete - CURRENT FOCUS)
**Goal:** Build and validate all backend operations before frontend

**Completed:**
- ✅ PostgreSQL schema (9 models, 5 enums)
- ✅ Prisma migrations + seed data
- ✅ Next.js API routes (orders, posts, tickets, site, logs)
- ✅ Action functions with logging (`lib/actions/`)
- ✅ 21 LangChain tools (blog, tickets, orders, site, logs)
- ✅ LMStudio Function Calling agent (primary mode)
- ✅ WebSocket server for real-time communication
- ✅ Cross-provider tool compatibility (100% schemas fixed)
- ✅ Agent configuration set to LMStudio FC + Qwen Coder 32B

**Critical Tasks Remaining:**
1. 🎯 **Comprehensive Tool Testing** (all 21 tools with real commands)
2. 🎯 **Agent Response Validation** (ensure 100% valid JSON)
3. 🎯 **Approval Workflow Testing** (refund + maintenance mode)
4. 🎯 **Error Handling Validation** (agent gracefully handles failures)
5. 🎯 **WebSocket Stability Testing** (reconnection, message delivery)
6. 🎯 **Documentation Update** (success rates, known issues)

**Not a Priority:**
- ❌ Gemini Native Agent (paused due to API rate limits)
- ❌ ReAct Agent improvements (backup mode, not primary)

### 📋 Phase 2: Frontend (Admin Dashboard) - Not Started (NEXT PRIORITY)
**Goal:** Build WordPress-like admin UI with real-time agent monitoring

**Planned:**
- Admin layout with sidebar navigation (desktop-first, mobile-responsive later)
- Dashboard home (stats cards, mini charts, agent status)
- Orders page (table, filters, modal details, refund UI)
- Blog posts page (table, rich editor, AI generation button)
- Support tickets page (table, filters, close/assign actions)
- Site settings page (maintenance mode toggle, cache clear)
- **🔥 Agent Console** (chat interface, send commands, inline approval buttons)
- **🔥 Agent Logs** (expandable task timeline, live auto-refresh via WebSocket)

**Design Decisions:**
- Desktop-first (mobile responsive later)
- No conversation history persistence (in-memory only for now)
- Agent logs refresh live (not on interval, triggered by WebSocket events)
- All admins see same agent session (single admin for now)

**Third-Party Integrations:**
- Payment gateway: Mock (Stripe/PayPal later)
- Email notifications: Mock (SendGrid/Resend later)
- Blog generation: Same LLM (Qwen Coder 32B)

### 📋 Phase 3: Public Storefront - Not Started
**Goal:** Customer-facing e-commerce and blog

**Planned:**
- Homepage (hero, featured products, latest posts)
- Product listing + detail pages
- Shopping cart + checkout (mock payment)
- Blog listing + article pages
- Customer account (order history, support tickets)

### 📋 Phase 4: Advanced Features - Future
- Pinecone vector memory (agent remembers past interactions)
- Multi-agent workflows (e.g., blog writer + editor + publisher)
- A/B testing (agent-optimized content)
- Analytics dashboard (agent performance metrics)

---

## 🎨 DESIGN PRINCIPLES (Admin Dashboard)

### Visual Style
- **Modern SaaS**: Linear, Notion, Vercel vibes
- **Glassmorphism**: Subtle transparency, backdrop blur
- **Smooth animations**: Framer Motion for all state changes
- **Color palette**: 
  - Background: `slate-900`, `slate-800`
  - Primary: `indigo-600`, `indigo-500`
  - Success: `emerald-500`
  - Error: `rose-500`
  - Warning: `amber-500`

### Interaction Patterns
- **Micro-interactions**: Hover effects, loading states, success animations
- **Optimistic updates**: UI responds immediately, rollback on error
- **Toast notifications**: Non-intrusive feedback (top-right corner)
- **Keyboard shortcuts**: Power-user features (Cmd+K for command palette)

### Agent-Specific UI
- **Agent status badge**: 🟢 Active / 🔴 Offline (always visible)
- **Real-time activity feed**: WebSocket updates, smooth scroll to new items
- **Expandable logs**: Accordion UI, color-coded status (green/red/yellow)
- **Approval modals**: Big "Approve" / "Deny" buttons with context

---

## 🔒 SECURITY & SAFETY

### Agent Safety Mechanisms
1. **Input validation**: All tool schemas validated with Zod
2. **Approval workflow**: Refunds, maintenance mode require human approval
3. **Rate limiting**: Prevent agent from spamming API (future)
4. **Audit logging**: Every action logged with agent name, timestamp, details
5. **Rollback capability**: Failed operations don't leave partial state

### Authentication (Future)
- NextAuth.js for admin login
- Role-based access control (USER, ADMIN, AI_AGENT)
- API key authentication for agent service

---

## 📊 SUCCESS METRICS

### Technical Metrics (LMStudio FC with Qwen Coder 32B)
- 🎯 Tool success rate: **90%+** (target for production readiness)
- 🎯 Average response time: **< 5 seconds** per command
- 🎯 WebSocket latency: **< 100ms**
- 🎯 Database query time: **< 50ms** (95th percentile)
- 🎯 Agent response format: **100% valid JSON** (critical for frontend parsing)

### User Experience Metrics
- 🎯 Admin can complete 80% of tasks via AI commands (not UI clicks)
- 🎯 Agent actions are auditable within 30 seconds (via live logs page)
- 🎯 Approval workflow takes < 15 seconds to process
- 🎯 Zero unintended actions (all critical ops require approval)

### Current Status (Phase 1)
- ✅ Backend API: 100% complete (all CRUD operations working)
- ✅ 21 Tools: 100% implemented (all calling Next.js API correctly)
- 🔄 Agent: 85% (LMStudio FC working, needs comprehensive testing)
- ⏳ Frontend: 0% (Phase 2 - not started)

---

## 🤝 COLLABORATION PRINCIPLES

### Development Workflow (Per copilot-instructions.md)
1. **Backend first**: Build and test all actions before frontend
2. **Manual testing**: Test each action independently
3. **AI agent testing**: Verify agent can invoke actions correctly
4. **Frontend last**: Only after backend is stable

### Code Quality Standards
- ✅ TypeScript strict mode (no `any` unless absolutely necessary)
- ✅ Error handling in every function (try/catch, meaningful errors)
- ✅ Logging at key decision points (agent actions, API calls, errors)
- ✅ Comments explain **why**, not **what**
- ✅ Function names are descriptive (`generateRefundApprovalRequest`, not `refund`)

### Documentation Standards
- ✅ Every action function has JSDoc with `@param`, `@returns`, `@example`
- ✅ Every tool has clear `name`, `description`, and `schema`
- ✅ README exists in each major folder (api-agent/docs, lib/actions, etc.)
- ✅ This vision document is **the source of truth**

---

## 🚨 CRITICAL REMINDERS

### Before Implementing AI Agent Features:
**YOU ASKED ME TO REMIND YOU:**

> "Before implementing the Agent, AI or anything related to it, Remind me with the phrase: **'You asked me to remind about AI whether we shall provide the LLM the knowledge about the actions, tool calls for the actions so that it can respond properly'**"

**Why this matters:**
- The LLM must understand available tools and expected JSON response format
- System prompt (`lib/system-prompt.ts`) defines behavior and schemas
- Agent schemas (`lib/agent-schemas.ts`) define response validation
- Tool schemas (in `api-agent/src/tools/`) define input validation

**Action:** Always review these 3 files before changing agent behavior.

---

## 📝 KNOWLEDGE BASE USAGE

### When to Reference This Document
- ❓ **Lost context?** Read "What Are We Building?" section
- ❓ **Forgot architecture?** See "System Architecture" diagram
- ❓ **Why did we choose X?** Check "Tech Stack Rationale"
- ❓ **What's next?** See "Project Phases" section
- ❓ **Design question?** Reference "Design Principles"

### Companion Document
📋 **IMPLEMENTATION_CHECKLIST.md** - Step-by-step execution plan

---

## 🎯 THE ULTIMATE GOAL

**When SiteMind is complete:**

An admin should be able to:
1. Open the dashboard
2. Type: *"Show me all high-priority tickets and close any that are older than 30 days"*
3. Watch the agent:
   - Query tickets
   - Filter by priority and date
   - Close each one with resolution note
   - Send customer notifications
   - Log every action
4. See a summary: *"Closed 5 tickets (IDs: 12, 34, 56, 78, 90). Customers notified."*
5. Click "Agent Logs" to audit the exact steps taken

**This is what "AI-native platform" means.**

---

**Remember:** This document represents the **vision**. The checklist represents the **execution**. Both must stay in sync.

Last updated: November 2, 2025
