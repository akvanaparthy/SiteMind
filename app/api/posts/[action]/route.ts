import { NextRequest, NextResponse } from 'next/server';
import { publishBlogPost, trashBlogPost } from '@/lib/actions/blog';

/**
 * POST /api/posts/[action]
 * Special actions: publish, trash
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const body = await request.json();
    const { id } = body;
    const { action } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    let post;
    switch (action) {
      case 'publish':
        post = await publishBlogPost(id);
        break;
      case 'trash':
        post = await trashBlogPost(id);
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: post,
      message: `Blog post ${action}ed successfully`,
    });
  } catch (error: any) {
    console.error(`[API] Error ${params.action}ing post:`, error);
    return NextResponse.json(
      { success: false, error: error.message || `Failed to ${params.action} post` },
      { status: 500 }
    );
  }
}
