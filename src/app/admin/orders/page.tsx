"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Edit, Package, Truck, RotateCcw } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Navbar } from "@/components/admin/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";

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
  items: Array<{ name: string; quantity: number; price: number }>;
  [key: string]: unknown;
}

const statusVariants = {
  PENDING: { variant: "warning" as const, label: "Pending", icon: Package },
  DELIVERED: { variant: "success" as const, label: "Delivered", icon: Truck },
  REFUNDED: { variant: "danger" as const, label: "Refunded", icon: RotateCcw },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const columns = [
    {
      key: "orderId" as const,
      label: "Order ID",
      sortable: true,
      render: (value: unknown) => (
        <span className="font-medium text-indigo-600">{String(value)}</span>
      ),
    },
    {
      key: "customer" as const,
      label: "Customer",
      sortable: true,
      render: (value: unknown, item: Order) => (
        <div>
          <div className="font-medium text-slate-900">{item.customer.name}</div>
          <div className="text-sm text-slate-500">{item.customer.email}</div>
        </div>
      ),
    },
    {
      key: "total" as const,
      label: "Total",
      sortable: true,
      render: (value: unknown) => (
        <span className="font-medium text-slate-900">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (value: unknown) => {
        const status =
          statusVariants[String(value) as keyof typeof statusVariants];
        const Icon = status.icon;
        return (
          <Badge
            variant={status.variant}
            className="flex items-center space-x-1"
          >
            <Icon className="h-3 w-3" />
            <span>{status.label}</span>
          </Badge>
        );
      },
    },
    {
      key: "createdAt" as const,
      label: "Date",
      sortable: true,
      render: (value: unknown) => (
        <span className="text-slate-600">{formatDate(String(value))}</span>
      ),
    },
  ];

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the order in the local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, status: newStatus as Order["status"] }
              : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleRefund = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REFUNDED" }),
      });

      if (response.ok) {
        // Update the order in the local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: "REFUNDED" } : order
          )
        );
      }
    } catch (error) {
      console.error("Error processing refund:", error);
    }
  };

  const actions = (order: Order) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleRowClick(order);
        }}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleStatusChange(order.id, "DELIVERED");
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      {order.status === "PENDING" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleRefund(order.id);
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="Orders" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} variant="glass">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Orders" />

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
                    <p className="text-sm font-medium text-slate-600">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {orders.length}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-indigo-600" />
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
                    <p className="text-sm font-medium text-slate-600">
                      Pending
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {orders.filter((o) => o.status === "PENDING").length}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-yellow-600" />
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
                    <p className="text-sm font-medium text-slate-600">
                      Delivered
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {orders.filter((o) => o.status === "DELIVERED").length}
                    </p>
                  </div>
                  <Truck className="h-8 w-8 text-emerald-600" />
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
                    <p className="text-sm font-medium text-slate-600">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(
                        orders.reduce((sum, order) => sum + order.total, 0)
                      )}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <DataTable
            data={orders}
            columns={columns}
            onRowClick={handleRowClick}
            actions={actions}
          />
        </motion.div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Order Details
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Order ID
                  </label>
                  <p className="text-slate-900">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Status
                  </label>
                  <div className="mt-1">
                    {(() => {
                      const status =
                        statusVariants[
                          selectedOrder.status as keyof typeof statusVariants
                        ];
                      const Icon = status.icon;
                      return (
                        <Badge
                          variant={status.variant}
                          className="flex items-center space-x-1 w-fit"
                        >
                          <Icon className="h-3 w-3" />
                          <span>{status.label}</span>
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Customer
                  </label>
                  <p className="text-slate-900">
                    {selectedOrder.customer.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Email
                  </label>
                  <p className="text-slate-900">
                    {selectedOrder.customer.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Total
                  </label>
                  <p className="text-slate-900 font-medium">
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Date
                  </label>
                  <p className="text-slate-900">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Items
                </label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map(
                    (
                      item: { name: string; quantity: number; price: number },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-slate-900">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
