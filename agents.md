# Prompt: Build an AI-Native E-Commerce Platform with WordPress-Like Admin Dashboard

## Vision

Create a full-stack e-commerce + blog platform where **every operation is monitored and executable by an AI agent**. The admin dashboard must feel like **WordPress meets modern SaaS** (e.g., Vercel, Linear) — rich, intuitive, and powerful.

This is **not a basic store**. It’s an **AI-native web ops platform** where:

- The **AI agent is first-class citizen**
- **All actions are logged in real-time**
- Admins can **watch the agent work, audit decisions, and intervene**
- The UI is **stunning, animated, and interactive**

This project will be the centerpiece of a resume for **AI Engineer / Gen AI Engineer / Agentic AI Engineer** roles.

---

## ?? Tech Stack

| Layer             | Technology                                                        |
| ----------------- | ----------------------------------------------------------------- |
| **Frontend**      | Next.js (App Router), React, **TypeScript**                       |
| **Styling**       | Tailwind CSS, `framer-motion`, `@headlessui/react`                |
| **Backend**       | Next.js API Routes + PostgreSQL                                   |
| **Database**      | PostgreSQL via **Prisma ORM**                                     |
| **Realtime**      | WebSockets (via `ws` or `socket.io`) for agent activity feed      |
| **AI Agent**      | **LangChain + LangGraph (TypeScript)** — runs as separate service |
| **LLM**           | Local LLM (Llama 3.2 18.4B via LMStudio, OpenAI-compatible API)   |
| **VectorDB**      | Pinecone (for agent memory & knowledge retrieval)                 |
| **UI Components** | Fully custom — no component libraries (e.g., no ShadCN, no MUI)   |
| **Icons**         | `lucide-react`                                                    |
| **Charts**        | `recharts`                                                        |
| **Forms**         | React Hook Form + Zod                                             |
| **State**         | React Context + SWR (for data fetching)                           |

---

## ?? Core Features

### 1. **Public Storefront**

- Homepage: Hero, featured products, latest blog posts
- Product listing with filters (category, price)
- Product detail: images, description, add to cart
- Blog: listing + article pages
- Responsive, mobile-first, fast

---

### 2. **Admin Dashboard (WordPress-Style, But Better)**

#### ?? Design Principles

- **Glassmorphism cards**, subtle shadows, smooth transitions
- **Micro-interactions**: hover effects, loading states, success animations
- **Expandable panels**, drag-to-reorder (optional)
- **Dark/light mode toggle**
- **Notifications toast** when agent performs action

#### ?? Dashboard Pages

All accessible under `/admin/*`

| Page                                    | Features                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **?? Dashboard Home**                   | Summary cards: Orders, Revenue, Open Tickets, Posts. Mini charts. Agent status badge (?? Active / ?? Offline)                                                                                                                                                                                                                                                                                  |
| **?? Orders**                           | Table: ID, Customer, Date, Status (Pending/Delivered/Refunded), Total. Actions: Change status, Refund (mock). Click row ? modal with details                                                                                                                                                                                                                                                   |
| **?? Blog Posts**                       | Table: Title, Author, Date, Status. Actions: Create, Edit, Publish, Trash. Rich editor (Tiptap or textarea). AI button: "Generate with AI"                                                                                                                                                                                                                                                     |
| **?? Support Tickets**                  | Table: ID, Subject, Customer, Status, Priority. Actions: Create, Close, Assign. Filter by status                                                                                                                                                                                                                                                                                               |
| **?? Site Settings**                    | Toggle: Live ? Maintenance Mode. Button: "Clear Cache" (mock). Display: Last cleared time                                                                                                                                                                                                                                                                                                      |
| **?? AI Agent Console **(? Key Feature) | Real-time chat with agent. Send commands: "Close ticket #45", "Create blog post about AI trends"                                                                                                                                                                                                                                                                                               |
| **?? Agent Action Logs **(?? Critical)  | Expandable task timeline: <br> - Main task: "Refunded order #4JUdGzvrMFDWrUUwY3toJATSeNwjn54LkCnKBPRzDuhzi5vSepHfUckJNxRL2gjkNrSqtCoRUrEDAgRwsQvVCjZbRyFTLRNyDmT1a1boZVorder status in DB" ? <br> &nbsp;&nbsp;• "Sent email to customer" ? <br> - Color-coded: green (success), red (fail), yellow (pending) <br> - Timestamps, agent name, expand/collapse <br> - Auto-refresh via WebSockets |

---

## ?? Data Models (Prisma Schema)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  tickets   Ticket[]
  orders    Order[]
}

enum Role {
  USER
  ADMIN
  AI_AGENT
}

model Order {
  id          Int       @id @default(autoincrement())
  orderId     String    @unique
  customer    User      @relation(fields: [customerId], references: [id])
  customerId  Int
  items       Json
  total       Float
  status      OrderStatus @default(PENDING)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum OrderStatus {
  PENDING
  DELIVERED
  REFUNDED
}

model Post {
  id         Int       @id @default(autoincrement())
  title      String
  slug       String    @unique
  content    String
  excerpt    String?
  status     PostStatus @default(DRAFT)
  author     User      @relation(fields: [authorId], references: [id])
  authorId   Int
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

enum PostStatus {
  DRAFT
  PUBLISHED
  TRASHED
}

model Ticket {
  id          Int      @id @default(autoincrement())
  ticketId    String   @unique
  subject     String
  description String
  customer    User     @relation(fields: [customerId], references: [id])
  customerId  Int
  status      TicketStatus @default(OPEN)
  priority    TicketPriority @default(MEDIUM)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum TicketStatus {
  OPEN
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
}

model SiteConfig {
  id              Int      @id @default(autoincrement())
  maintenanceMode Boolean  @default(false)
  lastCacheClear  DateTime?
}

model AgentLog {
  id          Int      @id @default(autoincrement())
  taskId      String   // e.g., "refund_order_456"
  task        String   // e.g., "Refunded order #456 due to defect"
  status      LogStatus @default(PENDING)
  timestamp   DateTime @default(now())
  details     Json?    // array of sub-tasks: { action, status, timestamp }
  parentId    Int?     @index
  children    AgentLog[] @relation("LogHierarchy")
}

enum LogStatus {
  PENDING
  SUCCESS
  FAILED
}
```

AI Agent Integration (LangGraph + LangChain)
Agent Responsibilities
The agent (running as a Node.js/TS service) must:

- Accept text commands via API or WebSocket
- Use LangGraph for stateful workflows:

Plan → Tool Call → Observe → Reflect → Act

- Use tools to:

Query DB (orders, tickets, site status)
Update order status
Create/edit blog posts
Close tickets
Toggle maintenance mode
Clear cache (mock)
Log every action in AgentLog

- Use Pinecone to remember past actions (vector memory)
- Return responses via WebSocket to frontend

Example Flow
User: "Refund order #456"
→ Agent:

1. query_order(orderId="456") → gets order
2. mock_refund_payment(order) → logs: "Called Stripe API"
3. update_order_status(orderId, "REFUNDED")
4. log_action("Refunded order #456", [...steps...])
5. Send success via WebSocket

📁 Project Structure
Root
├── app/
│ ├── admin/
│ │ ├── dashboard/page.tsx
│ │ ├── orders/page.tsx
│ │ ├── posts/page.tsx
│ │ ├── tickets/page.tsx
│ │ ├── settings/page.tsx
│ │ ├── agent/
│ │ │ ├── console/page.tsx ← Chat with agent
│ │ │ └── logs/page.tsx ← Expandable task logs
│ │ └── layout.tsx
│ ├── blog/
│ ├── products/
│ └── layout.tsx
├── components/
│ ├── ui/
│ ├── admin/
│ │ ├── Sidebar.tsx
│ │ ├── Navbar.tsx
│ │ ├── DataTable.tsx
│ │ ├── TaskLogCard.tsx ← Expandable logs
│ │ └── AgentChat.tsx ← WebSocket chat
│ └── store/
├── lib/
│ ├── prisma.ts
│ ├── agent-logger.ts ← Logs to DB
│ └── websocket-client.ts
├── api-agent/ ← LangGraph agent (Node.js/TS)
│ ├── src/
│ │ ├── agents/main-agent.ts
│ │ ├── tools/database.ts
│ │ ├── tools/blog.ts
│ │ ├── tools/orders.ts
│ │ ├── tools/tickets.ts
│ │ ├── tools/site-control.ts
│ │ └── server/ws-server.ts ← WebSocket bridge
│ └── package.json
├── public/
├── schema.prisma
├── tailwind.config.ts
├── tsconfig.json
└── package.json

🌐 API Endpoints (Next.js)

- GET /api/orders → list
- PATCH /api/orders/:id → update status
- POST /api/posts → create
- PUT /api/posts/:id → update
- GET /api/tickets
- PATCH /api/tickets/:id
- GET /api/status → maintenance mode, cache time
- POST /api/agent/command → send command to agent
- GET /api/logs → agent action logs
- WebSocket: /api/ws → real-time agent events

🎨 UI/UX Guidelines

- Design: Modern SaaS (like Linear, Notion, Vercel)
- Colors: slate-900, indigo-600, emerald-500, rose-500
- Typography: Inter (Google Fonts), clean hierarchy
- Animations: framer-motion for fade-ins, slide-ups
- Empty States: SVG illustrations
- Loading States: Skeleton cards
- Expandable Logs: Accordion UI with icons, colors, timestamps
