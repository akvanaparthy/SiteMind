"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Filter,
  RefreshCw,
  Download,
  Search,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { TaskLogCard } from "@/components/admin/TaskLogCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Navbar } from "@/components/admin/Navbar";

// Mock data - in real app, this would come from API
interface MockLog {
  id: number;
  taskId: string;
  task: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  timestamp: Date;
  details: Array<{
    action: string;
    status: "pending" | "success" | "failed";
    timestamp: Date;
    details?: string;
  }>;
  children: MockLog[];
}

const mockLogs: MockLog[] = [
  {
    id: 1,
    taskId: "refund_order_456",
    task: "Refunded order #456 due to customer complaint",
    status: "SUCCESS",
    timestamp: new Date("2024-01-15T14:30:00Z"),
    details: [
      {
        action: "Queried order details from database",
        status: "success",
        timestamp: new Date("2024-01-15T14:30:15Z"),
        details: "Order found: $299.99, customer: john@example.com",
      },
      {
        action: "Called Stripe API for refund",
        status: "success",
        timestamp: new Date("2024-01-15T14:30:45Z"),
        details: "Refund processed: $299.99",
      },
      {
        action: "Updated order status in database",
        status: "success",
        timestamp: new Date("2024-01-15T14:31:00Z"),
        details: "Status changed from DELIVERED to REFUNDED",
      },
      {
        action: "Sent confirmation email to customer",
        status: "success",
        timestamp: new Date("2024-01-15T14:31:30Z"),
        details: "Email sent to john@example.com",
      },
    ],
    children: [],
  },
  {
    id: 2,
    taskId: "create_blog_post_ai_trends",
    task: "Created blog post about AI trends in 2024",
    status: "SUCCESS",
    timestamp: new Date("2024-01-15T13:15:00Z"),
    details: [
      {
        action: "Generated blog post content using AI",
        status: "success",
        timestamp: new Date("2024-01-15T13:15:30Z"),
        details: "Generated 1500 words about AI trends",
      },
      {
        action: "Created SEO-optimized title and meta description",
        status: "success",
        timestamp: new Date("2024-01-15T13:16:00Z"),
        details: 'Title: "AI Trends 2024: What to Expect"',
      },
      {
        action: "Saved blog post to database",
        status: "success",
        timestamp: new Date("2024-01-15T13:16:30Z"),
        details: "Post ID: 156, status: PUBLISHED",
      },
      {
        action: "Updated sitemap and notified search engines",
        status: "success",
        timestamp: new Date("2024-01-15T13:17:00Z"),
        details: "Sitemap updated, Google pinged",
      },
    ],
    children: [],
  },
  {
    id: 3,
    taskId: "close_ticket_789",
    task: "Closed support ticket #789",
    status: "SUCCESS",
    timestamp: new Date("2024-01-15T12:45:00Z"),
    details: [
      {
        action: "Retrieved ticket details",
        status: "success",
        timestamp: new Date("2024-01-15T12:45:15Z"),
        details: 'Ticket: "Login issues", Priority: HIGH',
      },
      {
        action: "Analyzed customer issue",
        status: "success",
        timestamp: new Date("2024-01-15T12:45:45Z"),
        details: "Issue: Password reset required",
      },
      {
        action: "Updated ticket status to CLOSED",
        status: "success",
        timestamp: new Date("2024-01-15T12:46:00Z"),
        details: "Status changed from OPEN to CLOSED",
      },
      {
        action: "Sent resolution email to customer",
        status: "success",
        timestamp: new Date("2024-01-15T12:46:30Z"),
        details: "Resolution sent to customer@example.com",
      },
    ],
    children: [],
  },
  {
    id: 4,
    taskId: "maintenance_mode_toggle",
    task: "Toggled maintenance mode for site updates",
    status: "PENDING",
    timestamp: new Date("2024-01-15T11:30:00Z"),
    details: [
      {
        action: "Backed up current site configuration",
        status: "success",
        timestamp: new Date("2024-01-15T11:30:15Z"),
        details: "Configuration backup created",
      },
      {
        action: "Enabled maintenance mode",
        status: "success",
        timestamp: new Date("2024-01-15T11:30:30Z"),
        details: "Maintenance mode: ON",
      },
      {
        action: "Deploying site updates",
        status: "pending",
        timestamp: new Date("2024-01-15T11:30:45Z"),
        details: "Deployment in progress...",
      },
    ],
    children: [],
  },
  {
    id: 5,
    taskId: "failed_order_processing",
    task: "Failed to process order #999 - payment declined",
    status: "FAILED",
    timestamp: new Date("2024-01-15T10:15:00Z"),
    details: [
      {
        action: "Attempted to charge customer card",
        status: "failed",
        timestamp: new Date("2024-01-15T10:15:30Z"),
        details: "Stripe error: Card declined",
      },
      {
        action: "Notified customer of payment failure",
        status: "success",
        timestamp: new Date("2024-01-15T10:16:00Z"),
        details: "Email sent to customer@example.com",
      },
      {
        action: "Updated order status to FAILED",
        status: "success",
        timestamp: new Date("2024-01-15T10:16:15Z"),
        details: "Order status updated",
      },
    ],
    children: [],
  },
];

export default function AgentLogsPage() {
  const [logs] = useState(mockLogs);
  const [filter, setFilter] = useState<
    "all" | "SUCCESS" | "FAILED" | "PENDING"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "all" || log.status === filter;
    const matchesSearch =
      log.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.taskId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusStats = () => {
    const total = logs.length;
    const success = logs.filter((log) => log.status === "SUCCESS").length;
    const failed = logs.filter((log) => log.status === "FAILED").length;
    const pending = logs.filter((log) => log.status === "PENDING").length;

    return { total, success, failed, pending };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar title="Agent Action Logs" />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      Total Tasks
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {stats.total}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      Successful
                    </p>
                    <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                      {stats.success}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-success-600 dark:text-success-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      Failed
                    </p>
                    <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                      {stats.failed}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-danger-600 dark:text-danger-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      Pending
                    </p>
                    <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                      {stats.pending}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-warning-600 dark:text-warning-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 dark:text-white"
                    />
                  </div>

                  {/* Filter */}
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-secondary-600" />
                    <select
                      value={filter}
                      onChange={(e) =>
                        setFilter(
                          e.target.value as
                            | "all"
                            | "SUCCESS"
                            | "FAILED"
                            | "PENDING"
                        )
                      }
                      className="px-3 py-2 bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    loading={isRefreshing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="space-y-4"
        >
          {filteredLogs.length === 0 ? (
            <Card variant="glass">
              <CardContent className="p-12 text-center">
                <Bot className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                  No logs found
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {searchTerm || filter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No agent activity logs available yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TaskLogCard log={log} />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
