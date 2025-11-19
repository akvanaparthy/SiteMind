import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/tickets/[id]/messages
 * Get all messages for a ticket
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id);

    const messages = await prisma.ticketMessage.findMany({
      where: { ticketId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error: any) {
    console.error('[API] Error fetching ticket messages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets/[id]/messages
 * Create a new message in a ticket
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id);
    const body = await request.json();
    const { senderId, message, isInternal = false, attachments } = body;

    if (!senderId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: senderId, message' },
        { status: 400 }
      );
    }

    // Verify ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Create message
    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId,
        message,
        isInternal,
        attachments: attachments || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Update ticket's updatedAt
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: ticketMessage,
      message: 'Message sent successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error creating ticket message:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
