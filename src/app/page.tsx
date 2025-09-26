"use client";

import Link from "next/link";
import {
  Bot,
  Zap,
  Shield,
  ArrowRight,
  TrendingUp,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProductGrid } from "@/components/store/ProductGrid";
import { CartButton } from "@/components/store/CartButton";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Operations",
    description:
      "Every operation is monitored and executable by our advanced AI agent",
  },
  {
    icon: Zap,
    title: "Real-Time Monitoring",
    description:
      "Watch your AI agent work, audit decisions, and intervene when needed",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with comprehensive audit trails",
  },
  {
    icon: TrendingUp,
    title: "Smart Analytics",
    description: "AI-driven insights to optimize your business performance",
  },
];

const stats = [
  { label: "Orders Processed", value: "10K+" },
  { label: "AI Tasks Completed", value: "50K+" },
  { label: "Success Rate", value: "99.8%" },
  { label: "Active Users", value: "1.2K+" },
];

const featuredProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    description:
      "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    price: 299.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Electronics",
    stock: 50,
    isActive: true,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description:
      "Advanced fitness tracking with heart rate monitoring, GPS, and water resistance.",
    price: 199.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Electronics",
    stock: 25,
    isActive: true,
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    slug: "organic-cotton-tshirt",
    description:
      "Comfortable and sustainable organic cotton t-shirt in various colors.",
    price: 29.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Clothing",
    stock: 100,
    isActive: true,
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
  {
    id: 4,
    name: "Professional Camera Lens",
    slug: "professional-camera-lens",
    description:
      "High-quality 50mm f/1.8 lens perfect for portrait and low-light photography.",
    price: 449.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Photography",
    stock: 15,
    isActive: true,
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
  },
];

const latestPosts = [
  {
    id: 1,
    title: "The Future of AI in E-Commerce",
    slug: "future-ai-ecommerce",
    excerpt:
      "Exploring how artificial intelligence is revolutionizing online shopping experiences and transforming the way businesses interact with customers.",
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
    author: { name: "AI Agent", email: "agent@sitemind.com" },
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Floating Cart Button */}
      <CartButton
        items={[]}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        onClearCart={() => {}}
        variant="floating"
      />
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">SiteMind</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/products">
                <Button variant="ghost">Products</Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost">Blog</Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button variant="ghost">Admin Dashboard</Button>
              </Link>
              <CartButton
                items={[]}
                onUpdateQuantity={() => {}}
                onRemoveItem={() => {}}
                onClearCart={() => {}}
                variant="minimal"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              The Future of
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                E-Commerce
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              An AI-native e-commerce platform where every operation is
              monitored and executable by an intelligent agent. Experience the
              power of autonomous business management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="px-8 py-4">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button variant="secondary" size="lg" className="px-8 py-4">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Powered by AI, Built for Scale
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our platform combines the best of modern e-commerce with
              cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index}>
                <Card variant="glass" hover className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium products
            </p>
          </div>

          <ProductGrid
            products={featuredProducts}
            columns={4}
            variant="featured"
            onAddToCart={() => {}}
            onToggleWishlist={() => {}}
          />

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="px-8 py-4">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Latest from Our Blog
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Stay updated with the latest insights on AI, e-commerce, and
              technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              <Card key={post.id} variant="glass" hover className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-slate-500 mb-3">
                    <User className="h-4 w-4" />
                    <span>{post.author.name}</span>
                    <span>•</span>
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="secondary" className="w-full">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/blog">
              <Button size="lg" variant="secondary" className="px-8 py-4">
                View All Posts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of businesses already using AI to automate their
            operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="px-8 py-4">
                Shop Now
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button
                size="lg"
                variant="ghost"
                className="px-8 py-4 text-white border-white hover:bg-white/10"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">SiteMind</span>
            </div>
            <div className="text-slate-400">
              © 2024 SiteMind. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
