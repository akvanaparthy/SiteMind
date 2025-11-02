import { NextRequest, NextResponse } from 'next/server';
import {
  getSiteStatus,
  toggleMaintenanceMode,
  generateMaintenanceModeApprovalRequest,
  clearCache,
  getSiteAnalytics,
  healthCheck,
} from '@/lib/actions/site-control';

/**
 * GET /api/site
 * Get site status, analytics, or health check
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'status';

    switch (type) {
      case 'status':
        const status = await getSiteStatus();
        return NextResponse.json({ success: true, data: status });

      case 'analytics':
        const analytics = await getSiteAnalytics();
        return NextResponse.json({ success: true, data: analytics });

      case 'health':
        const health = await healthCheck();
        return NextResponse.json({ success: true, data: health });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[API] Error fetching site data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch site data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/site
 * Perform site actions: maintenance, cache, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, enabled, approvalId, reason } = body;

    // Support both 'action' and 'type' fields for backwards compatibility
    const operationType = action || type;

    if (!operationType) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: action or type' },
        { status: 400 }
      );
    }

    let result;
    
    // Normalize operation names (support both formats)
    switch (operationType) {
      case 'maintenance':
        if (enabled === undefined) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: enabled' },
            { status: 400 }
          );
        }
        result = await toggleMaintenanceMode(enabled, approvalId);
        break;

      case 'maintenance-approval':
        if (enabled === undefined || !reason) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: enabled, reason' },
            { status: 400 }
          );
        }
        result = await generateMaintenanceModeApprovalRequest(enabled, reason);
        break;

      case 'cache-clear':
      case 'clearCache':  // Support both formats
        result = await clearCache();
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${operationType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Site ${operationType} completed successfully`,
    });
  } catch (error: any) {
    console.error('[API] Error performing site action:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to perform site action' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/site
 * Alternative endpoint for maintenance toggle (supports legacy API clients)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, enabled, approvalId } = body;

    if (type === 'maintenance') {
      if (enabled === undefined) {
        return NextResponse.json(
          { success: false, error: 'Missing required field: enabled' },
          { status: 400 }
        );
      }
      
      const result = await toggleMaintenanceMode(enabled, approvalId);
      
      return NextResponse.json({
        success: true,
        data: result,
        message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown operation type: ${type}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API] Error updating site settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
