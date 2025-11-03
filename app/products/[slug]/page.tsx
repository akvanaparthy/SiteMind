'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Star, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useProduct } from '@/hooks/useAPI'

export default function ProductDetailPage() {
  const params = useParams()
  const [quantity, setQuantity] = useState(1)

  const { data: product, isLoading } = useProduct(params.slug as string)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Product Not Found
          </h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/products" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </nav>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <Card padding="none">
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl" />
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < 4
                        ? 'text-warning-500 fill-warning-500'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                4.5 (128 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <Badge variant="success" dot>
                  In Stock ({product.stock} available)
                </Badge>
              ) : (
                <Badge variant="danger" dot>
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {product.description}
            </p>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Description
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Add to Cart */}
            <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={product.stock === 0}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-semibold text-slate-900 dark:text-slate-100">
                      {quantity}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={product.stock === 0}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="primary"
                    icon={<ShoppingCart className="w-5 h-5" />}
                    fullWidth
                    disabled={product.stock === 0}
                    size="lg"
                  >
                    Add to Cart - ${(product.price * quantity).toFixed(2)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Link key={i} href={`/products/related-${i}`}>
                <Card hover padding="none">
                  <CardContent>
                    <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-t-xl" />
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        Related Product {i}
                      </h3>
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        $99.99
                      </span>
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
