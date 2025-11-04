'use client'

// Force dynamic rendering - admin pages need auth context
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { Filter, Download, Eye, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Table, TableSkeleton } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/Spinner'
import { useOrders, useOrderActions } from '@/hooks/useAPI'
import { useToast } from '@/contexts/ToastContext'
import { mutate } from 'swr'

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: response, isLoading, error } = useOrders(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  )
  const { updateStatus, requestRefund, notifyCustomer } = useOrderActions()
  const { success, error: showError } = useToast()

  // Extract orders array from API response
  const orders = (response as any)?.data || []

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setIsProcessing(true)
      await updateStatus(orderId, newStatus)
      success('Status Updated', `Order status changed to ${newStatus}`)
      mutate('/api/orders')
      setShowDetailModal(false)
    } catch (err: any) {
      showError('Update Failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRequestRefund = async () => {
    if (!selectedOrder || !refundReason.trim()) {
      showError('Invalid Input', 'Please provide a reason for the refund')
      return
    }

    try {
      setIsProcessing(true)
      await requestRefund(selectedOrder.id, refundReason)
      success('Refund Requested', 'Refund request has been submitted for approval')
      mutate('/api/orders')
      setShowRefundModal(false)
      setRefundReason('')
    } catch (err: any) {
      showError('Request Failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const columns = [
    {
      key: 'orderId',
      header: 'Order ID',
      sortable: true,
      render: (order: any) => (
        <span className="font-mono text-xs">{order.orderId.substring(0, 12)}...</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order: any) => (
        <div>
          <p className="font-medium text-sm">{order.customer?.name || 'N/A'}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {order.customer?.email}
          </p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (order: any) => new Date(order.createdAt).toLocaleDateString(),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (order: any) => `$${order.total.toFixed(2)}`,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (order: any) => <StatusBadge status={order.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order: any) => (
        <Button
          size="sm"
          variant="ghost"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => handleViewDetails(order)}
        >
          View
        </Button>
      ),
    },
  ]

  const filteredOrders = orders.filter((order: any) =>
    order?.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order?.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order?.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Orders
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => mutate('/api/orders')}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'DELIVERED', label: 'Delivered' },
              { value: 'REFUNDED', label: 'Refunded' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            fullWidth
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card padding="none">
        {isLoading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : error ? (
          <div className="p-6 text-center text-danger-600">
            Error loading orders: {error.message}
          </div>
        ) : (
          <Table
            data={filteredOrders}
            columns={columns}
            emptyMessage="No orders found"
          />
        )}
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Order Details"
          size="xl"
        >
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Order ID</p>
                <p className="font-mono text-sm font-medium mt-1">{selectedOrder.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Customer</p>
                <p className="font-medium text-sm mt-1">{selectedOrder.customer?.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedOrder.customer?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Date</p>
                <p className="font-medium text-sm mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-semibold mb-3">Order Items</h4>
              <div className="space-y-2">
                {(selectedOrder.items as any[])?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ${selectedOrder.total.toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <ModalFooter>
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              {selectedOrder.status === 'PENDING' && (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                    loading={isProcessing}
                  >
                    Mark as Delivered
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                    loading={isProcessing}
                  >
                    Cancel Order
                  </Button>
                </>
              )}
              {(selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'PENDING') && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowDetailModal(false)
                    setShowRefundModal(true)
                  }}
                >
                  Request Refund
                </Button>
              )}
            </ModalFooter>
          </div>
        </Modal>
      )}

      {/* Refund Modal */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Request Refund"
        description="Provide a reason for the refund request"
      >
        <div className="space-y-4">
          <Input
            label="Refund Reason"
            placeholder="e.g., Product defect, customer request..."
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            fullWidth
            required
          />

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRequestRefund}
              loading={isProcessing}
              disabled={!refundReason.trim()}
            >
              Submit Refund Request
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  )
}
