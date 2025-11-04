import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/products/low-stock
 * Get products with stock below threshold
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threshold = searchParams.get('threshold') ? parseInt(searchParams.get('threshold')!) : 10;

    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: threshold,
        },
        active: true,
      },
      orderBy: {
        stock: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      threshold,
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch low stock products' },
      { status: 500 }
    );
  }
}
