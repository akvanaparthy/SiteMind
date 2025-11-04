import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * PATCH /api/products/:id/stock
 * Update product stock (set or adjust mode)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();
    const { quantity, mode = 'set' } = body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    let newStock: number;
    if (mode === 'adjust') {
      newStock = product.stock + quantity;
    } else {
      newStock = quantity;
    }

    // Prevent negative stock
    if (newStock < 0) {
      newStock = 0;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    return NextResponse.json({
      success: true,
      message: `Stock ${mode === 'adjust' ? 'adjusted' : 'set'} successfully`,
      data: {
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        previousStock: product.stock,
        newStock: updatedProduct.stock,
        mode,
      },
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product stock' },
      { status: 500 }
    );
  }
}
