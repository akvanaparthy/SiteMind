import { NextRequest, NextResponse } from 'next/server';
import {
  createOrder,
  getOrder,
  getOrders,
  getPendingOrders,
  updateOrderStatus,
  generateRefundApprovalRequest,
  processRefund,
  cancelOrder,
  notifyCustomer,
  getOrderStats,
} from '@/lib/actions/orders';
import { OrderStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * GET /api/orders
 * Query orders with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status') as OrderStatus | null;
    const customerId = searchParams.get('customerId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const orderBy = searchParams.get('orderBy') as 'asc' | 'desc' | null;
    const pendingOnly = searchParams.get('pendingOnly') === 'true' || type === 'getPending';
    const stats = searchParams.get('stats') === 'true';

    // Get statistics if requested
    if (stats) {
      const orderStats = await getOrderStats();
      return NextResponse.json({ success: true, data: orderStats });
    }

    // Get pending orders if requested
    if (pendingOnly) {
      const orders = await getPendingOrders();
      return NextResponse.json({
        success: true,
        action: 'getPendingOrders',
        data: { orders },
        count: orders.length,
        timestamp: new Date().toISOString()
      });
    }

    // Handle type=get for agent tools compatibility
    if (type === 'get' && orderId) {
      const order = await getOrder(orderId);
      if (!order) {
        return NextResponse.json(
          { success: false, action: 'getOrder', error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ 
        success: true,
        action: 'getOrder', 
        data: { order },
        timestamp: new Date().toISOString()
      });
    }

    // Get single order if id or orderId is provided
    if (id || orderId) {
      const order = await getOrder(id ? parseInt(id) : orderId!);
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: order });
    }

    // Get multiple orders with filters
    const orders = await getOrders({
      ...(status && { status }),
      ...(customerId && { customerId: parseInt(customerId) }),
      ...(limit && { limit: parseInt(limit) }),
      ...(offset && { offset: parseInt(offset) }),
      ...(orderBy && { orderBy }),
    });

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error('[API] Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order OR perform order operations (refund, notify)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    // Handle refund requests
    if (type === 'refund') {
      const { id, orderId, reason } = body;
      const orderIdentifier = id || orderId;
      
      if (!orderIdentifier) {
        return NextResponse.json(
          { success: false, error: 'Missing required field: id or orderId' },
          { status: 400 }
        );
      }

      // Generate approval request first
      const approvalRequest = await generateRefundApprovalRequest(orderIdentifier, reason);
      
      return NextResponse.json({
        success: true,
        action: 'processRefund',
        message: 'Refund request pending approval',
        status: 'pending_approval',
        approval: approvalRequest,
      });
    }

    // Handle customer notification requests
    if (type === 'notify') {
      const { id, orderId, subject, message } = body;
      const orderIdentifier = id || orderId;
      
      if (!orderIdentifier || !subject || !message) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: id (or orderId), subject, message' },
          { status: 400 }
        );
      }

      const result = await notifyCustomer(orderIdentifier, { subject, message });
      
      return NextResponse.json({
        success: true,
        action: 'notifyCustomer',
        message: 'Customer notified successfully',
        data: result,
      });
    }

    // Default: Create new order
    const { customerId, items, total, status, shippingInfo } = body;

    if (!items || !total) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: items, total' },
        { status: 400 }
      );
    }

    // For guest checkout, use a default guest customer (or create one)
    let finalCustomerId = customerId;
    if (!finalCustomerId) {
      // Find or create a guest user
      const guestUser = await prisma.user.findFirst({
        where: { email: shippingInfo?.email || 'guest@sitemind.com' }
      });
      
      if (guestUser) {
        finalCustomerId = guestUser.id;
      } else {
        // Create guest user
        const newGuest = await prisma.user.create({
          data: {
            email: shippingInfo?.email || 'guest@sitemind.com',
            name: shippingInfo?.fullName || 'Guest',
            role: 'USER',
          }
        });
        finalCustomerId = newGuest.id;
      }
    }

    const order = await createOrder({
      customerId: finalCustomerId,
      items,
      total,
      status,
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error processing order request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders
 * Update order status
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, orderId, status } = body;

    // Support both id and orderId fields
    const orderIdentifier = id || orderId;

    if (!orderIdentifier || !status) {
      return NextResponse.json(
        { success: false, action: 'updateOrderStatus', error: 'Missing required fields: (id or orderId) and status' },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(orderIdentifier, status as OrderStatus);

    return NextResponse.json({
      success: true,
      action: 'updateOrderStatus',
      data: { order },
      message: 'Order status updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Error updating order:', error);
    return NextResponse.json(
      { success: false, action: 'updateOrderStatus', error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders
 * Delete an order (for testing purposes)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Delete the order directly
    await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: `Order #${id} deleted successfully`,
    });
  } catch (error: any) {
    console.error('[API] Error deleting order:', error);
    
    // Check if it's a "not found" error (Prisma error code P2025)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: `Order not found or already deleted` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}
