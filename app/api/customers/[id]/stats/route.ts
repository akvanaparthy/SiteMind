import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/customers/:id/stats
 * Get customer statistics (total orders, total spent, average order value, ticket count)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    // Get customer with order and ticket counts
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          select: {
            total: true,
            status: true,
          },
        },
        tickets: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalOrders = customer.orders.length;
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    const totalTickets = customer.tickets.length;
    const openTickets = customer.tickets.filter(t => t.status === 'OPEN').length;
    const closedTickets = customer.tickets.filter(t => t.status === 'CLOSED').length;

    const ordersByStatus = {
      pending: customer.orders.filter(o => o.status === 'PENDING').length,
      delivered: customer.orders.filter(o => o.status === 'DELIVERED').length,
      refunded: customer.orders.filter(o => o.status === 'REFUNDED').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        orders: {
          total: totalOrders,
          byStatus: ordersByStatus,
        },
        revenue: {
          totalSpent: totalSpent.toFixed(2),
          averageOrderValue: averageOrderValue.toFixed(2),
        },
        tickets: {
          total: totalTickets,
          open: openTickets,
          closed: closedTickets,
        },
        memberSince: customer.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer statistics' },
      { status: 500 }
    );
  }
}
