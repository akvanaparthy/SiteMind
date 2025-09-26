"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  User,
  ArrowRight,
  Search,
  Filter,
  Clock,
} from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "TRASHED";
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const mockPosts: BlogPost[] = [
  {
    id: 1,
    title: "The Future of AI in E-Commerce",
    slug: "future-ai-ecommerce",
    excerpt:
      "Exploring how artificial intelligence is revolutionizing online shopping experiences and transforming the way businesses interact with customers.",
    content: "Full content here...",
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
      "Best practices for creating web applications that can handle millions of users while maintaining performance and reliability.",
    content: "Full content here...",
    status: "PUBLISHED",
    author: { name: "Jane Smith", email: "jane@example.com" },
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
  },
  {
    id: 3,
    title: "Customer Support Automation with AI",
    slug: "customer-support-automation",
    excerpt:
      "How AI-powered chatbots and automated systems are transforming customer service and improving response times.",
    content: "Full content here...",
    status: "PUBLISHED",
    author: { name: "AI Agent", email: "agent@sitemind.com" },
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
  {
    id: 4,
    title: "Modern E-Commerce Trends 2024",
    slug: "ecommerce-trends-2024",
    excerpt:
      "Discover the latest trends shaping the e-commerce landscape in 2024, from AI integration to sustainable practices.",
    content: "Full content here...",
    status: "PUBLISHED",
    author: { name: "Sarah Johnson", email: "sarah@example.com" },
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
  },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchPosts = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPosts(mockPosts);
      setFilteredPosts(mockPosts);
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      // For now, we'll filter by author as a proxy for category
      filtered = filtered.filter(
        (post) => post.author.name === selectedCategory
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedCategory]);

  const categories = [
    "all",
    ...Array.from(new Set(posts.map((post) => post.author.name))),
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6"
                >
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Insights, tutorials, and updates about AI, e-commerce, and modern
            web development
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Authors" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <User className="h-4 w-4" />
                    <span>{post.author.name}</span>
                    <span>•</span>
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{getReadingTime(post.content)} min read</span>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <span>Read More</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {posts.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Total Posts
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {categories.length - 1}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Authors</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {posts.reduce(
                  (acc, post) => acc + getReadingTime(post.content),
                  0
                )}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Total Reading Time (min)
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
