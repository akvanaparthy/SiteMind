import { NextRequest, NextResponse } from 'next/server';
import { closeTicket, reopenTicket, updateTicketPriority, assignTicket } from '@/lib/actions/tickets';
import { TicketPriority } from '@prisma/client';

/**
 * POST /api/tickets/[action]
 * Special actions: close, reopen, priority, assign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const body = await request.json();
    const { id, resolution, priority, agentId } = body;
    const { action } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    let ticket;
    switch (action) {
      case 'close':
        if (!resolution) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: resolution' },
            { status: 400 }
          );
        }
        ticket = await closeTicket(id, resolution);
        break;

      case 'reopen':
        ticket = await reopenTicket(id);
        break;

      case 'priority':
        if (!priority) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: priority' },
            { status: 400 }
          );
        }
        ticket = await updateTicketPriority(id, priority as TicketPriority);
        break;

      case 'assign':
        if (!agentId) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: agentId' },
            { status: 400 }
          );
        }
        ticket = await assignTicket(id, agentId);
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: ticket,
      message: `Ticket ${action} completed successfully`,
    });
  } catch (error: any) {
    const { action } = await params;
    console.error(`[API] Error ${action}ing ticket:`, error);
    return NextResponse.json(
      { success: false, error: error.message || `Failed to ${action} ticket` },
      { status: 500 }
    );
  }
}
