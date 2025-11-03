'use client'

import React, { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { MoreVertical } from 'lucide-react'

export interface DropdownItem {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  danger?: boolean
  disabled?: boolean
}

export interface DropdownProps {
  items: DropdownItem[]
  trigger?: React.ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ items, trigger, align = 'right', className = '' }: DropdownProps) {
  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <Menu.Button className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        {trigger || <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute z-10 mt-2 w-56 origin-top-${align} ${align === 'right' ? 'right-0' : 'left-0'} rounded-lg bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-slate-100 dark:divide-slate-700`}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <Menu.Item key={index} disabled={item.disabled}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={`
                      group flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors
                      ${active ? 'bg-slate-50 dark:bg-slate-700' : ''}
                      ${item.danger ? 'text-danger-600 dark:text-danger-400' : 'text-slate-900 dark:text-slate-100'}
                      ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
