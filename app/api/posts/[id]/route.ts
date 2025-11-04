import { NextRequest, NextResponse } from 'next/server';
import { getBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/actions/blog';

/**
 * GET /api/posts/:id
 * Get post details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const post = await getBlogPost(postId);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/:id
 * Update post details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    const body = await request.json();

    const post = await updateBlogPost(postId, body);

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      data: { post },
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/:id
 * Delete a post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    await deleteBlogPost(postId);

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
