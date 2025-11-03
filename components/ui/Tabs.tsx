'use client'

import React, { Fragment } from 'react'
import { Tab } from '@headlessui/react'

export interface TabItem {
  label: string
  content: React.ReactNode
  icon?: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  defaultIndex?: number
  onChange?: (index: number) => void
  className?: string
}

export function Tabs({ tabs, defaultIndex = 0, onChange, className = '' }: TabsProps) {
  return (
    <Tab.Group defaultIndex={defaultIndex} onChange={onChange}>
      <Tab.List className={`flex space-x-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 ${className}`}>
        {tabs.map((tab, index) => (
          <Tab key={index} as={Fragment}>
            {({ selected }) => (
              <button
                className={`
                  flex-1 rounded-lg py-2.5 px-4 text-sm font-medium leading-5
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  ${selected
                    ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              </button>
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {tabs.map((tab, index) => (
          <Tab.Panel
            key={index}
            className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
          >
            {tab.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  )
}
