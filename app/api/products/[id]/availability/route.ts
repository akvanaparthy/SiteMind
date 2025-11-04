import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * PATCH /api/products/:id/availability
 * Toggle product availability (active/inactive)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();
    const { active } = body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: { active: Boolean(active) },
    });

    return NextResponse.json({
      success: true,
      message: `Product ${active ? 'activated' : 'deactivated'} successfully`,
      data: {
        productId: product.id,
        productName: product.name,
        active: product.active,
      },
    });
  } catch (error: any) {
    console.error('Error toggling product availability:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to toggle product availability' },
      { status: 500 }
    );
  }
}
