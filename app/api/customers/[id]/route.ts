import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/customers/:id
 * Get customer details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        _count: {
          select: {
            orders: true,
            tickets: true,
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

    return NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
        createdAt: customer.createdAt,
        orderCount: customer._count.orders,
        ticketCount: customer._count.tickets,
      },
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customers/:id
 * Update customer information
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);
    const body = await request.json();
    const { name, email, phone } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    // Note: phone is not in current schema, but included for future

    const customer = await prisma.user.update({
      where: { id: customerId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}
