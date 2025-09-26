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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  openTickets: number;
  publishedPosts: number;
  pendingOrders: number;
  totalUsers: number;
}

interface Order {
  id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: "PENDING" | "DELIVERED" | "REFUNDED";
  createdAt: string;
}

interface Activity {
  action: string;
  time: string;
  type: "success" | "warning" | "info";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [agentStatus, setAgentStatus] = useState<"active" | "offline">(
    "offline"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await fetch("/api/status");
        const statsData = await statsResponse.json();
        setStats(statsData.stats);

        // Fetch recent orders
        const ordersResponse = await fetch("/api/orders?limit=5");
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);

        // Fetch agent status
        const agentResponse = await fetch("/api/agent/command");
        const agentData = await agentResponse.json();
        setAgentStatus(agentData.status === "online" ? "active" : "offline");

        // Mock recent activity (in real app, this would come from agent logs)
        setRecentActivity([
          {
            action: "AI Agent processed order #ORD-001",
            time: "2 minutes ago",
            type: "success",
          },
          {
            action: "New support ticket created",
            time: "5 minutes ago",
            type: "info",
          },
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
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                {title}
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">
                {title === "Revenue"
                  ? `$${value.toLocaleString()}`
                  : value.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend === "up" ? "text-success-600" : "text-danger-600"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
                <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-1">
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar title="Dashboard" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} variant="glass">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
                        : "bg-secondary-400"
                    }`}
                  />
                  <span className="font-medium text-secondary-900 dark:text-white">
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
            value={stats?.totalOrders || 0}
            change={12.5}
            trend="up"
            icon={ShoppingBag}
            color="bg-indigo-500"
          />
          <StatCard
            title="Revenue"
            value={stats?.totalRevenue || 0}
            change={-2.3}
            trend="down"
            icon={DollarSign}
            color="bg-emerald-500"
          />
          <StatCard
            title="Open Tickets"
            value={stats?.openTickets || 0}
            change={8.1}
            trend="up"
            icon={MessageSquare}
            color="bg-yellow-500"
          />
          <StatCard
            title="Blog Posts"
            value={stats?.publishedPosts || 0}
            change={15.2}
            trend="up"
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
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-secondary-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-white">
                          {order.orderId}
                        </p>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          {order.customer.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-secondary-900 dark:text-white">
                          ${order.total}
                        </p>
                        <Badge
                          variant={
                            order.status === "DELIVERED"
                              ? "success"
                              : order.status === "PENDING"
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
                        <p className="text-sm text-secondary-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { name: "Jan", revenue: 4000 },
                      { name: "Feb", revenue: 3000 },
                      { name: "Mar", revenue: 5000 },
                      { name: "Apr", revenue: 4500 },
                      { name: "May", revenue: 6000 },
                      { name: "Jun", revenue: 5500 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orders Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Pending", orders: stats?.pendingOrders || 0 },
                      {
                        name: "Delivered",
                        orders:
                          (stats?.totalOrders || 0) -
                          (stats?.pendingOrders || 0),
                      },
                      { name: "Refunded", orders: 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
