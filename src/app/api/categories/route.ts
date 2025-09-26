import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // For now, return mock categories since we don't have a Category model
    // In a real app, you'd have a Category model in your schema
    const categories = [
      {
        id: 1,
        name: "Electronics",
        slug: "electronics",
        description: "Electronic devices and gadgets",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Clothing",
        slug: "clothing",
        description: "Fashion and apparel",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Photography",
        slug: "photography",
        description: "Camera equipment and accessories",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        name: "Accessories",
        slug: "accessories",
        description: "Various accessories and add-ons",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, isActive = true } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // For now, return a mock response since we don't have a Category model
    const category = {
      id: Date.now(),
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description,
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
