import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/customers/:id/tickets
 * Get all support tickets for a specific customer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { customerId };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error('Error fetching customer tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer tickets' },
      { status: 500 }
    );
  }
}
