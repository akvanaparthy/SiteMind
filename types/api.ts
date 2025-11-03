// API Response Types for SiteMind

export interface User {
  id: number
  name: string | null
  email: string
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  stock: number
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: number
  orderId: string
  customerId: number
  status: OrderStatus
  total: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
  customer?: User
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: number
  product?: Product
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: PostStatus
  authorId: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  author?: User
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Ticket {
  id: number
  ticketId: string
  subject: string
  description: string
  customerId: number
  status: TicketStatus
  priority: TicketPriority
  assignedTo: number | null
  resolution: string | null
  createdAt: string
  updatedAt: string
  closedAt: string | null
  customer?: User
  assignedUser?: User
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface AgentLog {
  id: number
  taskId: string
  task: string
  status: LogStatus
  timestamp: string
  details: string | null
  metadata: Record<string, any> | null
  parentId: number | null
  agentName: string | null
  children?: AgentLog[]
}

export enum LogStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface SiteConfig {
  id: number
  maintenanceMode: boolean
  lastCacheClear: string | null
  createdAt: string
  updatedAt: string
}

export interface SiteAnalytics {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  avgOrderValue: number
  ordersToday: number
  revenueToday: number
  topProducts: Array<{
    product: Product
    totalSold: number
    revenue: number
  }>
  recentOrders: Order[]
  orders?: {
    total: number
    totalRevenue: number
  }
  tickets?: {
    open: number
    closed: number
  }
  posts?: {
    published: number
    draft: number
  }
  users?: {
    total: number
    active: number
  }
}

// API Response Wrappers
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// API Request Types
export interface CreateOrderRequest {
  customerId: number
  items: Array<{
    productId: number
    quantity: number
  }>
}

export interface UpdateOrderRequest {
  status?: OrderStatus
  items?: OrderItem[]
}

export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  authorId: number
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  excerpt?: string
  status?: PostStatus
}

export interface CreateTicketRequest {
  subject: string
  description: string
  customerId: number
  priority?: TicketPriority
}

export interface UpdateTicketRequest {
  status?: TicketStatus
  priority?: TicketPriority
  assignedTo?: number
  resolution?: string
}

export interface CreateProductRequest {
  name: string
  slug: string
  description: string
  price: number
  stock: number
  image?: string
}

export interface UpdateProductRequest {
  name?: string
  slug?: string
  description?: string
  price?: number
  stock?: number
  image?: string
}
