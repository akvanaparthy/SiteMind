import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  description?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className = '',
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null

    const iconClass = "w-4 h-4"
    if (trend.direction === 'up') {
      return <TrendingUp className={`${iconClass} text-success-500`} />
    }
    if (trend.direction === 'down') {
      return <TrendingDown className={`${iconClass} text-danger-500`} />
    }
    return <Minus className={`${iconClass} text-slate-400`} />
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend.direction === 'up') return 'text-success-600 dark:text-success-400'
    if (trend.direction === 'down') return 'text-danger-600 dark:text-danger-400'
    return 'text-slate-600 dark:text-slate-400'
  }

  return (
    <Card className={`relative overflow-hidden ${className}`} hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {value}
          </p>

          {trend && (
            <div className="flex items-center gap-1.5">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trend.value}%
              </span>
              {description && (
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-2xl -z-10" />
    </Card>
  )
}
