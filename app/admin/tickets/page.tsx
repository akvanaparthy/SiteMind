'use client'

// Force dynamic rendering - admin pages need auth context
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { Filter, Eye, CheckCircle, UserPlus, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Table, TableSkeleton } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { useTickets, useTicketActions } from '@/hooks/useAPI'
import { useToast } from '@/contexts/ToastContext'
import { mutate } from 'swr'

export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [resolution, setResolution] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const filters: any = {}
  if (statusFilter !== 'all') filters.status = statusFilter
  if (priorityFilter !== 'all') filters.priority = priorityFilter

  const { data, isLoading, error } = useTickets(Object.keys(filters).length > 0 ? filters : undefined)
  const { close, assign, updatePriority } = useTicketActions()
  const { success, error: showError } = useToast()

  const handleViewDetails = (ticket: any) => {
    setSelectedTicket(ticket)
    setShowDetailModal(true)
  }

  const handleClose = async () => {
    if (!selectedTicket || !resolution.trim()) {
      showError('Invalid Input', 'Please provide a resolution')
      return
    }

    try {
      setIsProcessing(true)
      await close(selectedTicket.id, resolution)
      success('Ticket Closed', 'Support ticket has been resolved')
      mutate('/api/tickets')
      setShowCloseModal(false)
      setShowDetailModal(false)
      setResolution('')
    } catch (err: any) {
      showError('Close Failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdatePriority = async (ticketId: number, priority: string) => {
    try {
      setIsProcessing(true)
      await updatePriority(ticketId, priority)
      success('Priority Updated', `Ticket priority changed to ${priority}`)
      mutate('/api/tickets')
    } catch (err: any) {
      showError('Update Failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const columns = [
    {
      key: 'ticketId',
      header: 'Ticket ID',
      sortable: true,
      render: (ticket: any) => (
        <span className="font-mono text-xs">{ticket.ticketId?.substring(0, 12)}...</span>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      sortable: true,
      render: (ticket: any) => (
        <div>
          <p className="font-medium text-sm">{ticket.subject}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xs">
            {ticket.description}
          </p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (ticket: any) => (
        <div>
          <p className="text-sm">{ticket.customer?.name || 'N/A'}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {ticket.customer?.email}
          </p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (ticket: any) => <StatusBadge status={ticket.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (ticket: any) => <StatusBadge status={ticket.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (ticket: any) => new Date(ticket.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (ticket: any) => (
        <Button
          size="sm"
          variant="ghost"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => handleViewDetails(ticket)}
        >
          View
        </Button>
      ),
    },
  ]

  const filteredTickets = data?.filter((ticket: any) =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Support Tickets
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage customer support requests
          </p>
        </div>
        <Button
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={() => mutate('/api/tickets')}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'OPEN', label: 'Open' },
              { value: 'CLOSED', label: 'Closed' },
            ]}
            fullWidth
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' },
            ]}
            fullWidth
          />
        </div>
      </Card>

      {/* Tickets Table */}
      <Card padding="none">
        {isLoading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : error ? (
          <div className="p-6 text-center text-danger-600">
            Error loading tickets: {error.message}
          </div>
        ) : (
          <Table
            data={filteredTickets}
            columns={columns}
            emptyMessage="No tickets found"
          />
        )}
      </Card>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Ticket Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ticket ID</p>
                <p className="font-mono text-sm font-medium mt-1">{selectedTicket.ticketId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedTicket.status} />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Priority</p>
                <div className="mt-1">
                  <StatusBadge status={selectedTicket.priority} />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Created</p>
                <p className="font-medium text-sm mt-1">
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Customer</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="font-medium">{selectedTicket.customer?.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedTicket.customer?.email}
                </p>
              </div>
            </div>

            {/* Subject & Description */}
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Subject</p>
              <p className="font-semibold text-lg">{selectedTicket.subject}</p>
            </div>

            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Description</p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </div>

            {/* Resolution (if closed) */}
            {selectedTicket.resolution && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Resolution</p>
                <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
                  <p className="text-sm">{selectedTicket.resolution}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedTicket.status === 'OPEN' && (
              <ModalFooter>
                <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                  Cancel
                </Button>
                <Select
                  value={selectedTicket.priority}
                  onChange={(e) => handleUpdatePriority(selectedTicket.id, e.target.value)}
                  options={[
                    { value: 'LOW', label: 'Low Priority' },
                    { value: 'MEDIUM', label: 'Medium Priority' },
                    { value: 'HIGH', label: 'High Priority' },
                    { value: 'URGENT', label: 'Urgent' },
                  ]}
                />
                <Button
                  variant="success"
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => {
                    setShowDetailModal(false)
                    setShowCloseModal(true)
                  }}
                >
                  Close Ticket
                </Button>
              </ModalFooter>
            )}
          </div>
        </Modal>
      )}

      {/* Close Ticket Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close Ticket"
        description="Provide a resolution summary"
      >
        <div className="space-y-4">
          <Textarea
            label="Resolution"
            placeholder="Describe how the issue was resolved..."
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={4}
            fullWidth
            required
          />

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowCloseModal(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleClose}
              loading={isProcessing}
              disabled={!resolution.trim()}
            >
              Close Ticket
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  )
}
