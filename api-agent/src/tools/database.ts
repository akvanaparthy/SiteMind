import { prisma } from "../../../src/lib/prisma";

export class DatabaseTool {
  async query(queryType: string, parameters: any = {}): Promise<any[]> {
    try {
      switch (queryType) {
        case "orders":
          return await this.getOrders(parameters);
        case "posts":
          return await this.getPosts(parameters);
        case "tickets":
          return await this.getTickets(parameters);
        case "users":
          return await this.getUsers(parameters);
        case "products":
          return await this.getProducts(parameters);
        case "analytics":
          return await this.getAnalytics(parameters);
        default:
          throw new Error(`Unknown query type: ${queryType}`);
      }
    } catch (error) {
      throw new Error(
        `Database query failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async getOrders(parameters: any): Promise<any[]> {
    const where = parameters.status
      ? { status: parameters.status.toUpperCase() }
      : {};

    return await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parameters.limit || 50,
    });
  }

  private async getPosts(parameters: any): Promise<any[]> {
    const where = parameters.status
      ? { status: parameters.status.toUpperCase() }
      : {};

    return await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parameters.limit || 50,
    });
  }

  private async getTickets(parameters: any): Promise<any[]> {
    const where = parameters.status
      ? { status: parameters.status.toUpperCase() }
      : {};

    return await prisma.ticket.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parameters.limit || 50,
    });
  }

  private async getUsers(parameters: any): Promise<any[]> {
    const where = parameters.role
      ? { role: parameters.role.toUpperCase() }
      : {};

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: parameters.limit || 50,
    });
  }

  private async getProducts(parameters: any): Promise<any[]> {
    const where: any = {};

    if (parameters.category) {
      where.category = parameters.category;
    }

    if (parameters.active !== undefined) {
      where.isActive = parameters.active;
    }

    return await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parameters.limit || 50,
    });
  }

  private async getAnalytics(parameters: any): Promise<any[]> {
    // Mock analytics data
    return [
      {
        metric: "total_orders",
        value: 1247,
        change: 12.5,
        period: "month",
      },
      {
        metric: "total_revenue",
        value: 45680,
        change: -2.3,
        period: "month",
      },
      {
        metric: "active_users",
        value: 892,
        change: 8.1,
        period: "month",
      },
      {
        metric: "conversion_rate",
        value: 3.2,
        change: 0.5,
        period: "month",
      },
    ];
  }
}
