"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  DollarSign,
  MessageSquare,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/admin/Navbar";

// Mock data - in real app, this would come from API
const stats = {
  orders: { total: 1247, change: 12.5, trend: "up" as const },
  revenue: { total: 45680, change: -2.3, trend: "down" as const },
  tickets: { total: 23, change: 8.1, trend: "up" as const },
  posts: { total: 156, change: 15.2, trend: "up" as const },
};

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    amount: 299.99,
    status: "delivered",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    amount: 149.5,
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    amount: 89.99,
    status: "refunded",
    date: "2024-01-14",
  },
];

const recentActivity = [
  {
    action: "Order #ORD-001 delivered",
    time: "2 minutes ago",
    type: "success",
  },
  { action: "New support ticket created", time: "5 minutes ago", type: "info" },
  {
    action: 'Blog post "AI Trends 2024" published',
    time: "1 hour ago",
    type: "success",
  },
  {
    action: "Agent processed refund for ORD-003",
    time: "2 hours ago",
    type: "warning",
  },
];

export default function DashboardPage() {
  const [agentStatus, setAgentStatus] = useState<"active" | "offline">(
    "active"
  );

  useEffect(() => {
    // Simulate agent status updates
    const interval = setInterval(() => {
      setAgentStatus((prev) => (prev === "active" ? "active" : "active"));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({
    title,
    value,
    change,
    trend,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number;
    change: number;
    trend: "up" | "down";
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="glass" hover>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {title === "Revenue"
                  ? `$${value.toLocaleString()}`
                  : value.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend === "up" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
                <span className="text-sm text-slate-500 ml-1">
                  vs last month
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* Agent Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      agentStatus === "active"
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  />
                  <span className="font-medium text-slate-900">
                    AI Agent Status:{" "}
                    {agentStatus === "active" ? "Active" : "Offline"}
                  </span>
                </div>
                <Badge
                  variant={agentStatus === "active" ? "success" : "default"}
                >
                  {agentStatus === "active" ? "🟢 Active" : "⚫ Offline"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={stats.orders.total}
            change={stats.orders.change}
            trend={stats.orders.trend}
            icon={ShoppingBag}
            color="bg-indigo-500"
          />
          <StatCard
            title="Revenue"
            value={stats.revenue.total}
            change={stats.revenue.change}
            trend={stats.revenue.trend}
            icon={DollarSign}
            color="bg-emerald-500"
          />
          <StatCard
            title="Open Tickets"
            value={stats.tickets.total}
            change={stats.tickets.change}
            trend={stats.tickets.trend}
            icon={MessageSquare}
            color="bg-yellow-500"
          />
          <StatCard
            title="Blog Posts"
            value={stats.posts.total}
            change={stats.posts.change}
            trend={stats.posts.trend}
            icon={FileText}
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{order.id}</p>
                        <p className="text-sm text-slate-600">
                          {order.customer}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          ${order.amount}
                        </p>
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "success"
                              : order.status === "pending"
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === "success"
                            ? "bg-emerald-500"
                            : activity.type === "warning"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-slate-500">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
