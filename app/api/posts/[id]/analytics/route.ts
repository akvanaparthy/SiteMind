import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/posts/:id/analytics
 * Get analytics for a specific post (mock implementation)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        publishedAt: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Mock analytics data
    // In production, integrate with Google Analytics, Plausible, or similar
    const mockViews = Math.floor(Math.random() * 5000) + 100;
    const mockUniqueVisitors = Math.floor(mockViews * 0.7);
    const mockAvgTimeOnPage = Math.floor(Math.random() * 300) + 60; // seconds
    const mockBounceRate = (Math.random() * 40 + 30).toFixed(2); // 30-70%
    const mockSocialShares = Math.floor(Math.random() * 100);

    return NextResponse.json({
      success: true,
      data: {
        postId,
        postTitle: post.title,
        postSlug: post.slug,
        status: post.status,
        publishedAt: post.publishedAt,
        analytics: {
          views: mockViews,
          uniqueVisitors: mockUniqueVisitors,
          averageTimeOnPage: `${Math.floor(mockAvgTimeOnPage / 60)}m ${mockAvgTimeOnPage % 60}s`,
          bounceRate: `${mockBounceRate}%`,
          socialShares: mockSocialShares,
          engagement: {
            likes: Math.floor(mockSocialShares * 0.5),
            comments: Math.floor(mockSocialShares * 0.2),
            shares: mockSocialShares,
          },
        },
        period,
      },
      note: 'This is mock analytics data. Integrate with actual analytics service in production.',
    });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post analytics' },
      { status: 500 }
    );
  }
}
