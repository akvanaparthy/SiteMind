import { Order, OrderStatus, Prisma } from '@prisma/client';
import prisma from '../prisma';
import { startLogging } from '../agent-logger';

/**
 * Approval request for critical operations
 */
export interface ApprovalRequest {
  id: string;
  action: 'refund' | 'cancel' | 'other';
  orderId: string;
  amount: number;
  reason: string;
  requestedAt: Date;
  requestedBy: string;
}

/**
 * Options for creating an order
 */
export interface CreateOrderOptions {
  customerId: number;
  items: Array<{
    productId: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status?: OrderStatus;
}

/**
 * Options for querying orders
 */
export interface GetOrdersOptions {
  status?: OrderStatus;
  customerId?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
}

/**
 * Create a new order
 * 
 * @param options - Order creation options
 * @param agentName - Name of the agent creating the order
 * @returns The created order
 */
export async function createOrder(
  options: CreateOrderOptions,
  agentName: string = 'AI Agent'
): Promise<Order> {
  const { log, update, complete, fail } = await startLogging(
    `Create order for customer #${options.customerId}`,
    { customerId: options.customerId, total: options.total },
    agentName
  );

  try {
    await update('Verifying customer exists');
    const customer = await prisma.user.findUnique({
      where: { id: options.customerId },
    });

    if (!customer) {
      await fail('Customer not found', `No user found with ID: ${options.customerId}`);
      throw new Error(`Customer with ID ${options.customerId} not found`);
    }

    await update('Creating order in database');
    const order = await prisma.order.create({
      data: {
        customerId: options.customerId,
        items: options.items as unknown as Prisma.InputJsonValue,
        total: options.total,
        status: options.status || OrderStatus.PENDING,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await complete(`Successfully created order #${order.orderId}`);
    return order;
  } catch (error: any) {
    await fail('Failed to create order', error.message);
    throw error;
  }
}

/**
 * Get an order by ID or orderId
 * 
 * @param idOrOrderId - Order ID or orderId string
 * @param agentName - Name of the agent querying
 * @returns The order or null if not found
 */
export async function getOrder(
  idOrOrderId: number | string,
  agentName: string = 'AI Agent'
): Promise<Order | null> {
  const { log, update, complete, fail } = await startLogging(
    `Query order: ${idOrOrderId}`,
    { identifier: idOrOrderId },
    agentName
  );

  try {
    await update('Searching database for order');
    const order = typeof idOrOrderId === 'number'
      ? await prisma.order.findUnique({
          where: { id: idOrOrderId },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
      : await prisma.order.findUnique({
          where: { orderId: idOrOrderId },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

    if (!order) {
      await fail('Order not found', `No order found with identifier: ${idOrOrderId}`);
      return null;
    }

    await complete(`Successfully retrieved order #${order.orderId}`);
    return order;
  } catch (error: any) {
    await fail('Failed to query order', error.message);
    throw error;
  }
}

/**
 * Get multiple orders with filtering
 * 
 * @param options - Query options
 * @returns Array of orders
 */
export async function getOrders(options: GetOrdersOptions = {}): Promise<Order[]> {
  try {
    const {
      status,
      customerId,
      limit,
      offset,
      orderBy = 'desc',
    } = options;

    const orders = await prisma.order.findMany({
      where: {
        ...(status && { status }),
        ...(customerId && { customerId }),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: orderBy,
      },
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
    });

    return orders;
  } catch (error: any) {
    throw new Error(`Failed to query orders: ${error.message}`);
  }
}

/**
 * Get all pending orders
 * 
 * @param agentName - Name of the agent querying
 * @returns Array of pending orders
 */
export async function getPendingOrders(agentName: string = 'AI Agent'): Promise<Order[]> {
  const { log, update, complete, fail } = await startLogging(
    'Query all pending orders',
    {},
    agentName
  );

  try {
    await update('Fetching pending orders from database');
    const orders = await getOrders({ status: OrderStatus.PENDING });

    await complete(`Found ${orders.length} pending orders`);
    return orders;
  } catch (error: any) {
    await fail('Failed to query pending orders', error.message);
    throw error;
  }
}

/**
 * Update order status
 * 
 * @param idOrOrderId - Order ID (number) or orderId (string CUID)
 * @param status - New order status
 * @param agentName - Name of the agent updating
 * @returns The updated order
 */
export async function updateOrderStatus(
  idOrOrderId: number | string,
  status: OrderStatus,
  agentName: string = 'AI Agent'
): Promise<Order> {
  const { log, update, complete, fail } = await startLogging(
    `Update order #${idOrOrderId} status to ${status}`,
    { identifier: idOrOrderId, status },
    agentName
  );

  try {
    await update('Verifying order exists');
    const existingOrder = typeof idOrOrderId === 'number'
      ? await prisma.order.findUnique({ where: { id: idOrOrderId } })
      : await prisma.order.findUnique({ where: { orderId: idOrOrderId } });

    if (!existingOrder) {
      await fail('Order not found', `No order found with identifier: ${idOrOrderId}`);
      throw new Error(`Order with identifier ${idOrOrderId} not found`);
    }

    await update(`Updating order status to ${status}`);
    const order = await prisma.order.update({
      where: typeof idOrOrderId === 'number' ? { id: idOrOrderId } : { orderId: idOrOrderId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await complete(`Successfully updated order #${order.orderId} to ${status}`);
    return order;
  } catch (error: any) {
    await fail('Failed to update order status', error.message);
    throw error;
  }
}

/**
 * Generate an approval request for refund
 * This function prepares the data needed for user approval
 * 
 * @param orderId - Order ID
 * @param reason - Reason for refund
 * @param agentName - Name of the agent requesting
 * @returns Approval request object
 */
export async function generateRefundApprovalRequest(
  orderId: number,
  reason: string,
  agentName: string = 'AI Agent'
): Promise<ApprovalRequest> {
  const { log, update, complete, fail } = await startLogging(
    `Generate refund approval request for order #${orderId}`,
    { orderId, reason },
    agentName
  );

  try {
    await update('Fetching order details');
    const order = await getOrder(orderId, agentName);

    if (!order) {
      await fail('Order not found', `No order found with ID: ${orderId}`);
      throw new Error(`Order with ID ${orderId} not found`);
    }

    if (order.status === OrderStatus.REFUNDED) {
      await fail('Order already refunded', 'This order has already been refunded');
      throw new Error('Order has already been refunded');
    }

    await update('Generating approval request');
    const approvalRequest: ApprovalRequest = {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action: 'refund',
      orderId: order.orderId,
      amount: order.total,
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
 * Process a refund for an order (requires prior approval)
 * 
 * @param orderId - Order ID
 * @param reason - Reason for refund
 * @param approvalId - Approval request ID (from generateRefundApprovalRequest)
 * @param agentName - Name of the agent processing
 * @returns The refunded order
 */
export async function processRefund(
  orderId: number,
  reason: string,
  approvalId: string,
  agentName: string = 'AI Agent'
): Promise<Order> {
  const { log, update, complete, fail } = await startLogging(
    `Process refund for order #${orderId}`,
    { orderId, reason, approvalId },
    agentName
  );

  try {
    await update('Verifying order exists');
    const order = await getOrder(orderId, agentName);

    if (!order) {
      await fail('Order not found', `No order found with ID: ${orderId}`);
      throw new Error(`Order with ID ${orderId} not found`);
    }

    if (order.status === OrderStatus.REFUNDED) {
      await complete('Order already refunded');
      return order;
    }

    await update('Checking refund eligibility');
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.PENDING) {
      await fail('Order not eligible for refund', `Order status is ${order.status}`);
      throw new Error(`Order with status ${order.status} is not eligible for refund`);
    }

    await update('Processing refund via payment gateway (mock)');
    // TODO: Integrate with actual payment gateway (Stripe, PayPal, etc.)
    // await paymentGateway.refund(order.orderId, order.total);

    await update('Updating order status to REFUNDED');
    const refundedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.REFUNDED,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await update('Sending refund confirmation email (mock)');
    // TODO: Send actual email notification
    // await sendEmail({
    //   to: order.customer.email,
    //   subject: `Refund Processed for Order #${order.orderId}`,
    //   body: `Your refund of $${order.total} has been processed.`
    // });

    await complete(`Successfully refunded order #${refundedOrder.orderId} ($${refundedOrder.total})`);
    return refundedOrder;
  } catch (error: any) {
    await fail('Failed to process refund', error.message);
    throw error;
  }
}

/**
 * Cancel an order (requires prior approval for certain statuses)
 * 
 * @param orderId - Order ID
 * @param reason - Reason for cancellation
 * @param agentName - Name of the agent canceling
 * @returns The canceled order
 */
export async function cancelOrder(
  orderId: number,
  reason: string,
  agentName: string = 'AI Agent'
): Promise<Order> {
  const { log, update, complete, fail } = await startLogging(
    `Cancel order #${orderId}`,
    { orderId, reason },
    agentName
  );

  try {
    await update('Verifying order exists');
    const order = await getOrder(orderId, agentName);

    if (!order) {
      await fail('Order not found', `No order found with ID: ${orderId}`);
      throw new Error(`Order with ID ${orderId} not found`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      await complete('Order already canceled');
      return order;
    }

    if (order.status === OrderStatus.DELIVERED) {
      await fail('Cannot cancel delivered order', 'Use refund instead for delivered orders');
      throw new Error('Cannot cancel a delivered order. Use refund instead.');
    }

    await update('Canceling order');
    const canceledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await update('Sending cancellation notification (mock)');
    // TODO: Send actual email notification

    await complete(`Successfully canceled order #${canceledOrder.orderId}`);
    return canceledOrder;
  } catch (error: any) {
    await fail('Failed to cancel order', error.message);
    throw error;
  }
}

/**
 * Send notification to customer about their order
 * 
 * @param idOrOrderId - Order ID (number) or orderId (string CUID)
 * @param notificationData - Notification details {subject, message}
 * @param agentName - Name of the agent sending notification
 * @returns Success status
 */
export async function notifyCustomer(
  idOrOrderId: number | string,
  notificationData: { subject: string; message: string } | string,
  agentName: string = 'AI Agent'
): Promise<{ success: boolean; message: string }> {
  // Handle backward compatibility: if notificationData is a string, treat it as message
  const notification = typeof notificationData === 'string'
    ? { subject: 'Order Update', message: notificationData }
    : notificationData;

  const { log, update, complete, fail } = await startLogging(
    `Send notification for order #${idOrOrderId}`,
    { identifier: idOrOrderId, ...notification },
    agentName
  );

  try {
    await update('Fetching order and customer details');
    const order = typeof idOrOrderId === 'number'
      ? await prisma.order.findUnique({
          where: { id: idOrOrderId },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
      : await prisma.order.findUnique({
          where: { orderId: idOrOrderId },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

    if (!order) {
      await fail('Order not found', `No order found with identifier: ${idOrOrderId}`);
      throw new Error(`Order with identifier ${idOrOrderId} not found`);
    }

    await update(`Sending notification to ${order.customer.email} (mock)`);
    // TODO: Send actual email notification
    // await sendEmail({
    //   to: order.customer.email,
    //   subject: notification.subject || `Update on Order #${order.orderId}`,
    //   body: notification.message
    // });

    await complete(`Notification sent to customer`);
    return {
      success: true,
      message: `Notification sent to ${order.customer.email}`,
    };
  } catch (error: any) {
    await fail('Failed to send notification', error.message);
    throw error;
  }
}

/**
 * Get order statistics
 * 
 * @returns Order statistics
 */
export async function getOrderStats() {
  try {
    const [total, pending, delivered, refunded, cancelled] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { status: OrderStatus.REFUNDED } }),
      prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
    ]);

    const totalRevenue = await prisma.order.aggregate({
      where: { status: OrderStatus.DELIVERED },
      _sum: { total: true },
    });

    return {
      total,
      pending,
      delivered,
      refunded,
      cancelled,
      revenue: totalRevenue._sum.total || 0,
      deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(2) + '%' : '0%',
    };
  } catch (error: any) {
    throw new Error(`Failed to get order stats: ${error.message}`);
  }
}

export default {
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
};
