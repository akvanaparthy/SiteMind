import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");

    const where = status
      ? { status: status as "PENDING" | "SUCCESS" | "FAILED" }
      : {};

    const logs = await prisma.agentLog.findMany({
      where,
      include: {
        children: {
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
