import { prisma } from "../../../src/lib/prisma";

export class TicketsTool {
  async closeTicket(ticketId: string): Promise<string> {
    try {
      const ticket = await prisma.ticket.findFirst({
        where: { ticketId },
        include: { customer: true },
      });

      if (!ticket) {
        throw new Error(`Ticket #${ticketId} not found`);
      }

      if (ticket.status === "CLOSED") {
        return `Ticket #${ticketId} is already closed`;
      }

      // Update ticket status
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: "CLOSED" },
      });

      // Mock email notification
      console.log(
        `Mock: Sending ticket closure notification to ${ticket.customer.email}`
      );

      return `Ticket #${ticketId} closed successfully. Notification sent to ${ticket.customer.email}`;
    } catch (error) {
      throw new Error(
        `Failed to close ticket #${ticketId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getTickets(status?: string): Promise<any[]> {
    try {
      const where = status ? { status: status.toUpperCase() as any } : {};

      const tickets = await prisma.ticket.findMany({
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
        take: 20,
      });

      return tickets;
    } catch (error) {
      throw new Error(
        `Failed to fetch tickets: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async createTicket(
    subject: string,
    description: string,
    customerId: number,
    priority: string = "MEDIUM"
  ): Promise<any> {
    try {
      const ticket = await prisma.ticket.create({
        data: {
          ticketId: `TKT-${Date.now()}`,
          subject,
          description,
          customerId,
          priority: priority.toUpperCase() as any,
          status: "OPEN",
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return ticket;
    } catch (error) {
      throw new Error(
        `Failed to create ticket: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updateTicket(ticketId: string, updates: any): Promise<any> {
    try {
      const ticket = await prisma.ticket.findFirst({
        where: { ticketId },
      });

      if (!ticket) {
        throw new Error(`Ticket #${ticketId} not found`);
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: updates,
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return updatedTicket;
    } catch (error) {
      throw new Error(
        `Failed to update ticket #${ticketId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
