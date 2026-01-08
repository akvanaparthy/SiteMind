'use client'

// Force dynamic rendering - admin pages need auth context
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { Plus, Filter, Eye, Edit, Trash2, FileText, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Table, TableSkeleton } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { usePosts, usePostActions } from '@/hooks/useAPI'
import { useToast } from '@/contexts/ToastContext'
import { mutate } from 'swr'

export default function PostsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    authorId: 1, // Default to admin user
  })

  const { data: response, isLoading, error } = usePosts(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  )
  const { create, update, publish, trash } = usePostActions()
  const { success, error: showError } = useToast()

  // Extract posts array from API response
  const posts = Array.isArray((response as any)?.data?.posts) ? (response as any).data.posts : []

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showError('Invalid Input', 'Title and content are required')
      return
    }

    try {
      setIsProcessing(true)
      await create(formData)
      success('Post Created', 'Blog post created successfully')
      mutate('/api/posts')
      setShowCreateModal(false)
      resetForm()
    } catch (err: any) {
      showError('Creation Failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedPost || !formData.title.trim() || !formData.content.trim()) {
      showError('Invalid Input', 'Title and content are required')
      return
    }

    try {
      setIsProcessing(true)
      await update(selectedPost.id, formData)
      success('Post Updated', 'Blog post updated successfully')
      mutate('/api/posts')
      setShowEditModal(false)
      resetForm()
    } catch (err: any) {
      showError('Update Failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePublish = async (postId: number) => {
    try {
      setIsProcessing(true)
      await publish(postId)
      success('Post Published', 'Blog post is now live')
      mutate('/api/posts')
    } catch (err: any) {
      showError('Publish Failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTrash = async (postId: number) => {
    try {
      setIsProcessing(true)
      await trash(postId)
      success('Post Trashed', 'Blog post moved to trash')
      mutate('/api/posts')
    } catch (err: any) {
      showError('Trash Failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEdit = (post: any) => {
    setSelectedPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      authorId: post.authorId,
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      authorId: 1,
    })
    setSelectedPost(null)
  }

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (post: any) => (
        <div>
          <p className="font-medium text-sm">{post.title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">/{post.slug}</p>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      render: (post: any) => post.author?.name || 'Unknown',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (post: any) => <StatusBadge status={post.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (post: any) => new Date(post.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (post: any) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(post)}
          />
          {post.status === 'DRAFT' && (
            <Button
              size="sm"
              variant="ghost"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => handlePublish(post.id)}
              loading={isProcessing}
            />
          )}
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleTrash(post.id)}
            loading={isProcessing}
          />
        </div>
      ),
    },
  ]

  const filteredPosts = posts.filter((post: any) =>
    post?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post?.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Blog Posts
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create and manage blog content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => mutate('/api/posts')}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            New Post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'TRASHED', label: 'Trashed' },
            ]}
            fullWidth
          />
        </div>
      </Card>

      {/* Posts Table */}
      <Card padding="none">
        {isLoading ? (
          <TableSkeleton rows={10} columns={5} />
        ) : error ? (
          <div className="p-6 text-center text-danger-600">
            Error loading posts: {error.message}
          </div>
        ) : (
          <Table
            data={filteredPosts}
            columns={columns}
            emptyMessage="No posts found"
          />
        )}
      </Card>

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        title="Create New Post"
        size="xl"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Enter post title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
          />

          <Textarea
            label="Excerpt"
            placeholder="Brief description (optional)"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={2}
            fullWidth
          />

          <Textarea
            label="Content"
            placeholder="Write your post content..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            fullWidth
            required
          />

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              loading={isProcessing}
            >
              Create Post
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          resetForm()
        }}
        title="Edit Post"
        size="xl"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Enter post title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
          />

          <Textarea
            label="Excerpt"
            placeholder="Brief description (optional)"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={2}
            fullWidth
          />

          <Textarea
            label="Content"
            placeholder="Write your post content..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            fullWidth
            required
          />

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              loading={isProcessing}
            >
              Update Post
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  )
}
