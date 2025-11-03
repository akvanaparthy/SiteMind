import React from 'react'
import { User } from 'lucide-react'

export interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    )
  }

  if (name) {
    return (
      <div
        className={`${sizes[size]} rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center ${className}`}
      >
        {getInitials(name)}
      </div>
    )
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center ${className}`}
    >
      <User className="w-1/2 h-1/2" />
    </div>
  )
}
