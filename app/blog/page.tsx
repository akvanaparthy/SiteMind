'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function BlogPage() {
  const posts = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: `Blog Post Title ${i + 1}`,
    slug: `post-${i + 1}`,
    excerpt: 'This is a brief excerpt from the blog post that gives readers a preview of what to expect...',
    author: 'Admin User',
    date: new Date(2025, 0, i + 1).toLocaleDateString(),
    category: ['Technology', 'Business', 'AI'][i % 3],
  }))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Blog
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Insights, updates, and stories from our team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card hover padding="none" className="h-full">
                <CardContent>
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-t-xl" />
                  <div className="p-6">
                    <Badge variant="info" className="mb-3">{post.category}</Badge>
                    <h2 className="font-semibold text-xl text-slate-900 dark:text-slate-100 mb-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
