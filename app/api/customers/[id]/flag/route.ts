import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/customers/:id/flag
 * Flag a customer for review
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);
    const body = await request.json();
    const { reason, severity = 'MEDIUM' } = body;

    // Check if customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Create a log entry for the flag
    await prisma.agentLog.create({
      data: {
        taskId: `flag_customer_${customerId}_${Date.now()}`,
        task: `Customer flagged: ${customer.name} (${customer.email})`,
        status: 'SUCCESS',
        details: {
          customerId,
          customerName: customer.name,
          customerEmail: customer.email,
          reason,
          severity,
          flaggedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Customer ${customer.name} flagged successfully`,
      data: {
        customerId,
        customerName: customer.name,
        reason,
        severity,
        flaggedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error flagging customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to flag customer' },
      { status: 500 }
    );
  }
}
