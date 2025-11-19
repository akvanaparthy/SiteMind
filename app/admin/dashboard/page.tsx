'use client'

// Force dynamic rendering - admin pages need auth context
export const dynamic = 'force-dynamic'

import React from 'react'
import { ShoppingCart, DollarSign, Ticket, FileText, Activity } from 'lucide-react'
import { StatsCard } from '@/components/admin/StatsCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/Spinner'
import { useOrderStats, useSiteAnalytics, useAgentLogs } from '@/hooks/useAPI'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: orderStats, isLoading: loadingOrders } = useOrderStats()
  const { data: analytics, isLoading: loadingAnalytics } = useSiteAnalytics()
  const { data: recentLogs, isLoading: loadingLogs } = useAgentLogs({ limit: 5 })

  if (loadingOrders || loadingAnalytics) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  // Sample chart data (in production, this would come from API)
  const ordersChartData = [
    { name: 'Mon', orders: 12, revenue: 2400 },
    { name: 'Tue', orders: 19, revenue: 3800 },
    { name: 'Wed', orders: 15, revenue: 3000 },
    { name: 'Thu', orders: 22, revenue: 4400 },
    { name: 'Fri', orders: 28, revenue: 5600 },
    { name: 'Sat', orders: 25, revenue: 5000 },
    { name: 'Sun', orders: 18, revenue: 3600 },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value={analytics?.orders?.total || 0}
          icon={ShoppingCart}
          trend={{ value: 12.5, direction: 'up' }}
          description="vs last month"
        />
        <StatsCard
          title="Revenue"
          value={`$${analytics?.orders?.totalRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          trend={{ value: 8.2, direction: 'up' }}
          description="vs last month"
        />
        <StatsCard
          title="Open Tickets"
          value={analytics?.tickets?.open || 0}
          icon={Ticket}
          trend={{ value: 3.1, direction: 'down' }}
          description="vs last week"
        />
        <StatsCard
          title="Published Posts"
          value={analytics?.posts?.published || 0}
          icon={FileText}
          trend={{ value: 0, direction: 'neutral' }}
          description="total published"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ordersChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Agent Activity</CardTitle>
              <Link href="/admin/agent/logs">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <div className="py-4">
                <LoadingSpinner text="Loading logs..." />
              </div>
            ) : !recentLogs?.logs || recentLogs.logs.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {Array.isArray(recentLogs?.logs) && recentLogs.logs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-slate-100 font-medium truncate">
                        {log.task}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={log.status === 'SUCCESS' ? 'success' : log.status === 'FAILED' ? 'danger' : 'warning'}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/orders">
                <Button variant="secondary" fullWidth className="h-20 flex-col">
                  <ShoppingCart className="w-6 h-6 mb-2" />
                  <span className="text-sm">View Orders</span>
                </Button>
              </Link>
              <Link href="/admin/tickets">
                <Button variant="secondary" fullWidth className="h-20 flex-col">
                  <Ticket className="w-6 h-6 mb-2" />
                  <span className="text-sm">Support Tickets</span>
                </Button>
              </Link>
              <Link href="/admin/posts">
                <Button variant="secondary" fullWidth className="h-20 flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">Blog Posts</span>
                </Button>
              </Link>
              <Link href="/admin/agent/console">
                <Button variant="primary" fullWidth className="h-20 flex-col">
                  <Activity className="w-6 h-6 mb-2" />
                  <span className="text-sm">Agent Console</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
