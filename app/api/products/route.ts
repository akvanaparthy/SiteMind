import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/products
 * Get all products or filter by criteria
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const active = searchParams.get('active');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const slug = searchParams.get('slug');
    const search = searchParams.get('search');

    // Get single product by slug
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
      });
      
      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: product });
    }

    // Build where clause for filters and search
    const where: any = {
      ...(category && { category }),
      ...(featured && { featured: true }),
      ...(active !== null && { active: active === 'true' }),
    };

    // Add text search if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get multiple products with filters
    const products = await prisma.product.findMany({
      where,
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
      orderBy: { createdAt: 'desc' },
    });

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    return NextResponse.json({
      success: true,
      action: 'listProducts',
      data: { products },
      count: products.length,
      totalCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, price, stock, category, images, featured, active } = body;

    if (!name || !slug || !description || price === undefined || stock === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, slug, description, price, stock' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        images,
        featured: featured || false,
        active: active !== false, // Default to true
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products
 * Update a product
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, description, price, stock, category, images, featured, active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(category && { category }),
        ...(images && { images }),
        ...(featured !== undefined && { featured }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error: any) {
    console.error('[API] Error updating product:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products?id=123
 * Delete a product
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('[API] Error deleting product:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
