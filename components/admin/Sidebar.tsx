'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Ticket,
  Settings,
  Bot,
  ListTree,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react'
import { useAgent } from '@/contexts/AgentContext'
import { Badge } from '@/components/ui/Badge'

export interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Blog Posts', href: '/admin/posts', icon: FileText },
  { name: 'Support Tickets', href: '/admin/tickets', icon: Ticket },
  { name: 'Site Settings', href: '/admin/settings', icon: Settings },
  { name: 'Agent Console', href: '/admin/agent/console', icon: Bot },
  { name: 'Agent Logs', href: '/admin/agent/logs', icon: ListTree },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { agentStatus } = useAgent()

  const getAgentStatusBadge = () => {
    const statusConfig = {
      online: { variant: 'success' as const, label: 'Online' },
      offline: { variant: 'secondary' as const, label: 'Offline' },
      busy: { variant: 'warning' as const, label: 'Busy' },
    }
    return statusConfig[agentStatus]
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                SiteMind
              </span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm">{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Agent Status */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {collapsed ? (
            <div className="flex justify-center">
              <div className={`w-3 h-3 rounded-full ${
                agentStatus === 'online' ? 'bg-success-500' :
                agentStatus === 'busy' ? 'bg-warning-500' :
                'bg-slate-400'
              }`} />
            </div>
          ) : (
            <div className="glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  AI Agent
                </span>
                <Badge variant={getAgentStatusBadge().variant} size="sm" dot>
                  {getAgentStatusBadge().label}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {agentStatus === 'online' ? 'Ready to assist' :
                 agentStatus === 'busy' ? 'Processing...' :
                 'Connecting...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
