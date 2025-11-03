import type { Metadata } from 'next'
import { AdminLayout } from '@/components/admin/AdminLayout'

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin Dashboard',
  },
  description: 'SiteMind admin dashboard for managing your e-commerce platform',
  robots: {
    index: false,
    follow: false,
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
