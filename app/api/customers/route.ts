import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/customers
 * List all customers with optional pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build query options
    const queryOptions: any = {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    };

    // Add pagination if provided
    if (limit) {
      queryOptions.take = parseInt(limit);
    }
    if (offset) {
      queryOptions.skip = parseInt(offset);
    }

    // Get customers
    const customers = await prisma.user.findMany(queryOptions);

    // Get total count
    const totalCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      action: 'listCustomers',
      data: { customers },
      count: customers.length,
      totalCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Error listing customers:', error);
    return NextResponse.json(
      { 
        success: false, 
        action: 'listCustomers',
        error: error.message || 'Failed to list customers' 
      },
      { status: 500 }
    );
  }
}
