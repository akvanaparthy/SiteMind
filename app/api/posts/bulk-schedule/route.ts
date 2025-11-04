import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/posts/bulk-schedule
 * Schedule multiple posts with intervals
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postIds, startDate, interval = '1d' } = body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid postIds array' },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: startDate' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    if (start <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Start date must be in the future' },
        { status: 400 }
      );
    }

    // Parse interval (e.g., '1d', '2h', '30m')
    const intervalMatch = interval.match(/^(\d+)([dhm])$/);
    if (!intervalMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid interval format. Use format: 1d, 2h, or 30m' },
        { status: 400 }
      );
    }

    const [, amount, unit] = intervalMatch;
    const intervalMs = parseInt(amount) * (
      unit === 'd' ? 24 * 60 * 60 * 1000 :
      unit === 'h' ? 60 * 60 * 1000 :
      60 * 1000
    );

    // Schedule each post
    const scheduled = [];
    for (let i = 0; i < postIds.length; i++) {
      const postId = parseInt(postIds[i]);
      const publishDate = new Date(start.getTime() + (i * intervalMs));

      try {
        const post = await prisma.post.update({
          where: { id: postId },
          data: {
            publishedAt: publishDate,
            status: 'DRAFT',
          },
          select: {
            id: true,
            title: true,
            publishedAt: true,
          },
        });

        scheduled.push({
          postId: post.id,
          title: post.title,
          scheduledFor: post.publishedAt?.toISOString(),
        });
      } catch (error: any) {
        if (error.code === 'P2025') {
          scheduled.push({
            postId,
            error: 'Post not found',
            scheduledFor: null,
          });
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${scheduled.filter(s => !s.error).length} posts scheduled successfully`,
      data: {
        scheduled,
        startDate: start.toISOString(),
        interval,
        totalPosts: postIds.length,
      },
    });
  } catch (error) {
    console.error('Error bulk scheduling posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bulk schedule posts' },
      { status: 500 }
    );
  }
}
