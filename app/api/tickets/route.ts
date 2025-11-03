import { NextRequest, NextResponse } from 'next/server';
import {
  createTicket,
  getTicket,
  getTickets,
  getOpenTickets,
  updateTicket,
  updateTicketPriority,
  assignTicket,
  closeTicket,
  reopenTicket,
} from '@/lib/actions/tickets';
import { TicketStatus, TicketPriority } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * GET /api/tickets
 * Query tickets with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const ticketId = searchParams.get('ticketId');
    const status = searchParams.get('status') as TicketStatus | null;
    const priority = searchParams.get('priority') as TicketPriority | null;
    const customerId = searchParams.get('customerId');
    const assignedTo = searchParams.get('assignedTo');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const orderBy = searchParams.get('orderBy') as 'asc' | 'desc' | null;
    const openOnly = searchParams.get('openOnly') === 'true' || type === 'getOpen';

    // Get open tickets if requested
    if (openOnly) {
      const tickets = await getOpenTickets();
      return NextResponse.json({
        success: true,
        action: 'getOpenTickets',
        data: { tickets },
        count: tickets.length,
        timestamp: new Date().toISOString()
      });
    }

    // Handle type=get for agent tools compatibility
    if (type === 'get' && id) {
      const ticket = await getTicket(parseInt(id));
      if (!ticket) {
        return NextResponse.json(
          { success: false, action: 'getTicket', error: 'Ticket not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ 
        success: true, 
        action: 'getTicket',
        data: { ticket },
        timestamp: new Date().toISOString()
      });
    }

    // Get single ticket if id or ticketId is provided
    if (id || ticketId) {
      const ticket = await getTicket(id ? parseInt(id) : ticketId!);
      if (!ticket) {
        return NextResponse.json(
          { success: false, error: 'Ticket not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: ticket });
    }

    // Get multiple tickets with filters
    const tickets = await getTickets({
      ...(status && { status }),
      ...(priority && { priority }),
      ...(customerId && { customerId: parseInt(customerId) }),
      ...(assignedTo && { assignedTo: parseInt(assignedTo) }),
      ...(limit && { limit: parseInt(limit) }),
      ...(offset && { offset: parseInt(offset) }),
      ...(orderBy && { orderBy }),
    });

    return NextResponse.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  } catch (error: any) {
    console.error('[API] Error fetching tickets:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets
 * Create a new support ticket
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, description, customerId, priority, assignedTo } = body;

    if (!subject || !description || !customerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: subject, description, customerId' },
        { status: 400 }
      );
    }

    const ticket = await createTicket({
      subject,
      description,
      customerId,
      priority,
      assignedTo,
    });

    return NextResponse.json({
      success: true,
      data: ticket,
      message: 'Ticket created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error creating ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tickets
 * Update, close, assign, or change priority based on the `type` field
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, action: type || 'updateTicket', error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    let ticket;
    let message = 'Ticket updated successfully';
    let action = 'updateTicket';

    // Handle different operation types
    if (type === 'close') {
      ticket = await closeTicket(id, updates.resolution);
      message = 'Ticket closed successfully';
      action = 'closeTicket';
    } else if (type === 'updatePriority') {
      if (!updates.priority) {
        return NextResponse.json(
          { success: false, action: 'updateTicketPriority', error: 'Missing required field: priority' },
          { status: 400 }
        );
      }
      ticket = await updateTicketPriority(id, updates.priority);
      message = `Ticket priority updated to ${updates.priority}`;
      action = 'updateTicketPriority';
    } else if (type === 'assign') {
      if (!updates.assigneeId) {
        return NextResponse.json(
          { success: false, action: 'assignTicket', error: 'Missing required field: assigneeId' },
          { status: 400 }
        );
      }
      ticket = await assignTicket(id, updates.assigneeId);
      message = `Ticket assigned to user #${updates.assigneeId}`;
      action = 'assignTicket';
    } else {
      // Default: update ticket with provided fields
      ticket = await updateTicket(id, updates);
    }

    return NextResponse.json({
      success: true,
      action,
      data: { ticket },
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Error updating ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tickets
 * Delete a ticket (for testing purposes)
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

    // Delete the ticket directly
    await prisma.ticket.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: `Ticket #${id} deleted successfully`,
    });
  } catch (error: any) {
    console.error('[API] Error deleting ticket:', error);
    
    // Check if it's a "not found" error (Prisma error code P2025)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: `Ticket not found or already deleted` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
