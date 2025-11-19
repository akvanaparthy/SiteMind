'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Sparkles, Truck, Shield, Star, FileText, Menu, X, ShoppingCart, Package, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { useFeaturedProducts, usePosts } from '@/hooks/useAPI'
import { useCart } from '@/contexts/CartContext'
import { Badge } from '@/components/ui/Badge'
import type { Product, Post } from '@/types/api'

export default function HomePage() {
  const { data: productsResponse } = useFeaturedProducts(4)
  const featuredProducts = Array.isArray(productsResponse?.data) ? productsResponse.data : []
  const { data: posts } = usePosts({ status: 'PUBLISHED', limit: 3 })
  const recentPosts = Array.isArray(posts) ? posts : []
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { itemCount, addItem } = useCart()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                SiteMind
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors relative group">
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/blog" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors relative group">
                Blog
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/cart" className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:scale-110">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>
              <Link href="/admin/dashboard">
                <Button variant="primary" size="sm" className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-shadow">
                  Admin
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-2">
                <Link
                  href="/products"
                  className="block px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/blog"
                  className="block px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                  </span>
                  {itemCount > 0 && (
                    <Badge variant="success">{itemCount}</Badge>
                  )}
                </Link>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="primary" size="sm" fullWidth className="mt-2">
                    Admin Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary-400/20 via-primary-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-success-400/15 via-success-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-500/5 to-success-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                  Welcome to SiteMind
                </span>
              </div>

              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
                Shop the
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-success-500 bg-clip-text text-transparent animate-gradient">
                  Future
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-light"
            >
              Discover curated products, lightning-fast delivery, and exceptional quality. Your premium shopping experience starts here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/products">
                <Button size="lg" icon={<ShoppingBag className="w-5 h-5" />} className="shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 transform hover:-translate-y-1 transition-all duration-300">
                  Explore Collection
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="secondary" size="lg" icon={<FileText className="w-5 h-5" />} className="shadow-lg hover:shadow-xl transition-all duration-300">
                  Latest Stories
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="flex flex-wrap items-center justify-center gap-8 pt-8"
            >
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Shield className="w-5 h-5 text-success-500" />
                <span className="text-sm font-medium">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Truck className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Award className="w-5 h-5 text-warning-500" />
                <span className="text-sm font-medium">Premium Quality</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/30 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(100 116 139) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Why Shop with Us
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Experience the perfect blend of quality, speed, and security in every purchase
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Package className="w-7 h-7" />}
              title="Premium Quality"
              description="Carefully curated products from trusted brands with quality assurance"
              gradient="from-primary-500 to-primary-600"
              delay={0}
            />
            <FeatureCard
              icon={<Truck className="w-7 h-7" />}
              title="Express Delivery"
              description="Lightning-fast shipping with real-time tracking and updates"
              gradient="from-success-500 to-success-600"
              delay={0.1}
            />
            <FeatureCard
              icon={<Shield className="w-7 h-7" />}
              title="Secure Shopping"
              description="Enterprise-grade security protecting your data and transactions"
              gradient="from-warning-500 to-warning-600"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Featured Products
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Handpicked selections just for you
              </p>
            </div>
            <Link href="/products" className="hidden sm:block">
              <Button variant="ghost" icon={<ArrowRight className="w-4 h-4" />} className="group">
                <span className="group-hover:mr-1 transition-all">View All</span>
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} addItem={addItem} />
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products">
              <Button variant="ghost" icon={<ArrowRight className="w-4 h-4" />}>
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Latest Stories
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Insights, updates, and inspiration from our community
              </p>
            </div>
            <Link href="/blog" className="hidden sm:block">
              <Button variant="ghost" icon={<ArrowRight className="w-4 h-4" />} className="group">
                <span className="group-hover:mr-1 transition-all">View All</span>
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentPosts?.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/blog">
              <Button variant="ghost" icon={<ArrowRight className="w-4 h-4" />}>
                Read All Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-500/10 via-primary-600/5 to-success-500/10"></div>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover your next favorite product today
            </p>
            <div className="pt-4">
              <Link href="/products">
                <Button size="lg" icon={<ShoppingBag className="w-5 h-5" />} className="shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:-translate-y-1 transition-all duration-300">
                  Browse Products Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-2xl">SiteMind</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Your premium destination for quality products, exceptional service, and a seamless shopping experience.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Shop</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">Admin</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} SiteMind. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient, delay }: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <Card hover className="h-full group border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
        <CardContent className="p-8 text-center">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ProductCard({ product, addItem }: {
  product: Product
  addItem: (item: any) => void
}) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      stock: product.stock,
      image: null,
    })
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <Card hover padding="none" className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
        <CardContent className="p-0">
          <div className="aspect-square bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
          </div>
          <div className="p-5 space-y-3">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function BlogCard({ post }: { post: Post }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card hover padding="none" className="group h-full overflow-hidden border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
        <CardContent className="p-0">
          <div className="aspect-video bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                {formatDate(post.publishedAt || post.createdAt)}
              </span>
            </div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
              {post.excerpt || post.content.slice(0, 150)}
            </p>
            <div className="pt-2">
              <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} className="group/btn">
                <span className="group-hover/btn:mr-1 transition-all">Read More</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
