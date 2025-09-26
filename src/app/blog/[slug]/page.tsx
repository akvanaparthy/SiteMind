"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  MessageCircle,
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
    content: `
      <h2>Introduction</h2>
      <p>Artificial Intelligence (AI) is rapidly transforming the e-commerce landscape, revolutionizing how businesses interact with customers and optimize their operations. From personalized shopping experiences to automated customer service, AI is reshaping the future of online retail.</p>
      
      <h2>The Current State of AI in E-Commerce</h2>
      <p>Today's e-commerce platforms are leveraging AI in numerous ways:</p>
      <ul>
        <li><strong>Personalized Recommendations:</strong> Machine learning algorithms analyze customer behavior to suggest relevant products</li>
        <li><strong>Chatbots and Virtual Assistants:</strong> AI-powered customer service that provides instant support</li>
        <li><strong>Dynamic Pricing:</strong> Real-time price optimization based on market conditions and demand</li>
        <li><strong>Inventory Management:</strong> Predictive analytics for stock optimization</li>
      </ul>
      
      <h2>Emerging Trends</h2>
      <p>Several exciting trends are emerging in AI-powered e-commerce:</p>
      
      <h3>Visual Search and Recognition</h3>
      <p>Customers can now search for products using images, making it easier to find exactly what they're looking for. This technology uses computer vision to identify products and match them with similar items in the catalog.</p>
      
      <h3>Voice Commerce</h3>
      <p>Voice assistants are becoming increasingly popular for shopping. Customers can place orders, check product availability, and get recommendations through simple voice commands.</p>
      
      <h3>Augmented Reality (AR) Shopping</h3>
      <p>AR technology allows customers to visualize products in their own environment before making a purchase, reducing return rates and increasing customer satisfaction.</p>
      
      <h2>Benefits for Businesses</h2>
      <p>AI implementation in e-commerce offers numerous benefits:</p>
      <ul>
        <li>Increased conversion rates through personalized experiences</li>
        <li>Reduced operational costs through automation</li>
        <li>Better customer insights and analytics</li>
        <li>Improved inventory management and demand forecasting</li>
        <li>Enhanced fraud detection and security</li>
      </ul>
      
      <h2>Challenges and Considerations</h2>
      <p>While AI offers tremendous opportunities, businesses must also consider:</p>
      <ul>
        <li>Data privacy and security concerns</li>
        <li>Initial implementation costs and complexity</li>
        <li>Need for skilled personnel to manage AI systems</li>
        <li>Potential for algorithmic bias</li>
      </ul>
      
      <h2>The Future Outlook</h2>
      <p>As AI technology continues to advance, we can expect even more sophisticated applications in e-commerce. The integration of AI with other emerging technologies like blockchain and IoT will create new possibilities for seamless, intelligent shopping experiences.</p>
      
      <p>The future of e-commerce is undoubtedly AI-driven, and businesses that embrace these technologies early will have a significant competitive advantage in the evolving digital marketplace.</p>
    `,
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
    content: `
      <h2>Introduction</h2>
      <p>Building scalable web applications is crucial for modern businesses that need to handle growing user bases and increasing data loads. This comprehensive guide covers the essential strategies and technologies needed to create applications that can scale effectively.</p>
      
      <h2>Understanding Scalability</h2>
      <p>Scalability refers to a system's ability to handle increased load by adding resources. There are two main types:</p>
      <ul>
        <li><strong>Vertical Scaling (Scale Up):</strong> Adding more power to existing machines</li>
        <li><strong>Horizontal Scaling (Scale Out):</strong> Adding more machines to the system</li>
      </ul>
      
      <h2>Architecture Patterns</h2>
      <h3>Microservices Architecture</h3>
      <p>Breaking down applications into smaller, independent services that can be developed, deployed, and scaled independently.</p>
      
      <h3>Load Balancing</h3>
      <p>Distributing incoming requests across multiple servers to ensure optimal resource utilization and high availability.</p>
      
      <h3>Caching Strategies</h3>
      <p>Implementing various caching layers to reduce database load and improve response times.</p>
      
      <h2>Database Optimization</h2>
      <p>Database performance is often the bottleneck in scalable applications. Key strategies include:</p>
      <ul>
        <li>Database indexing and query optimization</li>
        <li>Read replicas for read-heavy workloads</li>
        <li>Database sharding for large datasets</li>
        <li>Connection pooling and query caching</li>
      </ul>
      
      <h2>Performance Monitoring</h2>
      <p>Continuous monitoring is essential for maintaining scalability. Key metrics to track include:</p>
      <ul>
        <li>Response times and throughput</li>
        <li>Error rates and availability</li>
        <li>Resource utilization (CPU, memory, disk)</li>
        <li>Database performance metrics</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Building scalable web applications requires careful planning, the right architecture, and continuous optimization. By following these best practices, you can create applications that grow with your business needs.</p>
    `,
    status: "PUBLISHED",
    author: { name: "Jane Smith", email: "jane@example.com" },
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
  },
];

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      const resolvedParams = await params;
      const foundPost = mockPosts.find((p) => p.slug === resolvedParams.slug);

      if (foundPost) {
        setPost(foundPost);
        // Get related posts (exclude current post)
        setRelatedPosts(
          mockPosts.filter((p) => p.id !== foundPost.id).slice(0, 3)
        );
      }

      setIsLoading(false);
    };

    fetchPost();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="max-w-4xl mx-auto">
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-300 dark:bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/blog">
            <Button variant="secondary" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blog</span>
            </Button>
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <User className="h-4 w-4" />
            <span>{post.author.name}</span>
            <span>•</span>
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.createdAt)}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span>{getReadingTime(post.content)} min read</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            {post.excerpt}
          </p>

          <div className="flex items-center space-x-4">
            <Button
              onClick={handleShare}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button variant="secondary" className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <Card>
            <CardContent className="p-8">
              <div
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Author Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {post.author.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {post.author.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Published on {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-4">
                        <User className="h-3 w-3" />
                        <span>{relatedPost.author.name}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(relatedPost.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Comments
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Comments are currently disabled. We&apos;re working on
                implementing a comment system powered by AI moderation.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
