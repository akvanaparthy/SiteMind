"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/admin/DataTable";
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Filter,
  Bot,
} from "lucide-react";

interface Ticket {
  id: number;
  ticketId: string;
  subject: string;
  description: string;
  status: "OPEN" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  customer: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

const statusColors = {
  OPEN: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  CLOSED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

const priorityColors = {
  LOW: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  HIGH: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
};

const priorityIcons = {
  LOW: Clock,
  MEDIUM: AlertCircle,
  HIGH: AlertCircle,
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "OPEN" | "CLOSED">(
    "all"
  );

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/tickets");
        const data = await response.json();
        setTickets(data.tickets || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleCreateTicket = () => {
    setIsCreateModalOpen(true);
  };

  const handleAssignToAI = async () => {
    // This would integrate with the AI agent
    console.log("Assigning tickets to AI agent...");
    // For now, just show a message
    alert("AI assignment feature coming soon!");
  };

  const filteredTickets = tickets.filter(
    (ticket) => statusFilter === "all" || ticket.status === statusFilter
  );

  const columns = [
    {
      key: "ticketId",
      label: "Ticket ID",
      render: (value: unknown) => (
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <span className="font-mono font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (value: unknown) => (
        <span className="font-medium">{value as string}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: unknown) => {
        const customer = value as { name: string; email: string };
        return (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>{customer.name}</span>
          </div>
        );
      },
    },
    {
      key: "priority",
      label: "Priority",
      render: (value: unknown) => {
        const priority = value as keyof typeof priorityColors;
        const Icon = priorityIcons[priority];
        return (
          <Badge className={priorityColors[priority]}>
            <Icon className="h-3 w-3 mr-1" />
            {priority}
          </Badge>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => {
        const status = value as keyof typeof statusColors;
        return <Badge className={statusColors[status]}>{status}</Badge>;
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: unknown) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date(value as string).toLocaleDateString()}</span>
        </div>
      ),
    },
  ];

  const handleCreateTicket = () => {
    setIsCreateModalOpen(true);
  };

  const handleAssignToAI = async () => {
    try {
      const response = await fetch("/api/agent/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: "Process all open support tickets",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("AI processing tickets:", data);
        // Refresh tickets list
        const ticketsResponse = await fetch("/api/tickets");
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData.tickets || []);
      }
    } catch (error) {
      console.error("Error assigning tickets to AI:", error);
    }
  };

  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const closedTickets = tickets.filter((t) => t.status === "CLOSED").length;
  const highPriorityTickets = tickets.filter(
    (t) => t.priority === "HIGH" && t.status === "OPEN"
  ).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Support Tickets
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage customer support requests and tickets
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Support Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer support requests and tickets
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={handleAssignToAI}
            className="flex items-center space-x-2"
          >
            <Bot className="h-4 w-4" />
            <span>Assign to AI</span>
          </Button>
          <Button
            onClick={handleCreateTicket}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Ticket</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Tickets
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tickets.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg">
                <Clock className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Open Tickets
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {openTickets}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Closed Tickets
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {closedTickets}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {highPriorityTickets}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tickets</CardTitle>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "OPEN" | "CLOSED")
                }
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredTickets}
            columns={columns}
            actions={(ticket) => (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setIsViewModalOpen(true);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const newStatus =
                      ticket.status === "OPEN" ? "CLOSED" : "OPEN";
                    try {
                      const response = await fetch(
                        `/api/tickets/${ticket.id}`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ status: newStatus }),
                        }
                      );

                      if (response.ok) {
                        setTickets((prev) =>
                          prev.map((t) =>
                            t.id === ticket.id ? { ...t, status: newStatus } : t
                          )
                        );
                      }
                    } catch (error) {
                      console.error("Error updating ticket status:", error);
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  {ticket.status === "OPEN" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            onRowClick={(ticket: Ticket) => {
              setSelectedTicket(ticket);
              setIsViewModalOpen(true);
            }}
          />
        </CardContent>
      </Card>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <h2 className="text-xl font-bold mb-4">Create New Ticket</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter ticket subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the issue..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsCreateModalOpen(false)}>
                Create Ticket
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Ticket Modal */}
      {isViewModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedTicket.ticketId}</h2>
              <div className="flex space-x-2">
                <Badge className={statusColors[selectedTicket.status]}>
                  {selectedTicket.status}
                </Badge>
                <Badge className={priorityColors[selectedTicket.priority]}>
                  {selectedTicket.priority}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Subject</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedTicket.subject}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Customer</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedTicket.customer.name} (
                  {selectedTicket.customer.email})
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedTicket.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Created</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
              <Button onClick={() => setIsViewModalOpen(false)}>Reply</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
