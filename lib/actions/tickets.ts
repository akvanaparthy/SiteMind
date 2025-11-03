import { Ticket, TicketStatus, TicketPriority } from '@prisma/client';
import prisma from '../prisma';
import { startLogging } from '../agent-logger';

/**
 * Options for creating a ticket
 */
export interface CreateTicketOptions {
  subject: string;
  description: string;
  customerId: number;
  priority?: TicketPriority;
  assignedTo?: number;
}

/**
 * Options for updating a ticket
 */
export interface UpdateTicketOptions {
  subject?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignedTo?: number;
  resolution?: string;
}

/**
 * Options for querying tickets
 */
export interface GetTicketsOptions {
  status?: TicketStatus;
  priority?: TicketPriority;
  customerId?: number;
  assignedTo?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
}

/**
 * Create a new support ticket
 * 
 * @param options - Ticket creation options
 * @param agentName - Name of the agent creating the ticket
 * @returns The created ticket
 */
export async function createTicket(
  options: CreateTicketOptions,
  agentName: string = 'AI Agent'
): Promise<Ticket> {
  const { log, update, complete, fail } = await startLogging(
    `Create support ticket: "${options.subject}"`,
    { subject: options.subject, customerId: options.customerId },
    agentName
  );

  try {
    await update('Verifying customer exists');
    const customer = await prisma.user.findUnique({
      where: { id: options.customerId },
    });

    if (!customer) {
      await fail('Customer not found', `No user found with ID: ${options.customerId}`);
      throw new Error(`Customer with ID ${options.customerId} not found`);
    }

    if (options.assignedTo) {
      await update('Verifying assigned agent exists');
      const agent = await prisma.user.findUnique({
        where: { id: options.assignedTo },
      });

      if (!agent) {
        await fail('Assigned agent not found', `No user found with ID: ${options.assignedTo}`);
        throw new Error(`Agent with ID ${options.assignedTo} not found`);
      }
    }

    await update('Creating support ticket in database');
    const ticket = await prisma.ticket.create({
      data: {
        subject: options.subject,
        description: options.description,
        customerId: options.customerId,
        priority: options.priority || TicketPriority.MEDIUM,
        assignedTo: options.assignedTo,
        status: TicketStatus.OPEN,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await complete(`Successfully created ticket #${ticket.ticketId}`);
    return ticket;
  } catch (error: any) {
    await fail('Failed to create ticket', error.message);
    throw error;
  }
}

/**
 * Get a ticket by ID or ticketId
 * 
 * @param idOrTicketId - Ticket ID or ticketId string
 * @param agentName - Name of the agent querying
 * @returns The ticket or null if not found
 */
export async function getTicket(
  idOrTicketId: number | string,
  agentName: string = 'AI Agent'
): Promise<Ticket | null> {
  const { log, update, complete, fail } = await startLogging(
    `Query ticket: ${idOrTicketId}`,
    { identifier: idOrTicketId },
    agentName
  );

  try {
    await update('Searching database for ticket');
    const ticket = typeof idOrTicketId === 'number'
      ? await prisma.ticket.findUnique({
          where: { id: idOrTicketId },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
      : await prisma.ticket.findUnique({
          where: { ticketId: idOrTicketId },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

    if (!ticket) {
      await fail('Ticket not found', `No ticket found with identifier: ${idOrTicketId}`);
      return null;
    }

    await complete(`Successfully retrieved ticket: "${ticket.subject}"`);
    return ticket;
  } catch (error: any) {
    await fail('Failed to query ticket', error.message);
    throw error;
  }
}

/**
 * Get multiple tickets with filtering
 * 
 * @param options - Query options
 * @returns Array of tickets
 */
export async function getTickets(options: GetTicketsOptions = {}): Promise<Ticket[]> {
  try {
    const {
      status,
      priority,
      customerId,
      assignedTo,
      limit,
      offset,
      orderBy = 'desc',
    } = options;

    const tickets = await prisma.ticket.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(customerId && { customerId }),
        ...(assignedTo !== undefined && { assignedTo }),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: orderBy,
      },
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
    });

    return tickets;
  } catch (error: any) {
    throw new Error(`Failed to query tickets: ${error.message}`);
  }
}

/**
 * Get all open tickets
 * 
 * @param agentName - Name of the agent querying
 * @returns Array of open tickets
 */
export async function getOpenTickets(agentName: string = 'AI Agent'): Promise<Ticket[]> {
  const { log, update, complete, fail } = await startLogging(
    'Query all open support tickets',
    {},
    agentName
  );

  try {
    await update('Fetching open tickets from database');
    const tickets = await getTickets({ status: TicketStatus.OPEN });

    await complete(`Found ${tickets.length} open tickets`);
    return tickets;
  } catch (error: any) {
    await fail('Failed to query open tickets', error.message);
    throw error;
  }
}

/**
 * Update a ticket
 * 
 * @param ticketId - Ticket ID
 * @param updates - Fields to update
 * @param agentName - Name of the agent updating
 * @returns The updated ticket
 */
export async function updateTicket(
  ticketId: number,
  updates: UpdateTicketOptions,
  agentName: string = 'AI Agent'
): Promise<Ticket> {
  const { log, update, complete, fail } = await startLogging(
    `Update ticket #${ticketId}`,
    { ticketId, updates },
    agentName
  );

  try {
    await update('Verifying ticket exists');
    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!existingTicket) {
      await fail('Ticket not found', `No ticket found with ID: ${ticketId}`);
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    if (updates.assignedTo) {
      await update('Verifying assigned agent exists');
      const agent = await prisma.user.findUnique({
        where: { id: updates.assignedTo },
      });

      if (!agent) {
        await fail('Assigned agent not found', `No user found with ID: ${updates.assignedTo}`);
        throw new Error(`Agent with ID ${updates.assignedTo} not found`);
      }
    }

    await update('Updating ticket in database');
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        ...(updates.subject && { subject: updates.subject }),
        ...(updates.description && { description: updates.description }),
        ...(updates.priority && { priority: updates.priority }),
        ...(updates.status && { status: updates.status }),
        ...(updates.assignedTo !== undefined && { assignedTo: updates.assignedTo }),
        ...(updates.resolution && { resolution: updates.resolution }),
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await complete(`Successfully updated ticket: "${ticket.subject}"`);
    return ticket;
  } catch (error: any) {
    await fail('Failed to update ticket', error.message);
    throw error;
  }
}

/**
 * Update ticket priority
 * 
 * @param ticketId - Ticket ID
 * @param priority - New priority level
 * @param agentName - Name of the agent updating
 * @returns The updated ticket
 */
export async function updateTicketPriority(
  ticketId: number,
  priority: TicketPriority,
  agentName: string = 'AI Agent'
): Promise<Ticket> {
  return updateTicket(ticketId, { priority }, agentName);
}

/**
 * Assign a ticket to an agent
 * 
 * @param ticketId - Ticket ID
 * @param agentId - Agent user ID
 * @param agentName - Name of the agent assigning
 * @returns The updated ticket
 */
export async function assignTicket(
  ticketId: number,
  agentId: number,
  agentName: string = 'AI Agent'
): Promise<Ticket> {
  return updateTicket(ticketId, { assignedTo: agentId }, agentName);
}

/**
 * Close a ticket with resolution
 * 
 * @param ticketId - Ticket ID
 * @param resolution - Resolution description (optional)
 * @param agentName - Name of the agent closing
 * @returns The closed ticket
 */
export async function closeTicket(
  ticketId: number,
  resolution?: string,
  agentName: string = 'AI Agent'
): Promise<Ticket> {
  const { log, update, complete, fail } = await startLogging(
    `Close ticket #${ticketId}`,
    { ticketId, resolution },
    agentName
  );

  try {
    await update('Verifying ticket exists and is open');
    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!existingTicket) {
      await fail('Ticket not found', `No ticket found with ID: ${ticketId}`);
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    if (existingTicket.status === TicketStatus.CLOSED) {
      await complete('Ticket is already closed');
      return existingTicket;
    }

    await update('Closing ticket with resolution');
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.CLOSED,
        ...(resolution && { resolution }),
        closedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await update('Notifying customer (mock)');
    // TODO: Send email notification to customer

    await complete(`Successfully closed ticket: "${ticket.subject}"`);
    return ticket;
  } catch (error: any) {
    await fail('Failed to close ticket', error.message);
    throw error;
  }
}

/**
 * Reopen a closed ticket
 * 
 * @param ticketId - Ticket ID
 * @param agentName - Name of the agent reopening
 * @returns The reopened ticket
 */
export async function reopenTicket(
  ticketId: number,
  agentName: string = 'AI Agent'
): Promise<Ticket> {
  const { log, update, complete, fail } = await startLogging(
    `Reopen ticket #${ticketId}`,
    { ticketId },
    agentName
  );

  try {
    await update('Verifying ticket exists');
    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!existingTicket) {
      await fail('Ticket not found', `No ticket found with ID: ${ticketId}`);
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    if (existingTicket.status === TicketStatus.OPEN) {
      await complete('Ticket is already open');
      return existingTicket;
    }

    await update('Reopening ticket');
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.OPEN,
        closedAt: null,
        resolution: null,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await complete(`Successfully reopened ticket: "${ticket.subject}"`);
    return ticket;
  } catch (error: any) {
    await fail('Failed to reopen ticket', error.message);
    throw error;
  }
}

export default {
  createTicket,
  getTicket,
  getTickets,
  getOpenTickets,
  updateTicket,
  updateTicketPriority,
  assignTicket,
  closeTicket,
  reopenTicket,
};
