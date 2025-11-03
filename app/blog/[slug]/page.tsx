'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'

export default function BlogPostPage() {
  const params = useParams()

  const post = {
    title: 'The Future of AI in E-Commerce',
    slug: params.slug,
    content: `
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

      ## Introduction

      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

      ## Main Content

      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

      ### Key Points

      - First key point about AI integration
      - Second point about automation
      - Third point about customer experience

      ## Conclusion

      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
    `,
    author: 'Admin User',
    date: 'January 15, 2025',
    category: 'Technology',
    readTime: '5 min read',
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <div className="mb-8">
            <Badge variant="info" className="mb-4">{post.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Avatar name={post.author} size="sm" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              <span>{post.readTime}</span>
            </div>
          </div>

          <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl mb-8" />

          <Card>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {post.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <Button variant="secondary" icon={<Share2 className="w-4 h-4" />}>
                  Share Article
                </Button>
              </div>
            </CardContent>
          </Card>
        </article>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Related Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Link key={i} href={`/blog/related-${i}`}>
                <Card hover padding="none">
                  <CardContent>
                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-t-xl" />
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        Related Post {i}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        January {i}, 2025
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
