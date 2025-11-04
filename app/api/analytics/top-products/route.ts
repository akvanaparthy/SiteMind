import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/top-products
 * Get best-selling products by units or revenue
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const sortBy = searchParams.get('sortBy') || 'units';
    const period = searchParams.get('period'); // e.g., '30d', '7d', '90d'

    let dateFilter: any = {};
    if (period) {
      const days = parseInt(period.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { createdAt: { gte: startDate } };
    }

    // Get all orders with items
    const orders = await prisma.order.findMany({
      where: dateFilter,
      select: {
        items: true,
        total: true,
      },
    });

    // Aggregate product data
    const productStats: any = {};
    
    orders.forEach(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item: any) => {
        const productId = item.productId || item.id;
        if (!productStats[productId]) {
          productStats[productId] = {
            productId,
            name: item.name,
            unitsSold: 0,
            revenue: 0,
          };
        }
        productStats[productId].unitsSold += item.quantity || 1;
        productStats[productId].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    // Convert to array and sort
    let topProducts = Object.values(productStats);
    
    if (sortBy === 'revenue') {
      topProducts.sort((a: any, b: any) => b.revenue - a.revenue);
    } else {
      topProducts.sort((a: any, b: any) => b.unitsSold - a.unitsSold);
    }

    // Take top N
    topProducts = topProducts.slice(0, limit);

    // Format revenue
    topProducts = topProducts.map((p: any) => ({
      ...p,
      revenue: p.revenue.toFixed(2),
    }));

    return NextResponse.json({
      success: true,
      data: topProducts,
      meta: {
        limit,
        sortBy,
        period: period || 'all-time',
        count: topProducts.length,
      },
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top products' },
      { status: 500 }
    );
  }
}
