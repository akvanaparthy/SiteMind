import { Post, PostStatus, Prisma } from '@prisma/client';
import prisma from '../prisma';
import { startLogging } from '../agent-logger';

/**
 * Options for creating a blog post
 */
export interface CreateBlogPostOptions {
  title: string;
  content: string;
  excerpt?: string;
  authorId: number;
  slug?: string;
  status?: PostStatus;
  publishNow?: boolean;
}

/**
 * Options for updating a blog post
 */
export interface UpdateBlogPostOptions {
  title?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  status?: PostStatus;
}

/**
 * Options for querying blog posts
 */
export interface GetBlogPostsOptions {
  status?: PostStatus;
  authorId?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
}

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Create a new blog post
 * 
 * @param options - Blog post creation options
 * @param agentName - Name of the agent creating the post
 * @returns The created blog post
 * 
 * @example
 * ```ts
 * const post = await createBlogPost({
 *   title: 'How to Use AI in Your Business',
 *   content: 'AI is transforming businesses...',
 *   excerpt: 'Learn about AI applications',
 *   authorId: 1,
 *   publishNow: true
 * });
 * ```
 */
export async function createBlogPost(
  options: CreateBlogPostOptions,
  agentName: string = 'AI Agent'
): Promise<Post> {
  const { log, update, complete, fail } = await startLogging(
    `Create blog post: "${options.title}"`,
    { title: options.title, authorId: options.authorId },
    agentName
  );

  try {
    await update('Generating slug from title');
    const slug = options.slug || generateSlug(options.title);

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      const uniqueSlug = `${slug}-${Date.now()}`;
      await update(`Slug already exists, using unique slug: ${uniqueSlug}`);
    }

    await update('Creating blog post in database');
    const post = await prisma.post.create({
      data: {
        title: options.title,
        content: options.content,
        excerpt: options.excerpt || options.content.substring(0, 150) + '...',
        slug: existingPost ? `${slug}-${Date.now()}` : slug,
        authorId: options.authorId,
        status: options.publishNow ? PostStatus.PUBLISHED : (options.status || PostStatus.DRAFT),
        publishedAt: options.publishNow ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await complete(`Successfully created blog post (ID: ${post.id}, Slug: ${post.slug})`);
    return post;
  } catch (error: any) {
    await fail('Failed to create blog post', error.message);
    throw new Error(`Failed to create blog post: ${error.message}`);
  }
}

/**
 * Get a blog post by ID or slug
 * 
 * @param idOrSlug - Post ID or slug
 * @param agentName - Name of the agent querying
 * @returns The blog post or null if not found
 */
export async function getBlogPost(
  idOrSlug: number | string,
  agentName: string = 'AI Agent'
): Promise<Post | null> {
  const { log, update, complete, fail } = await startLogging(
    `Query blog post: ${idOrSlug}`,
    { identifier: idOrSlug },
    agentName
  );

  try {
    await update('Searching database for blog post');
    const post = typeof idOrSlug === 'number'
      ? await prisma.post.findUnique({
          where: { id: idOrSlug },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
      : await prisma.post.findUnique({
          where: { slug: idOrSlug },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

    if (!post) {
      await fail('Blog post not found', `No post found with identifier: ${idOrSlug}`);
      return null;
    }

    await complete(`Successfully retrieved blog post: "${post.title}"`);
    return post;
  } catch (error: any) {
    await fail('Failed to query blog post', error.message);
    throw new Error(`Failed to query blog post: ${error.message}`);
  }
}

/**
 * Get multiple blog posts with filtering
 * 
 * @param options - Query options
 * @returns Array of blog posts
 */
export async function getBlogPosts(options: GetBlogPostsOptions = {}): Promise<Post[]> {
  try {
    const {
      status,
      authorId,
      limit,
      offset,
      orderBy = 'desc',
    } = options;

    const posts = await prisma.post.findMany({
      where: {
        ...(status && { status }),
        ...(authorId && { authorId }),
      },
      include: {
        author: {
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

    return posts;
  } catch (error: any) {
    throw new Error(`Failed to query blog posts: ${error.message}`);
  }
}

/**
 * Update an existing blog post
 * 
 * @param postId - Post ID
 * @param updates - Fields to update
 * @param agentName - Name of the agent updating
 * @returns The updated blog post
 */
export async function updateBlogPost(
  postId: number,
  updates: UpdateBlogPostOptions,
  agentName: string = 'AI Agent'
): Promise<Post> {
  const { log, update, complete, fail } = await startLogging(
    `Update blog post #${postId}`,
    { postId, updates },
    agentName
  );

  try {
    await update('Verifying post exists');
    const existingPost = await prisma.post.findUnique({ where: { id: postId } });

    if (!existingPost) {
      await fail('Post not found', `No post found with ID: ${postId}`);
      throw new Error(`Post with ID ${postId} not found`);
    }

    // If slug is being updated, check for uniqueness
    if (updates.slug && updates.slug !== existingPost.slug) {
      await update('Checking slug uniqueness');
      const slugExists = await prisma.post.findUnique({
        where: { slug: updates.slug },
      });

      if (slugExists) {
        await fail('Slug already exists', `Slug "${updates.slug}" is already in use`);
        throw new Error(`Slug "${updates.slug}" is already in use`);
      }
    }

    await update('Updating blog post in database');
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.content && { content: updates.content }),
        ...(updates.excerpt && { excerpt: updates.excerpt }),
        ...(updates.slug && { slug: updates.slug }),
        ...(updates.status && { status: updates.status }),
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await complete(`Successfully updated blog post: "${post.title}"`);
    return post;
  } catch (error: any) {
    await fail('Failed to update blog post', error.message);
    throw error;
  }
}

/**
 * Publish a blog post
 * 
 * @param postId - Post ID
 * @param agentName - Name of the agent publishing
 * @returns The published blog post
 */
export async function publishBlogPost(
  postId: number,
  agentName: string = 'AI Agent'
): Promise<Post> {
  const { log, update, complete, fail } = await startLogging(
    `Publish blog post #${postId}`,
    { postId },
    agentName
  );

  try {
    await update('Verifying post exists and is not already published');
    const existingPost = await prisma.post.findUnique({ where: { id: postId } });

    if (!existingPost) {
      await fail('Post not found', `No post found with ID: ${postId}`);
      throw new Error(`Post with ID ${postId} not found`);
    }

    if (existingPost.status === PostStatus.PUBLISHED) {
      await complete(`Post is already published`);
      return existingPost;
    }

    await update('Publishing blog post');
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await complete(`Successfully published blog post: "${post.title}"`);
    return post;
  } catch (error: any) {
    await fail('Failed to publish blog post', error.message);
    throw error;
  }
}

/**
 * Move a blog post to trash
 * 
 * @param postId - Post ID
 * @param agentName - Name of the agent trashing
 * @returns The trashed blog post
 */
export async function trashBlogPost(
  postId: number,
  agentName: string = 'AI Agent'
): Promise<Post> {
  const { log, update, complete, fail } = await startLogging(
    `Trash blog post #${postId}`,
    { postId },
    agentName
  );

  try {
    await update('Verifying post exists');
    const existingPost = await prisma.post.findUnique({ where: { id: postId } });

    if (!existingPost) {
      await fail('Post not found', `No post found with ID: ${postId}`);
      throw new Error(`Post with ID ${postId} not found`);
    }

    await update('Moving post to trash');
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.TRASHED,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await complete(`Successfully trashed blog post: "${post.title}"`);
    return post;
  } catch (error: any) {
    await fail('Failed to trash blog post', error.message);
    throw error;
  }
}

/**
 * Permanently delete a blog post
 * 
 * @param postId - Post ID
 * @param agentName - Name of the agent deleting
 * @returns Success message
 */
export async function deleteBlogPost(
  postId: number,
  agentName: string = 'AI Agent'
): Promise<{ success: boolean; message: string }> {
  const { log, update, complete, fail } = await startLogging(
    `Delete blog post #${postId}`,
    { postId },
    agentName
  );

  try {
    await update('Verifying post exists');
    const existingPost = await prisma.post.findUnique({ where: { id: postId } });

    if (!existingPost) {
      await fail('Post not found', `No post found with ID: ${postId}`);
      throw new Error(`Post with ID ${postId} not found`);
    }

    await update('Permanently deleting post from database');
    await prisma.post.delete({ where: { id: postId } });

    await complete(`Successfully deleted blog post: "${existingPost.title}"`);
    return {
      success: true,
      message: `Blog post "${existingPost.title}" deleted successfully`,
    };
  } catch (error: any) {
    await fail('Failed to delete blog post', error.message);
    throw error;
  }
}

export default {
  createBlogPost,
  getBlogPost,
  getBlogPosts,
  updateBlogPost,
  publishBlogPost,
  trashBlogPost,
  deleteBlogPost,
};
