import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  dot?: boolean
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
    info: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    secondary: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  }

  const dotVariants = {
    default: 'bg-slate-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-primary-500',
    secondary: 'bg-slate-600',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotVariants[variant]}`} />}
      {children}
    </span>
  )
}

// Status-specific badges for convenience
export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    DELIVERED: { variant: 'success', label: 'Delivered' },
    REFUNDED: { variant: 'danger', label: 'Refunded' },
    CANCELLED: { variant: 'secondary', label: 'Cancelled' },
    OPEN: { variant: 'info', label: 'Open' },
    CLOSED: { variant: 'secondary', label: 'Closed' },
    DRAFT: { variant: 'secondary', label: 'Draft' },
    PUBLISHED: { variant: 'success', label: 'Published' },
    TRASHED: { variant: 'danger', label: 'Trashed' },
    LOW: { variant: 'secondary', label: 'Low' },
    MEDIUM: { variant: 'warning', label: 'Medium' },
    HIGH: { variant: 'danger', label: 'High' },
    URGENT: { variant: 'danger', label: 'Urgent' },
    SUCCESS: { variant: 'success', label: 'Success' },
    FAILED: { variant: 'danger', label: 'Failed' },
  }

  const config = statusMap[status] || { variant: 'default' as const, label: status }

  return <Badge variant={config.variant} dot>{config.label}</Badge>
}
