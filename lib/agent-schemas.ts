import { z } from 'zod';
import { OrderStatus, PostStatus, TicketStatus, TicketPriority, LogStatus } from '@prisma/client';

/**
 * Agent Response Schemas
 * 
 * This file defines TypeScript interfaces and Zod schemas for ALL agent responses.
 * Every LLM response must conform to these structures for frontend/backend parsing.
 * 
 * Structure:
 * 1. Base Response (all actions use this wrapper)
 * 2. Action-Specific Data Schemas
 * 3. Zod Validation Schemas
 * 4. Helper Types
 */

// ============================================================================
// BASE RESPONSE STRUCTURE (Used by ALL actions)
// ============================================================================

export interface ActionStep {
  step: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string; // ISO8601
  details?: string;
}

export interface ApprovalRequest {
  approvalId: string;
  reason: string;
  expiresAt: string; // ISO8601
  details: Record<string, any>;
}

export interface AgentError {
  code: string;
  details: string;
  suggestion?: string;
}

export interface BaseAgentResponse<T = any> {
  status: 'success' | 'error' | 'pending_approval';
  action: string;
  message: string;
  data?: T;
  logs?: ActionStep[];
  approval?: ApprovalRequest;
  error?: AgentError;
}

// ============================================================================
// BLOG POST ACTIONS - Response Data Schemas
// ============================================================================

export interface BlogPostData {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  status: PostStatus;
  author: {
    id: number;
    name: string | null;
    email: string;
  };
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

export interface CreateBlogPostResponse extends BaseAgentResponse<{ post: BlogPostData }> {
  action: 'createBlogPost';
}

export interface UpdateBlogPostResponse extends BaseAgentResponse<{ post: BlogPostData }> {
  action: 'updateBlogPost';
}

export interface PublishBlogPostResponse extends BaseAgentResponse<{ post: BlogPostData }> {
  action: 'publishBlogPost';
}

export interface TrashBlogPostResponse extends BaseAgentResponse<{ post: BlogPostData }> {
  action: 'trashBlogPost';
}

export interface DeleteBlogPostResponse extends BaseAgentResponse<{ deleted: boolean; postId: number }> {
  action: 'deleteBlogPost';
}

export interface GetBlogPostResponse extends BaseAgentResponse<{ post: BlogPostData }> {
  action: 'getBlogPost';
}

// ============================================================================
// TICKET ACTIONS - Response Data Schemas
// ============================================================================

export interface TicketData {
  id: number;
  ticketId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer: {
    id: number;
    name: string | null;
    email: string;
  };
  assignedTo?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  resolution?: string | null;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

export interface CreateTicketResponse extends BaseAgentResponse<{ ticket: TicketData }> {
  action: 'createTicket';
}

export interface UpdateTicketResponse extends BaseAgentResponse<{ ticket: TicketData }> {
  action: 'updateTicket';
}

export interface CloseTicketResponse extends BaseAgentResponse<{ ticket: TicketData }> {
  action: 'closeTicket';
}

export interface ReopenTicketResponse extends BaseAgentResponse<{ ticket: TicketData }> {
  action: 'reopenTicket';
}

export interface UpdateTicketPriorityResponse extends BaseAgentResponse<{ ticket: TicketData }> {
  action: 'updateTicketPriority';
}

export interface AssignTicketResponse extends BaseAgentResponse<{ ticket: TicketData }> {
  action: 'assignTicket';
}

export interface GetTicketResponse extends BaseAgentResponse<{ ticket: TicketData }> {
  action: 'getTicket';
}

export interface GetOpenTicketsResponse extends BaseAgentResponse<{ tickets: TicketData[]; count: number }> {
  action: 'getOpenTickets';
}

// ============================================================================
// ORDER ACTIONS - Response Data Schemas
// ============================================================================

export interface OrderData {
  id: number;
  orderId: string;
  customer: {
    id: number;
    name: string | null;
    email: string;
  };
  items?: any; // JSON field (optional to match Zod schema)
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

export interface OrderStatsData {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  refundedOrders: number;
  averageOrderValue: number;
  deliveryRate: number; // percentage
}

export interface GetOrderResponse extends BaseAgentResponse<{ order: OrderData }> {
  action: 'getOrder';
}

export interface GetPendingOrdersResponse extends BaseAgentResponse<{ orders: OrderData[]; count: number }> {
  action: 'getPendingOrders';
}

export interface UpdateOrderStatusResponse extends BaseAgentResponse<{ order: OrderData }> {
  action: 'updateOrderStatus';
}

export interface GenerateRefundApprovalResponse extends BaseAgentResponse<{ order: OrderData }> {
  action: 'generateRefundApproval';
  status: 'pending_approval'; // Always requires approval
}

export interface ProcessRefundResponse extends BaseAgentResponse<{ order: OrderData; refundAmount: number }> {
  action: 'processRefund';
}

export interface CancelOrderResponse extends BaseAgentResponse<{ order: OrderData }> {
  action: 'cancelOrder';
}

export interface NotifyCustomerResponse extends BaseAgentResponse<{ notified: boolean; email: string }> {
  action: 'notifyCustomer';
}

export interface GetOrderStatsResponse extends BaseAgentResponse<{ stats: OrderStatsData }> {
  action: 'getOrderStats';
}

// ============================================================================
// SITE CONTROL ACTIONS - Response Data Schemas
// ============================================================================

export interface SiteStatusData {
  maintenanceMode: boolean;
  lastCacheClear: string | null; // ISO8601
  status: 'operational' | 'maintenance';
}

export interface SiteAnalyticsData {
  orders: {
    total: number;
    revenue: number;
    pending: number;
    delivered: number;
  };
  tickets: {
    total: number;
    open: number;
    closed: number;
    highPriority: number;
  };
  blog: {
    total: number;
    published: number;
    drafts: number;
  };
  users: {
    total: number;
    admins: number;
    customers: number;
  };
  agentLogs: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
  };
}

export interface HealthCheckData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'connected' | 'disconnected';
  timestamp: string; // ISO8601
  latency?: number; // milliseconds
}

export interface GetSiteStatusResponse extends BaseAgentResponse<{ status: SiteStatusData }> {
  action: 'getSiteStatus';
}

export interface ToggleMaintenanceModeResponse extends BaseAgentResponse<{ maintenanceMode: boolean }> {
  action: 'toggleMaintenanceMode';
}

export interface GenerateMaintenanceApprovalResponse extends BaseAgentResponse<{ maintenanceMode: boolean }> {
  action: 'generateMaintenanceApproval';
  status: 'pending_approval'; // Always requires approval when enabling
}

export interface ClearCacheResponse extends BaseAgentResponse<{ cleared: boolean; timestamp: string }> {
  action: 'clearCache';
}

export interface GetSiteAnalyticsResponse extends BaseAgentResponse<{ analytics: SiteAnalyticsData }> {
  action: 'getSiteAnalytics';
}

export interface HealthCheckResponse extends BaseAgentResponse<{ health: HealthCheckData }> {
  action: 'healthCheck';
}

// ============================================================================
// AGENT LOG ACTIONS - Response Data Schemas
// ============================================================================

export interface AgentLogData {
  id: number;
  taskId: string;
  task: string;
  status: LogStatus;
  timestamp: string; // ISO8601
  details?: any; // JSON field with ActionStep[]
  parentId?: number | null;
  children?: AgentLogData[];
}

export interface GetAgentLogsResponse extends BaseAgentResponse<{ logs: AgentLogData[]; count: number }> {
  action: 'getAgentLogs';
}

export interface GetLogStatsResponse extends BaseAgentResponse<{
  stats: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
  };
}> {
  action: 'getLogStats';
}

// ============================================================================
// ZOD VALIDATION SCHEMAS (for runtime validation)
// ============================================================================

const ActionStepSchema = z.object({
  step: z.string(),
  status: z.enum(['success', 'failed', 'pending']),
  timestamp: z.string(), // ISO8601
  details: z.string().optional(),
});

const ApprovalRequestSchema = z.object({
  approvalId: z.string(),
  reason: z.string(),
  expiresAt: z.string(), // ISO8601
  details: z.record(z.any()),
});

const AgentErrorSchema = z.object({
  code: z.string(),
  details: z.string(),
  suggestion: z.string().optional(),
});

export const BaseAgentResponseSchema = z.object({
  status: z.enum(['success', 'error', 'pending_approval']),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  logs: z.array(ActionStepSchema).optional(),
  approval: ApprovalRequestSchema.optional(),
  error: AgentErrorSchema.optional(),
});

// Blog Post Schemas
const BlogPostDataSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable().optional(),
  status: z.nativeEnum(PostStatus),
  author: z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Ticket Schemas
const TicketDataSchema = z.object({
  id: z.number(),
  ticketId: z.string(),
  subject: z.string(),
  description: z.string(),
  status: z.nativeEnum(TicketStatus),
  priority: z.nativeEnum(TicketPriority),
  customer: z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string(),
  }),
  assignedTo: z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string(),
  }).nullable().optional(),
  resolution: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Order Schemas
const OrderDataSchema = z.object({
  id: z.number(),
  orderId: z.string(),
  customer: z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string(),
  }),
  items: z.any(), // JSON
  total: z.number(),
  status: z.nativeEnum(OrderStatus),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// RESPONSE VALIDATORS (validate LLM output before processing)
// ============================================================================

export function validateBaseResponse(response: unknown): BaseAgentResponse {
  return BaseAgentResponseSchema.parse(response);
}

export function validateBlogPostResponse(response: unknown): BlogPostData {
  return BlogPostDataSchema.parse(response);
}

export function validateTicketResponse(response: unknown): TicketData {
  return TicketDataSchema.parse(response);
}

export function validateOrderResponse(response: unknown): OrderData {
  return OrderDataSchema.parse(response);
}

// ============================================================================
// RESPONSE BUILDERS (helper functions to construct responses)
// ============================================================================

export function buildSuccessResponse<T>(
  action: string,
  message: string,
  data: T,
  logs?: ActionStep[]
): BaseAgentResponse<T> {
  return {
    status: 'success',
    action,
    message,
    data,
    logs,
  };
}

export function buildErrorResponse(
  action: string,
  message: string,
  error: AgentError,
  logs?: ActionStep[]
): BaseAgentResponse {
  return {
    status: 'error',
    action,
    message,
    error,
    logs,
  };
}

export function buildApprovalResponse<T>(
  action: string,
  message: string,
  data: T,
  approval: ApprovalRequest,
  logs?: ActionStep[]
): BaseAgentResponse<T> {
  return {
    status: 'pending_approval',
    action,
    message,
    data,
    approval,
    logs,
  };
}

// ============================================================================
// JSON SCHEMA STRINGS (for inclusion in LLM prompts)
// ============================================================================

export const JSON_SCHEMA_TEMPLATES = {
  BASE: `{
  "status": "success" | "error" | "pending_approval",
  "action": "<action_name>",
  "message": "<human-readable summary>",
  "data": { /* action-specific payload */ },
  "logs": [
    { "step": "description", "status": "success|failed|pending", "timestamp": "ISO8601" }
  ]
}`,

  BLOG_POST: `{
  "status": "success",
  "action": "createBlogPost|updateBlogPost|publishBlogPost|trashBlogPost|getBlogPost",
  "message": "Created/Updated blog post: [title]",
  "data": {
    "post": {
      "id": number,
      "title": string,
      "slug": string,
      "content": string,
      "excerpt": string | null,
      "status": "DRAFT" | "PUBLISHED" | "TRASHED",
      "author": { "id": number, "name": string, "email": string },
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  },
  "logs": [{ "step": string, "status": "success", "timestamp": "ISO8601" }]
}`,

  TICKET: `{
  "status": "success",
  "action": "createTicket|closeTicket|updateTicketPriority|assignTicket|getTicket",
  "message": "Created/Closed/Updated ticket #[ticketId]",
  "data": {
    "ticket": {
      "id": number,
      "ticketId": string,
      "subject": string,
      "description": string,
      "status": "OPEN" | "CLOSED",
      "priority": "LOW" | "MEDIUM" | "HIGH",
      "customer": { "id": number, "name": string, "email": string },
      "assignedTo": { "id": number, "name": string, "email": string } | null,
      "resolution": string | null,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  },
  "logs": [{ "step": string, "status": "success", "timestamp": "ISO8601" }]
}`,

  ORDER: `{
  "status": "success",
  "action": "getOrder|updateOrderStatus|processRefund|cancelOrder|notifyCustomer",
  "message": "Processed order #[orderId]",
  "data": {
    "order": {
      "id": number,
      "orderId": string,
      "customer": { "id": number, "name": string, "email": string },
      "items": any,
      "total": number,
      "status": "PENDING" | "DELIVERED" | "REFUNDED",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  },
  "logs": [{ "step": string, "status": "success", "timestamp": "ISO8601" }]
}`,

  APPROVAL: `{
  "status": "pending_approval",
  "action": "processRefund|toggleMaintenanceMode",
  "message": "Action requires approval",
  "data": { /* context data */ },
  "approval": {
    "approvalId": string,
    "reason": string,
    "expiresAt": "ISO8601",
    "details": { /* approval context */ }
  },
  "logs": [{ "step": string, "status": "success", "timestamp": "ISO8601" }]
}`,

  ERROR: `{
  "status": "error",
  "action": "<action_name>",
  "message": "Brief error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message",
    "suggestion": "What user should do next (optional)"
  },
  "logs": [{ "step": string, "status": "failed", "timestamp": "ISO8601" }]
}`,

  SITE_STATUS: `{
  "status": "success",
  "action": "getSiteStatus",
  "message": "Retrieved site status",
  "data": {
    "status": {
      "maintenanceMode": boolean,
      "lastCacheClear": "ISO8601" | null,
      "status": "operational" | "maintenance"
    }
  }
}`,

  SITE_ANALYTICS: `{
  "status": "success",
  "action": "getSiteAnalytics",
  "message": "Retrieved site analytics",
  "data": {
    "analytics": {
      "orders": { "total": number, "revenue": number, "pending": number, "delivered": number },
      "tickets": { "total": number, "open": number, "closed": number, "highPriority": number },
      "blog": { "total": number, "published": number, "drafts": number },
      "users": { "total": number, "admins": number, "customers": number },
      "agentLogs": { "total": number, "successful": number, "failed": number, "pending": number }
    }
  }
}`,

  HEALTH_CHECK: `{
  "status": "success",
  "action": "healthCheck",
  "message": "System health check completed",
  "data": {
    "health": {
      "status": "healthy" | "degraded" | "unhealthy",
      "database": "connected" | "disconnected",
      "timestamp": "ISO8601",
      "latency": number
    }
  }
}`,
};

// ============================================================================
// TYPE GUARDS (runtime type checking)
// ============================================================================

export function isSuccessResponse(response: BaseAgentResponse): boolean {
  return response.status === 'success';
}

export function isErrorResponse(response: BaseAgentResponse): boolean {
  return response.status === 'error';
}

export function isPendingApprovalResponse(response: BaseAgentResponse): boolean {
  return response.status === 'pending_approval';
}

export function hasApproval(response: BaseAgentResponse): response is BaseAgentResponse & { approval: ApprovalRequest } {
  return response.status === 'pending_approval' && !!response.approval;
}

export function hasError(response: BaseAgentResponse): response is BaseAgentResponse & { error: AgentError } {
  return response.status === 'error' && !!response.error;
}
