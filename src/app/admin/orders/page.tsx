"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Edit, Package, Truck, RotateCcw } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Navbar } from "@/components/admin/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";

// Mock data
const orders = [
  {
    id: "ORD-001",
    orderId: "ORD-001",
    customer: "John Doe",
    email: "john@example.com",
    total: 299.99,
    status: "delivered",
    createdAt: "2024-01-15T10:30:00Z",
    items: [{ name: "Wireless Headphones", quantity: 1, price: 299.99 }],
  },
  {
    id: "ORD-002",
    orderId: "ORD-002",
    customer: "Jane Smith",
    email: "jane@example.com",
    total: 149.5,
    status: "pending",
    createdAt: "2024-01-15T14:20:00Z",
    items: [{ name: "Smart Watch", quantity: 1, price: 149.5 }],
  },
  {
    id: "ORD-003",
    orderId: "ORD-003",
    customer: "Bob Johnson",
    email: "bob@example.com",
    total: 89.99,
    status: "refunded",
    createdAt: "2024-01-14T09:15:00Z",
    items: [{ name: "Phone Case", quantity: 2, price: 44.99 }],
  },
  {
    id: "ORD-004",
    orderId: "ORD-004",
    customer: "Alice Brown",
    email: "alice@example.com",
    total: 199.99,
    status: "pending",
    createdAt: "2024-01-14T16:45:00Z",
    items: [{ name: "Laptop Stand", quantity: 1, price: 199.99 }],
  },
  {
    id: "ORD-005",
    orderId: "ORD-005",
    customer: "Charlie Wilson",
    email: "charlie@example.com",
    total: 79.99,
    status: "delivered",
    createdAt: "2024-01-13T11:30:00Z",
    items: [{ name: "Bluetooth Speaker", quantity: 1, price: 79.99 }],
  },
];

const statusVariants = {
  pending: { variant: "warning" as const, label: "Pending", icon: Package },
  delivered: { variant: "success" as const, label: "Delivered", icon: Truck },
  refunded: { variant: "danger" as const, label: "Refunded", icon: RotateCcw },
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    orderId: string;
    customer: string;
    email: string;
    total: number;
    status: string;
    createdAt: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

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
      render: (value: unknown, item: (typeof orders)[0]) => (
        <div>
          <div className="font-medium text-slate-900">{String(value)}</div>
          <div className="text-sm text-slate-500">{item.email}</div>
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

  const handleRowClick = (order: {
    id: string;
    orderId: string;
    customer: string;
    email: string;
    total: number;
    status: string;
    createdAt: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    // In real app, this would make an API call
    console.log(`Changing order ${orderId} status to ${newStatus}`);
  };

  const handleRefund = (orderId: string) => {
    // In real app, this would make an API call
    console.log(`Processing refund for order ${orderId}`);
  };

  const actions = (order: {
    id: string;
    orderId: string;
    customer: string;
    email: string;
    total: number;
    status: string;
    createdAt: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }) => (
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
          handleStatusChange(order.orderId, "delivered");
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      {order.status === "pending" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleRefund(order.orderId);
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

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
                      {orders.filter((o) => o.status === "pending").length}
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
                      {orders.filter((o) => o.status === "delivered").length}
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
                  <p className="text-slate-900">{selectedOrder.customer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Email
                  </label>
                  <p className="text-slate-900">{selectedOrder.email}</p>
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
