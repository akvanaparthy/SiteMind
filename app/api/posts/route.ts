import { NextRequest, NextResponse } from 'next/server';
import {
  createBlogPost,
  getBlogPost,
  getBlogPosts,
  updateBlogPost,
  publishBlogPost,
  trashBlogPost,
  deleteBlogPost,
} from '@/lib/actions/blog';
import { PostStatus } from '@prisma/client';

/**
 * GET /api/posts
 * Query blog posts with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const status = searchParams.get('status') as PostStatus | null;
    const authorId = searchParams.get('authorId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const orderBy = searchParams.get('orderBy') as 'asc' | 'desc' | null;

    // Handle type=get for agent tools compatibility
    if (type === 'get' && id) {
      const post = await getBlogPost(parseInt(id));
      if (!post) {
        return NextResponse.json(
          { success: false, action: 'getBlogPost', error: 'Post not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ 
        success: true, 
        action: 'getBlogPost',
        data: { post },
        timestamp: new Date().toISOString() 
      });
    }

    // Get single post if id or slug is provided
    if (id || slug) {
      const post = await getBlogPost(id ? parseInt(id) : slug!);
      if (!post) {
        return NextResponse.json(
          { success: false, error: 'Post not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: post });
    }

    // Get multiple posts with filters
    const posts = await getBlogPosts({
      ...(status && { status }),
      ...(authorId && { authorId: parseInt(authorId) }),
      ...(limit && { limit: parseInt(limit) }),
      ...(offset && { offset: parseInt(offset) }),
      ...(orderBy && { orderBy }),
    });

    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length,
    });
  } catch (error: any) {
    console.error('[API] Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * Create a new blog post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, content, excerpt, authorId, slug, status, publishNow } = body;

    // Handle type-based operations for agent tools compatibility
    if (type === 'create') {
      if (!title || !content || !authorId) {
        return NextResponse.json(
          { success: false, action: 'createBlogPost', error: 'Missing required fields: title, content, authorId' },
          { status: 400 }
        );
      }

      const post = await createBlogPost({
        title,
        content,
        excerpt,
        authorId,
        slug,
        status,
        publishNow,
      });

      return NextResponse.json({
        success: true,
        action: 'createBlogPost',
        data: { post },
        message: 'Blog post created successfully',
        timestamp: new Date().toISOString(),
      }, { status: 201 });
    }

    // Default behavior for non-typed requests
    if (!title || !content || !authorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, content, authorId' },
        { status: 400 }
      );
    }

    const post = await createBlogPost({
      title,
      content,
      excerpt,
      authorId,
      slug,
      status,
      publishNow,
    });

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Blog post created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error creating post:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts
 * Update, publish, or trash a blog post based on the `type` field
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, action: type || 'updateBlogPost', error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    let post;
    let message = 'Blog post updated successfully';
    let action = 'updateBlogPost';

    // Handle different operation types
    if (type === 'publish') {
      post = await publishBlogPost(id);
      message = 'Blog post published successfully';
      action = 'publishBlogPost';
    } else if (type === 'trash') {
      post = await trashBlogPost(id);
      message = 'Blog post moved to trash';
      action = 'trashBlogPost';
    } else if (type === 'update') {
      post = await updateBlogPost(id, updates);
      action = 'updateBlogPost';
    } else {
      // Default: update post with provided fields
      post = await updateBlogPost(id, updates);
    }

    return NextResponse.json({
      success: true,
      action,
      data: { post },
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Error updating post:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts
 * Delete a blog post
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

    const result = await deleteBlogPost(parseInt(id));

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[API] Error deleting post:', error);
    
    // Check if it's a "not found" error
    if (error.message?.includes('not found') || error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: `Post not found or already deleted` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
