# Frontend Setup Guide

## Overview
The SiteMind frontend is built with Next.js 15 App Router, React 18, TypeScript, and Tailwind CSS. It features a modern admin dashboard and public storefront with AI-powered functionality.

## Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (for backend integration)

## Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `AGENT_SERVICE_URL`: Backend agent service URL (default: http://localhost:3002)

3. **Database Setup**
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed initial data (optional)
```

## Development

### Start Development Server
```bash
npm run dev
```

The application will run on **http://localhost:3001** (configured via PORT in package.json)

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── admin/                    # Admin dashboard pages
│   │   ├── dashboard/            # Main dashboard
│   │   ├── orders/               # Order management
│   │   ├── posts/                # Blog management
│   │   ├── tickets/              # Support tickets
│   │   ├── settings/             # Site settings
│   │   └── agent/                # Agent console & logs
│   ├── products/                 # Product pages
│   │   ├── page.tsx              # Product listing
│   │   └── [slug]/               # Product detail
│   ├── blog/                     # Blog pages
│   │   ├── page.tsx              # Blog listing
│   │   └── [slug]/               # Blog post detail
│   └── api/                      # API routes (backend)
│
├── components/                   # React components
│   ├── ui/                       # UI component library
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Spinner.tsx
│   │   └── ... (15+ components)
│   ├── admin/                    # Admin-specific components
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   └── AdminLayout.tsx
│   ├── ErrorBoundary.tsx         # Error boundary wrapper
│   └── Providers.tsx             # Root providers wrapper
│
├── contexts/                     # React Context providers
│   ├── ThemeContext.tsx          # Dark/light mode
│   ├── ToastContext.tsx          # Toast notifications
│   └── AgentContext.tsx          # WebSocket agent connection
│
├── hooks/                        # Custom React hooks
│   └── useAPI.ts                 # SWR-based API hooks
│
├── types/                        # TypeScript type definitions
│   └── api.ts                    # API types (Order, Post, Product, etc.)
│
├── tailwind.config.ts            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Key Features

### UI Components Library
15+ reusable components in `components/ui/`:
- **Button**: 5 variants (primary, secondary, danger, ghost, success), 3 sizes
- **Card**: Glass morphism, gradient, and default variants
- **Modal**: Animated with backdrop blur
- **Table**: Sortable columns, row click handlers
- **Input/Select/Textarea**: Form components with validation support
- **Toast**: Notification system with 4 types
- **Badge**: Status indicators with variants
- **Spinner**: Loading states (3 sizes)

### Admin Dashboard
Located in `app/admin/`:
- **Dashboard**: Analytics, stats, recent activity
- **Orders**: Order management with status updates
- **Posts**: Blog post CRUD operations
- **Tickets**: Support ticket system
- **Settings**: Site configuration, maintenance mode
- **Agent Console**: Real-time AI agent chat (WebSocket)
- **Agent Logs**: Expandable timeline view with auto-refresh

### Public Storefront
- **Homepage**: Hero section, features, products, blog posts
- **Products**: Listing with filters, detail pages
- **Blog**: Post listing and detail pages
- **Responsive Navigation**: Mobile-friendly

### State Management
- **SWR**: Data fetching with caching (hooks in `hooks/useAPI.ts`)
- **React Context**: Theme, Toast, Agent state
- **WebSocket**: Real-time agent communication

### Styling
- **Tailwind CSS**: Utility-first styling
- **Dark Mode**: Full dark mode support with class strategy
- **Framer Motion**: Smooth animations
- **Custom Theme**: Defined in `tailwind.config.ts`
  - Primary, success, danger, warning colors
  - Glassmorphism utilities
  - Custom animations

## API Integration

### Available Hooks (hooks/useAPI.ts)

**Products** (Mock data - backend API pending):
- `useProducts()` - Get all products
- `useProduct(slug)` - Get single product by slug
- `useFeaturedProducts(limit)` - Get featured products

**Orders**:
- `useOrders(filters)` - Get orders with optional filters
- `useOrder(id)` - Get single order
- `usePendingOrders()` - Get pending orders
- `useOrderStats()` - Get order statistics

**Posts**:
- `usePosts(filters)` - Get blog posts
- `usePost(slug)` - Get single post

**Tickets**:
- `useTickets(filters)` - Get support tickets
- `useOpenTickets()` - Get open tickets

**Site**:
- `useSiteStatus()` - Get site status
- `useSiteAnalytics()` - Get analytics data
- `useSiteHealth()` - Get health check

**Agent Logs**:
- `useAgentLogs(filters)` - Get agent logs (auto-refresh every 5s)

### Mutation Helpers
- `useOrderActions()` - Update orders, request refunds
- `usePostActions()` - Create, update, publish posts
- `useTicketActions()` - Close, assign tickets
- `useSiteActions()` - Toggle maintenance, clear cache

## TypeScript Types

All API types are defined in `types/api.ts`:
- Product, Order, Post, Ticket
- AgentLog, SiteConfig, SiteAnalytics
- Request/Response wrappers
- Enums for statuses, priorities

## Error Handling

**ErrorBoundary** component wraps:
- Root application (`components/Providers.tsx`)
- Admin pages (`components/admin/AdminLayout.tsx`)

Displays user-friendly error messages with recovery options.

## Performance Optimizations

- **SWR Caching**: Automatic request deduplication
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component (when images added)
- **Static Generation**: Where applicable
- **Loading States**: Spinner components on all async operations

## Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Environment Variables
Ensure all production environment variables are set:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your production domain)
- `NEXTAUTH_SECRET`
- `AGENT_SERVICE_URL`

## Troubleshooting

**Port Already in Use**:
```bash
# Find process using port 3001
netstat -ano | findstr :3001
# Kill process
taskkill /F /PID <PID>
```

**Clear Next.js Cache**:
```bash
rm -rf .next
npm run dev
```

**Database Issues**:
```bash
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Sync schema
```

## Notes

- **Mock Products**: Product API uses mock data until backend implements `/api/products`
- **WebSocket**: Agent console requires backend agent service running on port 3002
- **Dark Mode**: Persisted in localStorage, syncs with system preference
- **Port**: Configured to run on 3001 (see `package.json` dev script)

## Next Steps

1. Implement product API endpoints in backend
2. Add image upload functionality
3. Implement authentication with NextAuth
4. Add pagination to data tables
5. Enhance mobile navigation
6. Add comprehensive SEO metadata
