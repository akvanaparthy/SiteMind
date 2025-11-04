import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/csat
 * Get Customer Satisfaction Score (based on ticket resolution and feedback)
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

    const tickets = await prisma.ticket.findMany({
      where: dateFilter,
      select: {
        status: true,
        priority: true,
        createdAt: true,
        closedAt: true,
        resolution: true,
      },
    });

    const totalTickets = tickets.length;
    const closedTickets = tickets.filter(t => t.status === 'CLOSED').length;
    const openTickets = tickets.filter(t => t.status === 'OPEN').length;
    const resolvedTickets = tickets.filter(t => t.resolution).length;

    // Calculate average resolution time (for closed tickets with closedAt)
    const resolvedWithTime = tickets.filter(t => t.closedAt);
    let avgResolutionTime = 0;
    if (resolvedWithTime.length > 0) {
      const totalTime = resolvedWithTime.reduce((sum, ticket) => {
        const created = new Date(ticket.createdAt).getTime();
        const closed = new Date(ticket.closedAt!).getTime();
        return sum + (closed - created);
      }, 0);
      avgResolutionTime = totalTime / resolvedWithTime.length / (1000 * 60 * 60); // Convert to hours
    }

    // Calculate satisfaction score (simple model: closed tickets with resolution / total tickets)
    const satisfactionScore = totalTickets > 0 
      ? ((resolvedTickets / totalTickets) * 100).toFixed(2)
      : '0.00';

    // Priority breakdown
    const priorityBreakdown = {
      LOW: tickets.filter(t => t.priority === 'LOW').length,
      MEDIUM: tickets.filter(t => t.priority === 'MEDIUM').length,
      HIGH: tickets.filter(t => t.priority === 'HIGH').length,
      URGENT: tickets.filter(t => t.priority === 'URGENT').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        satisfactionScore: `${satisfactionScore}%`,
        tickets: {
          total: totalTickets,
          open: openTickets,
          closed: closedTickets,
          resolved: resolvedTickets,
        },
        averageResolutionTime: `${avgResolutionTime.toFixed(2)} hours`,
        priorityBreakdown,
        period: period || 'all-time',
      },
    });
  } catch (error) {
    console.error('Error fetching CSAT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer satisfaction score' },
      { status: 500 }
    );
  }
}
