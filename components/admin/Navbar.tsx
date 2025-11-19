'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Search, Sun, Moon, User, LogOut, Settings } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { Dropdown } from '@/components/ui/Dropdown'
import { Avatar } from '@/components/ui/Avatar'

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      isLast: index === array.length - 1,
    }))

  const userMenuItems = [
    {
      label: 'Settings',
      onClick: () => console.log('Settings'),
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: 'Logout',
      onClick: logout,
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
    },
  ]

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6">
      <div className="h-full flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span
                className={
                  crumb.isLast
                    ? 'font-medium text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400'
                }
              >
                {crumb.name}
              </span>
              {!crumb.isLast && (
                <span className="text-slate-400 dark:text-slate-600">/</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

          {/* User Menu */}
          <Dropdown
            items={userMenuItems}
            trigger={
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Avatar name={user?.username || 'Admin'} size="sm" />
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.username || 'Admin'}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{user?.role || 'admin'}</p>
                </div>
              </div>
            }
            align="right"
          />
        </div>
      </div>
    </header>
  )
}
