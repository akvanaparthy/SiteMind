'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          No Order Found
        </h1>
        <Link href="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Icon */}
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-success-600 dark:text-success-400" />
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
          Thank you for your purchase.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Your order <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">#{orderId}</span> has been confirmed.
        </p>
      </div>

      {/* Order Details Card */}
      <Card className="mb-8">
        <CardContent>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Package className="w-6 h-6" />
            What's Next?
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Order Confirmation
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You'll receive an email confirmation shortly with your order details.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Processing
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We're preparing your items for shipment. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Shipping
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You'll receive tracking information once your order ships.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button variant="secondary" icon={<Home className="w-5 h-5" />} fullWidth>
            Back to Home
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="primary" icon={<ShoppingBag className="w-5 h-5" />} fullWidth>
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }>
        <OrderConfirmationContent />
      </Suspense>
    </div>
  )
}
