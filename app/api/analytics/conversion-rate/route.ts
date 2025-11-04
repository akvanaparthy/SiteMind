import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/conversion-rate
 * Calculate conversion rate (mock implementation - needs session/visitor tracking)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // e.g., '30d', '7d', '90d'

    let dateFilter: any = {};
    if (period) {
      const days = parseInt(period.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { createdAt: { gte: startDate } };
    }

    // Get orders
    const orders = await prisma.order.findMany({
      where: dateFilter,
      select: {
        id: true,
        customerId: true,
      },
    });

    // Get unique customers who made purchases
    const uniqueCustomers = new Set(orders.map(o => o.customerId)).size;
    
    // Mock visitor data (in production, this would come from analytics service)
    // For now, we'll estimate based on customer count
    const estimatedVisitors = uniqueCustomers * 10; // Assume 10 visitors per customer
    const conversionRate = estimatedVisitors > 0 
      ? ((uniqueCustomers / estimatedVisitors) * 100).toFixed(2)
      : '0.00';

    // Calculate cart abandonment rate (mock)
    const totalOrders = orders.length;
    const deliveredOrders = await prisma.order.count({
      where: {
        ...dateFilter,
        status: 'DELIVERED',
      },
    });

    const abandonmentRate = totalOrders > 0
      ? (((totalOrders - deliveredOrders) / totalOrders) * 100).toFixed(2)
      : '0.00';

    return NextResponse.json({
      success: true,
      data: {
        conversionRate: `${conversionRate}%`,
        metrics: {
          totalOrders,
          uniqueCustomers,
          estimatedVisitors, // Note: This is mocked
          deliveredOrders,
        },
        abandonmentRate: `${abandonmentRate}%`,
        period: period || 'all-time',
        note: 'Visitor data is estimated. Integrate Google Analytics or similar for accurate tracking.',
      },
    });
  } catch (error) {
    console.error('Error fetching conversion rate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversion rate' },
      { status: 500 }
    );
  }
}
