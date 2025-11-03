'use client'

import React from 'react'
import { Switch as HeadlessSwitch } from '@headlessui/react'

export interface SwitchProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Switch({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: SwitchProps) {
  return (
    <HeadlessSwitch.Group>
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex-1">
          {label && (
            <HeadlessSwitch.Label className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
              {label}
            </HeadlessSwitch.Label>
          )}
          {description && (
            <HeadlessSwitch.Description className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {description}
            </HeadlessSwitch.Description>
          )}
        </div>
        <HeadlessSwitch
          checked={enabled}
          onChange={onChange}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${enabled
              ? 'bg-primary-600'
              : 'bg-slate-300 dark:bg-slate-600'
            }
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </HeadlessSwitch>
      </div>
    </HeadlessSwitch.Group>
  )
}
