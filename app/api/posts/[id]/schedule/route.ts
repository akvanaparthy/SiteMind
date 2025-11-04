import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/posts/:id/schedule
 * Schedule a post for future publishing
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    const body = await request.json();
    const { publishDate } = body;

    if (!publishDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: publishDate' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(publishDate);
    
    // Validate date is in the future
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Publish date must be in the future' },
        { status: 400 }
      );
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        publishedAt: scheduledDate,
        status: 'DRAFT', // Keep as draft until scheduled time
      },
    });

    return NextResponse.json({
      success: true,
      message: `Post scheduled for ${scheduledDate.toLocaleString()}`,
      data: {
        postId: post.id,
        title: post.title,
        scheduledFor: scheduledDate.toISOString(),
        status: post.status,
      },
    });
  } catch (error: any) {
    console.error('Error scheduling post:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to schedule post' },
      { status: 500 }
    );
  }
}
