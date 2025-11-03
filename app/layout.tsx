import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: {
    default: 'SiteMind - AI-Powered E-Commerce Platform',
    template: '%s | SiteMind',
  },
  description: 'Experience the next generation of e-commerce with AI-native operations, real-time automation, and intelligent customer support.',
  keywords: ['e-commerce', 'AI', 'automation', 'online store', 'artificial intelligence', 'shopping'],
  authors: [{ name: 'SiteMind Team' }],
  creator: 'SiteMind',
  publisher: 'SiteMind',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sitemind.com',
    title: 'SiteMind - AI-Powered E-Commerce Platform',
    description: 'Experience the next generation of e-commerce with AI-native operations',
    siteName: 'SiteMind',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteMind - AI-Powered E-Commerce Platform',
    description: 'Experience the next generation of e-commerce with AI-native operations',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
