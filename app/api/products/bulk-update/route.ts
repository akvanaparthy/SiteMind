import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/products/bulk-update
 * Bulk update products (price, stock, availability)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productIds, value } = body;

    if (!action || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: action and productIds array required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    switch (action) {
      case 'update_price':
        if (value === undefined) {
          return NextResponse.json(
            { success: false, error: 'Price value required for update_price action' },
            { status: 400 }
          );
        }
        updateData.price = parseFloat(value);
        break;
      
      case 'update_stock':
        if (value === undefined) {
          return NextResponse.json(
            { success: false, error: 'Stock value required for update_stock action' },
            { status: 400 }
          );
        }
        updateData.stock = parseInt(value);
        break;
      
      case 'toggle_availability':
        if (value === undefined) {
          return NextResponse.json(
            { success: false, error: 'Active value required for toggle_availability action' },
            { status: 400 }
          );
        }
        updateData.active = Boolean(value);
        break;
      
      case 'mark_featured':
        updateData.featured = true;
        break;
      
      case 'unmark_featured':
        updateData.featured = false;
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: productIds.map((id: any) => parseInt(id)),
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Bulk update completed: ${result.count} products updated`,
      data: {
        action,
        productsUpdated: result.count,
        productIds,
      },
    });
  } catch (error) {
    console.error('Error performing bulk update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk update' },
      { status: 500 }
    );
  }
}
