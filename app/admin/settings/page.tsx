'use client'

// Force dynamic rendering - admin pages need auth context
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { Settings, Power, Trash2, Activity, Database, TrendingUp, Users, FileText, ShoppingCart, Ticket } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Spinner'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { useSiteStatus, useSiteAnalytics, useSiteHealth, useSiteActions } from '@/hooks/useAPI'
import { useToast } from '@/contexts/ToastContext'
import { mutate } from 'swr'

export default function SettingsPage() {
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: status, isLoading: loadingStatus } = useSiteStatus()
  const { data: analytics, isLoading: loadingAnalytics } = useSiteAnalytics()
  const { data: health, isLoading: loadingHealth } = useSiteHealth()
  const { toggleMaintenance, clearCache } = useSiteActions()
  const { success, error: showError } = useToast()

  const handleToggleMaintenance = async () => {
    try {
      setIsProcessing(true)
      const newState = !status?.maintenanceMode
      await toggleMaintenance(newState)
      success(
        newState ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
        newState ? 'Site is now in maintenance mode' : 'Site is now live'
      )
      mutate('/api/site?action=status')
      setShowMaintenanceModal(false)
    } catch (err: any) {
      showError('Operation Failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearCache = async () => {
    try {
      setIsProcessing(true)
      await clearCache()
      success('Cache Cleared', 'All caches have been cleared successfully')
      mutate('/api/site?action=status')
    } catch (err: any) {
      showError('Clear Failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loadingStatus || loadingAnalytics || loadingHealth) {
    return <LoadingSpinner text="Loading settings..." />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Site Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage site configuration and system settings
        </p>
      </div>

      {/* Site Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Site Status</CardTitle>
              <CardDescription>Control site availability and maintenance mode</CardDescription>
            </div>
            <Badge
              variant={status?.maintenanceMode ? 'danger' : 'success'}
              size="lg"
              dot
            >
              {status?.maintenanceMode ? 'Maintenance Mode' : 'Live'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Switch
              enabled={status?.maintenanceMode || false}
              onChange={() => setShowMaintenanceModal(true)}
              label="Maintenance Mode"
              description="When enabled, the site will display a maintenance page to visitors"
            />

            {status?.maintenanceMode && (
              <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
                <p className="text-sm text-warning-900 dark:text-warning-200 font-medium">
                  Warning: Site is currently in maintenance mode
                </p>
                <p className="text-xs text-warning-700 dark:text-warning-300 mt-1">
                  Visitors will see a maintenance page. Only administrators can access the site.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
          <CardDescription>Clear system caches to refresh content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Last Cleared
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {status?.lastCacheClear
                  ? new Date(status.lastCacheClear).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <Button
              variant="secondary"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleClearCache}
              loading={isProcessing}
            >
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Site Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Site Analytics</CardTitle>
          <CardDescription>Overview of site statistics and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Orders Stats */}
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {analytics?.orders?.total || 0}
                  </p>
                  <p className="text-xs text-success-600 dark:text-success-400">
                    ${analytics?.orders?.totalRevenue?.toLocaleString() || 0} revenue
                  </p>
                </div>
              </div>
            </div>

            {/* Tickets Stats */}
            <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-100 dark:bg-warning-800 rounded-lg">
                  <Ticket className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Tickets</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {((analytics?.tickets?.open || 0) + (analytics?.tickets?.closed || 0))}
                  </p>
                  <p className="text-xs text-warning-600 dark:text-warning-400">
                    {analytics?.tickets?.open || 0} open
                  </p>
                </div>
              </div>
            </div>

            {/* Posts Stats */}
            <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 dark:bg-success-800 rounded-lg">
                  <FileText className="w-5 h-5 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Blog Posts</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {((analytics?.posts?.published || 0) + (analytics?.posts?.draft || 0))}
                  </p>
                  <p className="text-xs text-success-600 dark:text-success-400">
                    {analytics?.posts?.published || 0} published
                  </p>
                </div>
              </div>
            </div>

            {/* Users Stats */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {analytics?.users?.total || 0}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {analytics?.users?.active || 0} active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Check */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Monitor system component status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Overall Health */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="font-medium text-sm">Overall Status</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Last checked: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Badge
                variant={health?.status === 'healthy' ? 'success' : 'danger'}
                dot
              >
                {health?.status === 'healthy' ? 'Healthy' : 'Issues Detected'}
              </Badge>
            </div>

            {/* Database */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="font-medium text-sm">Database Connection</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    PostgreSQL
                  </p>
                </div>
              </div>
              <Badge variant="success" dot>
                Connected
              </Badge>
            </div>

            {/* Agent Service */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Power className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="font-medium text-sm">AI Agent Service</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    WebSocket on port 3001
                  </p>
                </div>
              </div>
              <Badge variant="success" dot>
                Running
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Confirmation Modal */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title={status?.maintenanceMode ? 'Disable Maintenance Mode?' : 'Enable Maintenance Mode?'}
        description={
          status?.maintenanceMode
            ? 'The site will become accessible to all visitors.'
            : 'This will make the site unavailable to regular visitors. Only administrators will be able to access the site.'
        }
      >
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowMaintenanceModal(false)}>
            Cancel
          </Button>
          <Button
            variant={status?.maintenanceMode ? 'success' : 'danger'}
            onClick={handleToggleMaintenance}
            loading={isProcessing}
          >
            {status?.maintenanceMode ? 'Disable' : 'Enable'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
