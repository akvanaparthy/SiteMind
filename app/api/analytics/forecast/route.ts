import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/forecast
 * Generate sales forecast based on historical data (simple linear projection)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // Forecast period

    // Get historical data (last 90 days)
    const historicalDays = 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - historicalDays);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'DELIVERED',
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (orders.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          forecast: '0.00',
          confidence: 'low',
          note: 'Insufficient historical data for accurate forecast',
        },
      });
    }

    // Calculate daily revenue
    const dailyRevenue: { [key: string]: number } = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + order.total;
    });

    // Calculate average daily revenue
    const days = Object.keys(dailyRevenue).length;
    const totalRevenue = Object.values(dailyRevenue).reduce((sum, rev) => sum + rev, 0);
    const avgDailyRevenue = totalRevenue / days;

    // Simple linear forecast
    const forecastDays = parseInt(period.replace('d', ''));
    const forecastedRevenue = avgDailyRevenue * forecastDays;

    // Calculate growth trend
    const firstHalfRevenue = orders
      .slice(0, Math.floor(orders.length / 2))
      .reduce((sum, o) => sum + o.total, 0);
    const secondHalfRevenue = orders
      .slice(Math.floor(orders.length / 2))
      .reduce((sum, o) => sum + o.total, 0);
    
    const growthRate = firstHalfRevenue > 0 
      ? (((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100).toFixed(2)
      : '0.00';

    // Adjust forecast by growth rate
    const adjustedForecast = forecastedRevenue * (1 + parseFloat(growthRate) / 100);

    return NextResponse.json({
      success: true,
      data: {
        forecast: adjustedForecast.toFixed(2),
        period: `${forecastDays} days`,
        historical: {
          days: historicalDays,
          totalRevenue: totalRevenue.toFixed(2),
          avgDailyRevenue: avgDailyRevenue.toFixed(2),
          orderCount: orders.length,
        },
        trend: {
          growthRate: `${growthRate}%`,
          direction: parseFloat(growthRate) > 0 ? 'up' : parseFloat(growthRate) < 0 ? 'down' : 'flat',
        },
        confidence: days >= 60 ? 'high' : days >= 30 ? 'medium' : 'low',
        note: 'Forecast uses simple linear projection with growth adjustment. Consider external factors.',
      },
    });
  } catch (error) {
    console.error('Error generating sales forecast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate sales forecast' },
      { status: 500 }
    );
  }
}
