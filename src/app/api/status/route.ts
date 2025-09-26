import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    // Get site configuration
    const siteConfig = await prisma.siteConfig.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // Get basic stats
    const [totalOrders, totalPosts, totalTickets, totalUsers] =
      await Promise.all([
        prisma.order.count(),
        prisma.post.count(),
        prisma.ticket.count(),
        prisma.user.count(),
      ]);

    const openTickets = await prisma.ticket.count({
      where: { status: "OPEN" },
    });

    const publishedPosts = await prisma.post.count({
      where: { status: "PUBLISHED" },
    });

    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({
      maintenanceMode: siteConfig?.maintenanceMode || false,
      lastCacheClear: siteConfig?.lastCacheClear,
      stats: {
        totalOrders,
        totalPosts,
        totalTickets,
        totalUsers,
        openTickets,
        publishedPosts,
        pendingOrders,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching site status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { maintenanceMode, clearCache } = body;

    let siteConfig = await prisma.siteConfig.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!siteConfig) {
      siteConfig = await prisma.siteConfig.create({
        data: {
          maintenanceMode: maintenanceMode || false,
          lastCacheClear: clearCache ? new Date() : null,
        },
      });
    } else {
      siteConfig = await prisma.siteConfig.update({
        where: { id: siteConfig.id },
        data: {
          maintenanceMode:
            maintenanceMode !== undefined
              ? maintenanceMode
              : siteConfig.maintenanceMode,
          lastCacheClear: clearCache ? new Date() : siteConfig.lastCacheClear,
        },
      });
    }

    return NextResponse.json({
      maintenanceMode: siteConfig.maintenanceMode,
      lastCacheClear: siteConfig.lastCacheClear,
      message: "Site configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating site status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
