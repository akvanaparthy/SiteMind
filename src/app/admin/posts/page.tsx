"use client";

import { useState, useEffect } from "react";
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

const statusColors = {
  DRAFT:
    "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200",
  PUBLISHED:
    "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200",
  TRASHED:
    "bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200",
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: "",
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (value: unknown) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-secondary-500" />
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
            <User className="h-4 w-4 text-secondary-500" />
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
          <Calendar className="h-4 w-4 text-secondary-500" />
          <span>{new Date(value as string).toLocaleDateString()}</span>
        </div>
      ),
    },
  ];

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const handleGenerateWithAI = async () => {
    try {
      // First, get AI-generated content
      const response = await fetch("/api/agent/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: "Create a blog post about AI trends in e-commerce",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("AI generated content:", data);

        // Create the post in the database
        const postResponse = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "AI Trends in E-Commerce: The Future of Online Shopping",
            content:
              data.result?.response ||
              "AI-generated content about e-commerce trends...",
            excerpt:
              "Explore the latest AI trends revolutionizing the e-commerce industry and how they're shaping the future of online shopping.",
            status: "DRAFT",
          }),
        });

        if (postResponse.ok) {
          // Refresh posts list
          const postsResponse = await fetch("/api/posts");
          const postsData = await postsResponse.json();
          setPosts(postsData.posts || []);

          // Show success message
          alert("AI-generated blog post created successfully!");
        } else {
          console.error("Error creating post:", await postResponse.text());
        }
      }
    } catch (error) {
      console.error("Error generating post with AI:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Blog Posts
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              Manage your blog content and create new posts
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            Blog Posts
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
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
              <div className="p-2 bg-info-100 dark:bg-info-900 rounded-lg">
                <FileText className="h-6 w-6 text-info-600 dark:text-info-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Total Posts
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {posts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-success-100 dark:bg-success-900 rounded-lg">
                <Eye className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Published
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {posts.filter((p) => p.status === "PUBLISHED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <FileText className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Drafts
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
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
                  onClick={async () => {
                    const newStatus =
                      post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
                    try {
                      const response = await fetch(`/api/posts/${post.id}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ status: newStatus }),
                      });

                      if (response.ok) {
                        setPosts((prev) =>
                          prev.map((p) =>
                            p.id === post.id ? { ...p, status: newStatus } : p
                          )
                        );
                      }
                    } catch (error) {
                      console.error("Error updating post status:", error);
                    }
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
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/posts/${post.id}`, {
                        method: "DELETE",
                      });

                      if (response.ok) {
                        setPosts((prev) =>
                          prev.filter((p) => p.id !== post.id)
                        );
                      }
                    } catch (error) {
                      console.error("Error deleting post:", error);
                    }
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
            className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <h2 className="text-xl font-bold mb-4 text-secondary-900 dark:text-white">
              Create New Post
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                  placeholder="Enter post title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Content
                </label>
                <RichTextEditor
                  content={newPost.content}
                  onChange={(content) => setNewPost({ ...newPost, content })}
                  placeholder="Write your post content..."
                  className="min-h-[200px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Excerpt
                </label>
                <textarea
                  rows={3}
                  value={newPost.excerpt}
                  onChange={(e) =>
                    setNewPost({ ...newPost, excerpt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                  placeholder="Brief description of the post..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewPost({ title: "", content: "", excerpt: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/posts", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        title: newPost.title,
                        content: newPost.content,
                        excerpt: newPost.excerpt,
                        status: "DRAFT",
                        authorId: 1, // Default author ID
                      }),
                    });

                    if (response.ok) {
                      const createdPost = await response.json();
                      setPosts((prev) => [createdPost, ...prev]);
                      setIsCreateModalOpen(false);
                      setNewPost({ title: "", content: "", excerpt: "" });
                    }
                  } catch (error) {
                    console.error("Error creating post:", error);
                  }
                }}
              >
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
            className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <h2 className="text-xl font-bold mb-4 text-secondary-900 dark:text-white">
              Edit Post
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Title
                </label>
                <input
                  type="text"
                  defaultValue={selectedPost.title}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Content
                </label>
                <RichTextEditor
                  content={selectedPost.excerpt}
                  placeholder="Write your post content..."
                  className="min-h-[200px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Status
                </label>
                <select
                  defaultValue={selectedPost.status}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
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
