import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our full collection of high-quality products',
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
