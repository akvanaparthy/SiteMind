'use client'

import useSWR, { SWRResponse } from 'swr'
import { useCallback } from 'react'
import type {
  Order,
  Post,
  Ticket,
  AgentLog,
  SiteConfig,
  SiteAnalytics,
  Product,
  OrderStatus,
  PostStatus,
  TicketStatus,
  TicketPriority,
  CreatePostRequest,
  UpdatePostRequest,
  CreateTicketRequest,
  UpdateTicketRequest,
} from '@/types/api'

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || 'Failed to fetch')
  }
  return res.json()
}

// API base URL
const API_BASE = '/api'

// ============================================
// PRODUCTS HOOKS
// ============================================

export function useProducts(filters?: {
  category?: string
  featured?: boolean
  active?: boolean
  limit?: number
}): SWRResponse<{ success: boolean; data: Product[]; count: number }> {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.featured !== undefined) params.append('featured', filters.featured.toString())
  if (filters?.active !== undefined) params.append('active', filters.active.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const url = `${API_BASE}/products${params.toString() ? `?${params.toString()}` : ''}`

  return useSWR<{ success: boolean; data: Product[]; count: number }>(url, fetcher)
}

export function useProduct(slug: string): SWRResponse<{ success: boolean; data: Product } | null> {
  return useSWR<{ success: boolean; data: Product } | null>(
    slug ? `${API_BASE}/products?slug=${slug}` : null,
    fetcher
  )
}

export function useFeaturedProducts(limit: number = 4): SWRResponse<{ success: boolean; data: Product[]; count: number }> {
  return useSWR<{ success: boolean; data: Product[]; count: number }>(
    `${API_BASE}/products?featured=true&active=true&limit=${limit}`,
    fetcher
  )
}

// ============================================
// ORDERS HOOKS
// ============================================

export function useOrders(filters?: {
  status?: string
  customerId?: number
  limit?: number
}): SWRResponse<Order[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.customerId) params.append('customerId', filters.customerId.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const url = `${API_BASE}/orders${params.toString() ? `?${params.toString()}` : ''}`

  return useSWR<Order[]>(url, fetcher)
}

export function useOrder(id: number | string): SWRResponse<Order> {
  const params = typeof id === 'number'
    ? `?id=${id}`
    : `?orderId=${id}`

  return useSWR<Order>(id ? `${API_BASE}/orders${params}` : null, fetcher)
}

export function usePendingOrders(): SWRResponse<Order[]> {
  return useSWR<Order[]>(`${API_BASE}/orders?pendingOnly=true`, fetcher)
}

export function useOrderStats(): SWRResponse<any> {
  return useSWR<any>(`${API_BASE}/orders?stats=true`, fetcher)
}

// ============================================
// POSTS HOOKS
// ============================================

export function usePosts(filters?: {
  status?: string
  authorId?: number
  limit?: number
}): SWRResponse<Post[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.authorId) params.append('authorId', filters.authorId.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const url = `${API_BASE}/posts${params.toString() ? `?${params.toString()}` : ''}`

  return useSWR<Post[]>(url, fetcher)
}

export function usePost(idOrSlug: number | string): SWRResponse<Post> {
  const params = typeof idOrSlug === 'number'
    ? `?id=${idOrSlug}`
    : `?slug=${idOrSlug}`

  return useSWR<Post>(idOrSlug ? `${API_BASE}/posts${params}` : null, fetcher)
}

// ============================================
// TICKETS HOOKS
// ============================================

export function useTickets(filters?: {
  status?: string
  priority?: string
  customerId?: number
  limit?: number
}): SWRResponse<Ticket[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.priority) params.append('priority', filters.priority)
  if (filters?.customerId) params.append('customerId', filters.customerId.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const url = `${API_BASE}/tickets${params.toString() ? `?${params.toString()}` : ''}`

  return useSWR<Ticket[]>(url, fetcher)
}

export function useTicket(id: number): SWRResponse<Ticket> {
  return useSWR<Ticket>(id ? `${API_BASE}/tickets?id=${id}` : null, fetcher)
}

export function useOpenTickets(): SWRResponse<Ticket[]> {
  return useSWR<Ticket[]>(`${API_BASE}/tickets?openOnly=true`, fetcher)
}

// ============================================
// SITE HOOKS
// ============================================

export function useSiteStatus(): SWRResponse<SiteConfig> {
  return useSWR<SiteConfig>(`${API_BASE}/site?action=status`, fetcher)
}

export function useSiteAnalytics(): SWRResponse<SiteAnalytics> {
  return useSWR<SiteAnalytics>(`${API_BASE}/site?action=analytics`, fetcher)
}

export function useSiteHealth(): SWRResponse<any> {
  return useSWR<any>(`${API_BASE}/site?action=health`, fetcher)
}

// ============================================
// AGENT LOGS HOOKS
// ============================================

export function useAgentLogs(filters?: {
  status?: string
  limit?: number
}): SWRResponse<{
  logs: AgentLog[]
  stats?: {
    total: number
    success: number
    failed: number
    pending: number
  }
}> {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const url = `${API_BASE}/logs${params.toString() ? `?${params.toString()}` : ''}`

  return useSWR<{
    logs: AgentLog[]
    stats?: {
      total: number
      success: number
      failed: number
      pending: number
    }
  }>(url, fetcher, {
    refreshInterval: 5000, // Auto-refresh every 5 seconds
  })
}

export function useAgentLog(idOrTaskId: number | string): SWRResponse<AgentLog> {
  const params = typeof idOrTaskId === 'number'
    ? `?id=${idOrTaskId}`
    : `?taskId=${idOrTaskId}`

  return useSWR<AgentLog>(idOrTaskId ? `${API_BASE}/logs${params}` : null, fetcher)
}

// ============================================
// MUTATION HELPERS
// ============================================

export function useAPIAction() {
  const execute = useCallback(async (
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST',
    body?: any
  ) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(error.message || 'Action failed')
    }

    return res.json()
  }, [])

  return { execute }
}

// ============================================
// SPECIFIC ACTIONS
// ============================================

export function useOrderActions() {
  const { execute } = useAPIAction()

  return {
    updateStatus: (id: number, status: string) =>
      execute('/orders', 'PUT', { id, status }),

    requestRefund: (orderId: number, reason: string) =>
      execute('/orders', 'POST', { type: 'refund', orderId, reason }),

    notifyCustomer: (orderId: number | string, subject: string, message: string) =>
      execute('/orders', 'POST', { type: 'notify', orderId, subject, message }),
  }
}

export function usePostActions() {
  const { execute } = useAPIAction()

  return {
    create: (data: any) =>
      execute('/posts', 'POST', data),

    update: (id: number, data: any) =>
      execute('/posts', 'PUT', { id, ...data }),

    publish: (id: number) =>
      execute('/posts', 'PUT', { type: 'publish', id }),

    trash: (id: number) =>
      execute('/posts', 'PUT', { type: 'trash', id }),

    delete: (id: number) =>
      execute('/posts', 'DELETE', { id }),
  }
}

export function useTicketActions() {
  const { execute } = useAPIAction()

  return {
    create: (data: any) =>
      execute('/tickets', 'POST', data),

    close: (id: number, resolution: string) =>
      execute('/tickets', 'PUT', { type: 'close', id, resolution }),

    assign: (id: number, assigneeId: number) =>
      execute('/tickets', 'PUT', { type: 'assign', id, assigneeId }),

    updatePriority: (id: number, priority: string) =>
      execute('/tickets', 'PUT', { type: 'updatePriority', id, priority }),
  }
}

export function useSiteActions() {
  const { execute } = useAPIAction()

  return {
    toggleMaintenance: (enabled: boolean, approvalId?: string) =>
      execute('/site', 'POST', { action: 'toggleMaintenance', enabled, approvalId }),

    clearCache: () =>
      execute('/site', 'POST', { action: 'clearCache' }),
  }
}

export function useProductActions() {
  const { execute } = useAPIAction()

  return {
    create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      execute('/products', 'POST', data),

    update: (id: number, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) =>
      execute('/products', 'PUT', { id, ...data }),

    delete: (id: number) =>
      execute(`/products?id=${id}`, 'DELETE'),
  }
}
