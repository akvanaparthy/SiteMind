import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/revenue
 * Get revenue report with date range filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day';

    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
    const deliveredRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
    const refundedRevenue = orders
      .filter(o => o.status === 'REFUNDED')
      .reduce((sum, order) => sum + order.total, 0);

    // Group by day/week/month
    const groupedData: any = {};
    orders.forEach(order => {
      let key: string;
      const date = new Date(order.createdAt);
      
      if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'week') {
        const weekNum = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-W${weekNum}`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!groupedData[key]) {
        groupedData[key] = { revenue: 0, orders: 0 };
      }
      groupedData[key].revenue += order.total;
      groupedData[key].orders += 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          deliveredRevenue: deliveredRevenue.toFixed(2),
          refundedRevenue: refundedRevenue.toFixed(2),
          totalOrders: orders.length,
          deliveredOrders: deliveredOrders.length,
          averageOrderValue: orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00',
        },
        breakdown: Object.entries(groupedData).map(([period, data]: [string, any]) => ({
          period,
          revenue: data.revenue.toFixed(2),
          orders: data.orders,
        })),
        dateRange: {
          start: startDate || orders[0]?.createdAt || null,
          end: endDate || orders[orders.length - 1]?.createdAt || null,
        },
        groupBy,
      },
    });
  } catch (error) {
    console.error('Error fetching revenue report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue report' },
      { status: 500 }
    );
  }
}
