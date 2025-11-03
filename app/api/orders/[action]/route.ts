import { NextRequest, NextResponse } from 'next/server';
import {
  generateRefundApprovalRequest,
  processRefund,
  cancelOrder,
  notifyCustomer,
} from '@/lib/actions/orders';

/**
 * POST /api/orders/[action]
 * Special actions: refund-approval, refund, cancel, notify
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const body = await request.json();
    const { id, reason, approvalId, message } = body;
    const { action } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'refund-approval':
        if (!reason) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: reason' },
            { status: 400 }
          );
        }
        result = await generateRefundApprovalRequest(id, reason);
        return NextResponse.json({
          success: true,
          data: result,
          message: 'Refund approval request generated',
        });

      case 'refund':
        if (!reason || !approvalId) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: reason, approvalId' },
            { status: 400 }
          );
        }
        result = await processRefund(id, reason, approvalId);
        break;

      case 'cancel':
        if (!reason) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: reason' },
            { status: 400 }
          );
        }
        result = await cancelOrder(id, reason);
        break;

      case 'notify':
        if (!message) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: message' },
            { status: 400 }
          );
        }
        result = await notifyCustomer(id, message);
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Order ${action} completed successfully`,
    });
  } catch (error: any) {
    const { action } = await params;
    console.error(`[API] Error ${action}ing order:`, error);
    return NextResponse.json(
      { success: false, error: error.message || `Failed to ${action} order` },
      { status: 500 }
    );
  }
}
