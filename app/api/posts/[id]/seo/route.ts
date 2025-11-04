import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/posts/:id/seo
 * Optimize SEO for a post (generate suggestions)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        title: true,
        content: true,
        excerpt: true,
        slug: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Mock SEO analysis
    // In production, use actual SEO analysis tools or AI
    const wordCount = post.content.split(/\s+/).length;
    const titleLength = post.title.length;
    const hasExcerpt = !!post.excerpt;
    const slugLength = post.slug.length;

    const suggestions = [];
    const issues = [];
    const score = { current: 0, max: 100 };

    // Title length check
    if (titleLength < 30) {
      issues.push('Title is too short (less than 30 characters)');
      suggestions.push('Expand title to 50-60 characters for better SEO');
    } else if (titleLength > 60) {
      issues.push('Title is too long (more than 60 characters)');
      suggestions.push('Shorten title to 50-60 characters');
    } else {
      score.current += 20;
    }

    // Content length check
    if (wordCount < 300) {
      issues.push('Content is too short (less than 300 words)');
      suggestions.push('Aim for at least 1000 words for better SEO ranking');
    } else if (wordCount >= 1000) {
      score.current += 30;
    } else {
      score.current += 20;
    }

    // Excerpt check
    if (!hasExcerpt) {
      issues.push('Missing meta description (excerpt)');
      suggestions.push('Add an excerpt (150-160 characters) to improve click-through rate');
    } else {
      score.current += 20;
    }

    // Slug check
    if (slugLength > 75) {
      issues.push('URL slug is too long');
      suggestions.push('Shorten slug to under 75 characters');
    } else {
      score.current += 15;
    }

    // Headings check (simple)
    const hasH2 = post.content.includes('##') || post.content.includes('<h2>');
    if (!hasH2) {
      issues.push('No subheadings found');
      suggestions.push('Add H2 headings to improve content structure');
    } else {
      score.current += 15;
    }

    return NextResponse.json({
      success: true,
      data: {
        postId,
        postTitle: post.title,
        seo: {
          score: {
            current: score.current,
            max: score.max,
            percentage: `${score.current}%`,
            rating: score.current >= 80 ? 'excellent' : score.current >= 60 ? 'good' : score.current >= 40 ? 'fair' : 'poor',
          },
          metrics: {
            titleLength,
            contentWordCount: wordCount,
            hasExcerpt,
            slugLength,
          },
          issues,
          suggestions,
        },
      },
      note: 'This is a basic SEO analysis. Integrate with tools like Yoast or SEMrush for advanced analysis.',
    });
  } catch (error) {
    console.error('Error optimizing SEO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to optimize SEO' },
      { status: 500 }
    );
  }
}
