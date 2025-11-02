import { SiteConfig } from '@prisma/client';
import prisma from '../prisma';
import { startLogging } from '../agent-logger';
import { getOrderStats } from './orders';
import { getLogStats } from '../agent-logger';

/**
 * Site analytics data
 */
export interface SiteAnalytics {
  orders: {
    total: number;
    pending: number;
    delivered: number;
    refunded: number;
    cancelled: number;
    revenue: number;
    deliveryRate: string;
  };
  tickets: {
    total: number;
    open: number;
    closed: number;
  };
  posts: {
    total: number;
    published: number;
    draft: number;
    trashed: number;
  };
  users: {
    total: number;
    customers: number;
    admins: number;
  };
  agentLogs: {
    total: number;
    pending: number;
    success: number;
    failed: number;
    successRate: string;
  };
}

/**
 * Get or create site configuration
 */
async function getSiteConfig(): Promise<SiteConfig> {
  let config = await prisma.siteConfig.findFirst();

  if (!config) {
    config = await prisma.siteConfig.create({
      data: {
        maintenanceMode: false,
      },
    });
  }

  return config;
}

/**
 * Get current site status
 * 
 * @param agentName - Name of the agent querying
 * @returns Site configuration
 */
export async function getSiteStatus(
  agentName: string = 'AI Agent'
): Promise<SiteConfig> {
  const { log, update, complete, fail } = await startLogging(
    'Query site status',
    {},
    agentName
  );

  try {
    await update('Fetching site configuration');
    const config = await getSiteConfig();

    await complete(`Site status: ${config.maintenanceMode ? 'Maintenance Mode' : 'Live'}`);
    return config;
  } catch (error: any) {
    await fail('Failed to get site status', error.message);
    throw error;
  }
}

/**
 * Toggle maintenance mode
 * This is a critical operation that should require approval
 * 
 * @param enabled - Enable or disable maintenance mode
 * @param approvalId - Approval request ID (required for enabling)
 * @param agentName - Name of the agent toggling
 * @returns Updated site configuration
 */
export async function toggleMaintenanceMode(
  enabled: boolean,
  approvalId: string | null,
  agentName: string = 'AI Agent'
): Promise<SiteConfig> {
  const { log, update, complete, fail } = await startLogging(
    `Toggle maintenance mode: ${enabled ? 'ON' : 'OFF'}`,
    { enabled, approvalId },
    agentName
  );

  try {
    // Require approval for enabling maintenance mode
    if (enabled && !approvalId) {
      await fail('Approval required', 'Maintenance mode requires user approval');
      throw new Error('Maintenance mode requires user approval. Use generateMaintenanceModeApprovalRequest() first.');
    }

    await update('Fetching current site configuration');
    const config = await getSiteConfig();

    if (config.maintenanceMode === enabled) {
      await complete(`Maintenance mode is already ${enabled ? 'enabled' : 'disabled'}`);
      return config;
    }

    await update(`${enabled ? 'Enabling' : 'Disabling'} maintenance mode`);
    const updatedConfig = await prisma.siteConfig.update({
      where: { id: config.id },
      data: {
        maintenanceMode: enabled,
        updatedAt: new Date(),
      },
    });

    await update('Broadcasting maintenance mode change to all users (mock)');
    // TODO: Broadcast via WebSocket to all connected clients

    await complete(`Successfully ${enabled ? 'enabled' : 'disabled'} maintenance mode`);
    return updatedConfig;
  } catch (error: any) {
    await fail('Failed to toggle maintenance mode', error.message);
    throw error;
  }
}

/**
 * Generate approval request for maintenance mode
 * 
 * @param enable - Whether to enable or disable
 * @param reason - Reason for change
 * @param agentName - Name of the agent requesting
 * @returns Approval request object
 */
export async function generateMaintenanceModeApprovalRequest(
  enable: boolean,
  reason: string,
  agentName: string = 'AI Agent'
) {
  const { log, update, complete, fail } = await startLogging(
    `Generate maintenance mode approval request`,
    { enable, reason },
    agentName
  );

  try {
    await update('Creating approval request');
    const approvalRequest = {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action: 'maintenance_mode' as const,
      enable,
      reason,
      requestedAt: new Date(),
      requestedBy: agentName,
    };

    await complete(`Approval request generated: ${approvalRequest.id}`);
    return approvalRequest;
  } catch (error: any) {
    await fail('Failed to generate approval request', error.message);
    throw error;
  }
}

/**
 * Clear application cache
 * 
 * @param agentName - Name of the agent clearing cache
 * @returns Success message with timestamp
 */
export async function clearCache(
  agentName: string = 'AI Agent'
): Promise<{ success: boolean; message: string; clearedAt: Date }> {
  const { log, update, complete, fail } = await startLogging(
    'Clear application cache',
    {},
    agentName
  );

  try {
    await update('Clearing application cache (mock)');
    // TODO: Implement actual cache clearing logic
    // - Clear Next.js cache
    // - Clear Redis cache if using
    // - Purge CDN cache if using

    const clearedAt = new Date();

    await update('Updating site configuration');
    const config = await getSiteConfig();
    await prisma.siteConfig.update({
      where: { id: config.id },
      data: {
        lastCacheClear: clearedAt,
        updatedAt: new Date(),
      },
    });

    await complete(`Cache cleared successfully at ${clearedAt.toISOString()}`);
    return {
      success: true,
      message: 'Cache cleared successfully',
      clearedAt,
    };
  } catch (error: any) {
    await fail('Failed to clear cache', error.message);
    throw error;
  }
}

/**
 * Get comprehensive site analytics
 * 
 * @param agentName - Name of the agent querying
 * @returns Site analytics data
 */
export async function getSiteAnalytics(
  agentName: string = 'AI Agent'
): Promise<SiteAnalytics> {
  const { log, update, complete, fail } = await startLogging(
    'Query site analytics',
    {},
    agentName
  );

  try {
    await update('Gathering order statistics');
    const orderStats = await getOrderStats();

    await update('Gathering ticket statistics');
    const [totalTickets, openTickets, closedTickets] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.ticket.count({ where: { status: 'CLOSED' } }),
    ]);

    await update('Gathering blog post statistics');
    const [totalPosts, publishedPosts, draftPosts, trashedPosts] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.post.count({ where: { status: 'TRASHED' } }),
    ]);

    await update('Gathering user statistics');
    const [totalUsers, customers, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    await update('Gathering agent log statistics');
    const agentLogStats = await getLogStats();

    const analytics: SiteAnalytics = {
      orders: orderStats,
      tickets: {
        total: totalTickets,
        open: openTickets,
        closed: closedTickets,
      },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        trashed: trashedPosts,
      },
      users: {
        total: totalUsers,
        customers,
        admins,
      },
      agentLogs: agentLogStats,
    };

    await complete('Successfully gathered site analytics');
    return analytics;
  } catch (error: any) {
    await fail('Failed to get site analytics', error.message);
    throw error;
  }
}

/**
 * Perform a health check on the site
 * 
 * @returns Health check status
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: Date;
}> {
  const checks: Record<string, boolean> = {};
  const timestamp = new Date();

  try {
    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch {
      checks.database = false;
    }

    // Check if site config exists
    try {
      await getSiteConfig();
      checks.siteConfig = true;
    } catch {
      checks.siteConfig = false;
    }

    // TODO: Add more health checks
    // - LLM connection
    // - Pinecone connection
    // - WebSocket server
    // - External APIs

    const allHealthy = Object.values(checks).every(Boolean);
    const someHealthy = Object.values(checks).some(Boolean);

    return {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      checks,
      timestamp,
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      checks,
      timestamp,
    };
  }
}

export default {
  getSiteStatus,
  toggleMaintenanceMode,
  generateMaintenanceModeApprovalRequest,
  clearCache,
  getSiteAnalytics,
  healthCheck,
};
