import React, { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: LucideIcon | ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  } | ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  // Check if icon is a LucideIcon component or ReactNode
  const isIconComponent = typeof icon === 'function'
  const IconComponent = isIconComponent ? (icon as LucideIcon) : null

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="mb-4 p-3 rounded-full bg-slate-100 dark:bg-slate-800">
          {isIconComponent && IconComponent ? (
            <IconComponent className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          ) : (
            <div className="text-slate-400 dark:text-slate-500">{icon as ReactNode}</div>
          )}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        typeof action === 'object' && 'label' in action ? (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        ) : (
          action as ReactNode
        )
      )}
    </div>
  )
}
