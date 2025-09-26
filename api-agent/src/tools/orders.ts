import { prisma } from "../../../src/lib/prisma";

export class OrdersTool {
  async refundOrder(orderId: string): Promise<string> {
    try {
      // Find order by orderId
      const order = await prisma.order.findFirst({
        where: { orderId },
        include: { customer: true },
      });

      if (!order) {
        throw new Error(`Order #${orderId} not found`);
      }

      if (order.status === "REFUNDED") {
        return `Order #${orderId} is already refunded`;
      }

      // Mock payment refund (in real app, this would call Stripe/PayPal API)
      console.log(
        `Mock: Processing refund for order #${orderId}, amount: $${order.total}`
      );

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "REFUNDED" },
      });

      // Mock email notification
      console.log(
        `Mock: Sending refund confirmation email to ${order.customer.email}`
      );

      return `Refund processed for $${order.total}. Email sent to ${order.customer.email}`;
    } catch (error) {
      throw new Error(
        `Failed to refund order #${orderId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<string> {
    try {
      const order = await prisma.order.findFirst({
        where: { orderId },
      });

      if (!order) {
        throw new Error(`Order #${orderId} not found`);
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { status: status.toUpperCase() as any },
      });

      return `Order #${orderId} status updated to ${status}`;
    } catch (error) {
      throw new Error(
        `Failed to update order #${orderId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getOrders(status?: string): Promise<any[]> {
    try {
      const where = status ? { status: status.toUpperCase() as any } : {};

      const orders = await prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return orders;
    } catch (error) {
      throw new Error(
        `Failed to fetch orders: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getOrderById(orderId: string): Promise<any> {
    try {
      const order = await prisma.order.findFirst({
        where: { orderId },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error(`Order #${orderId} not found`);
      }

      return order;
    } catch (error) {
      throw new Error(
        `Failed to fetch order #${orderId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
