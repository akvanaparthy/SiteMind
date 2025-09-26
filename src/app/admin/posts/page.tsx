"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { DataTable } from "@/components/admin/DataTable";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  User,
  Bot,
} from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  status: "DRAFT" | "PUBLISHED" | "TRASHED";
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

const mockPosts: Post[] = [
  {
    id: 1,
    title: "The Future of AI in E-Commerce",
    slug: "future-ai-ecommerce",
    excerpt:
      "Exploring how artificial intelligence is revolutionizing online shopping experiences...",
    status: "PUBLISHED",
    author: { name: "John Doe", email: "john@example.com" },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    title: "Building Scalable Web Applications",
    slug: "scalable-web-apps",
    excerpt:
      "Best practices for creating web applications that can handle millions of users...",
    status: "DRAFT",
    author: { name: "Jane Smith", email: "jane@example.com" },
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
  },
  {
    id: 3,
    title: "Customer Support Automation",
    slug: "customer-support-automation",
    excerpt: "How AI-powered chatbots are transforming customer service...",
    status: "PUBLISHED",
    author: { name: "AI Agent", email: "agent@sitemind.com" },
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
];

const statusColors = {
  DRAFT:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  PUBLISHED:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  TRASHED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (value: unknown) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: "author",
      label: "Author",
      render: (value: unknown) => {
        const author = value as { name: string; email: string };
        return (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>{author.name}</span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => {
        const status = value as keyof typeof statusColors;
        return <Badge className={statusColors[status]}>{status}</Badge>;
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: unknown) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date(value as string).toLocaleDateString()}</span>
        </div>
      ),
    },
  ];

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const handleGenerateWithAI = () => {
    // This would trigger the AI agent to generate a blog post
    console.log("Generating blog post with AI...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Blog Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your blog content and create new posts
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={handleGenerateWithAI}
            className="flex items-center space-x-2"
          >
            <Bot className="h-4 w-4" />
            <span>Generate with AI</span>
          </Button>
          <Button
            onClick={handleCreatePost}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Post</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Posts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Published
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.filter((p) => p.status === "PUBLISHED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Drafts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.filter((p) => p.status === "DRAFT").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={posts}
            columns={columns}
            actions={(post) => (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPost(post);
                    // Open view modal
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPost(post);
                    setIsEditModalOpen(true);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPosts((prev) =>
                      prev.map((p) =>
                        p.id === post.id
                          ? {
                              ...p,
                              status:
                                p.status === "PUBLISHED"
                                  ? "DRAFT"
                                  : "PUBLISHED",
                            }
                          : p
                      )
                    );
                  }}
                  className="h-8 w-8 p-0"
                >
                  {post.status === "PUBLISHED" ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPosts((prev) =>
                      prev.map((p) =>
                        p.id === post.id ? { ...p, status: "TRASHED" } : p
                      )
                    );
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            onRowClick={(post: Post) => setSelectedPost(post)}
          />
        </CardContent>
      </Card>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <h2 className="text-xl font-bold mb-4">Create New Post</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter post title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <RichTextEditor
                  placeholder="Write your post content..."
                  className="min-h-[200px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Excerpt
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Brief description of the post..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsCreateModalOpen(false)}>
                Create Post
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Post Modal */}
      {isEditModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <h2 className="text-xl font-bold mb-4">Edit Post</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  defaultValue={selectedPost.title}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <RichTextEditor
                  content={selectedPost.excerpt}
                  placeholder="Write your post content..."
                  className="min-h-[200px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  defaultValue={selectedPost.status}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="TRASHED">Trashed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>
                Save Changes
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
