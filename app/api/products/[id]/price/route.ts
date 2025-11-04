import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * PATCH /api/products/:id/price
 * Update product price
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();
    const { price } = body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { price: parseFloat(price) },
    });

    return NextResponse.json({
      success: true,
      message: 'Price updated successfully',
      data: {
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        previousPrice: product.price,
        newPrice: updatedProduct.price,
      },
    });
  } catch (error) {
    console.error('Error updating product price:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product price' },
      { status: 500 }
    );
  }
}
