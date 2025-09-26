"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Navbar } from "@/components/admin/Navbar";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Mock data - in real app, this would come from API
// Removed mock data - using real API data
const _mockProducts: Product[] = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    description:
      "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    price: 299.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Electronics",
    stock: 50,
    isActive: true,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description:
      "Advanced fitness tracking with heart rate monitoring, GPS, and water resistance.",
    price: 199.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Electronics",
    stock: 25,
    isActive: true,
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    slug: "organic-cotton-tshirt",
    description:
      "Comfortable and sustainable organic cotton t-shirt in various colors.",
    price: 29.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Clothing",
    stock: 100,
    isActive: true,
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
  {
    id: 4,
    name: "Professional Camera Lens",
    slug: "professional-camera-lens",
    description:
      "High-quality 50mm f/1.8 lens perfect for portrait and low-light photography.",
    price: 449.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Photography",
    stock: 15,
    isActive: true,
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    slug: "bluetooth-speaker",
    description:
      "Portable wireless speaker with 360-degree sound and 12-hour battery life.",
    price: 79.99,
    imageUrl: "/api/placeholder/300/300",
    category: "Electronics",
    stock: 0,
    isActive: false,
    createdAt: "2024-01-11T12:30:00Z",
    updatedAt: "2024-01-11T12:30:00Z",
  },
];

const categories = [
  "All",
  "Electronics",
  "Clothing",
  "Photography",
  "Accessories",
];

export default function ProductsPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    imageUrl: "",
  });
  const [editProduct, setEditProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    imageUrl: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Active" && product.isActive) ||
      (selectedStatus === "Inactive" && !product.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    {
      key: "name" as const,
      label: "Product",
      sortable: true,
      render: (value: unknown, item: Product) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-5 w-5 text-secondary-400" />
            )}
          </div>
          <div>
            <div className="font-medium text-secondary-900 dark:text-white">
              {String(value)}
            </div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
              {item.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "price" as const,
      label: "Price",
      sortable: true,
      render: (value: unknown) => (
        <span className="font-medium text-secondary-900 dark:text-white">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
    {
      key: "stock" as const,
      label: "Stock",
      sortable: true,
      render: (value: unknown) => {
        const stock = Number(value);
        const isLowStock = stock < 10 && stock > 0;
        const isOutOfStock = stock === 0;

        return (
          <div className="flex items-center space-x-2">
            <span
              className={`font-medium ${
                isOutOfStock
                  ? "text-red-600"
                  : isLowStock
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {stock}
            </span>
            {isOutOfStock && <AlertCircle className="h-4 w-4 text-red-500" />}
            {isLowStock && <AlertCircle className="h-4 w-4 text-yellow-500" />}
          </div>
        );
      },
    },
    {
      key: "isActive" as const,
      label: "Status",
      sortable: true,
      render: (value: unknown) => {
        const isActive = Boolean(value);
        return (
          <Badge variant={isActive ? "success" : "danger"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      key: "createdAt" as const,
      label: "Created",
      sortable: true,
      render: (value: unknown) => (
        <span className="text-secondary-600 dark:text-secondary-400">
          {formatDate(String(value))}
        </span>
      ),
    },
  ];

  const handleCreateProduct = () => {
    setIsCreateModalOpen(true);
  };

  const handleSubmitCreateProduct = async () => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        // Refresh products list
        const productsResponse = await fetch("/api/products");
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);

        // Reset form and close modal
        setNewProduct({
          name: "",
          description: "",
          price: 0,
          stock: 0,
          category: "",
          imageUrl: "",
        });
        setIsCreateModalOpen(false);

        success(
          "Product created successfully!",
          "The new product has been added to the catalog."
        );
      } else {
        console.error("Error creating product:", await response.text());
        error(
          "Error creating product",
          "Please try again or check the form data."
        );
      }
    } catch (err) {
      console.error("Error creating product:", err);
      error(
        "Error creating product",
        "Please try again or check the form data."
      );
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || "",
      isActive: product.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitEditProduct = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editProduct),
      });

      if (response.ok) {
        // Refresh products list
        const productsResponse = await fetch("/api/products");
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);

        setIsEditModalOpen(false);
        success(
          "Product updated successfully!",
          "The product information has been updated."
        );
      } else {
        console.error("Error updating product:", await response.text());
        error(
          "Error updating product",
          "Please try again or check the form data."
        );
      }
    } catch (err) {
      console.error("Error updating product:", err);
      error(
        "Error updating product",
        "Please try again or check the form data."
      );
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setProducts((prev) => prev.filter((p) => p.id !== productId));
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleToggleStatus = async (productId: number) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, isActive: !p.isActive } : p
          )
        );
      }
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const actions = (product: Product) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleViewProduct(product);
        }}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleEditProduct(product);
        }}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleStatus(product.id);
        }}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteProduct(product.id);
        }}
        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const lowStockProducts = products.filter(
    (p) => p.stock < 10 && p.stock > 0
  ).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="Products" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
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
      <Navbar title="Products" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Products
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              Manage your product catalog and inventory
            </p>
          </div>
          <Button
            onClick={handleCreateProduct}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                      Total Products
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {totalProducts}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-primary-600" />
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
                      Active
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {activeProducts}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
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
                      Low Stock
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {lowStockProducts}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
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
                      Out of Stock
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {outOfStockProducts}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      Total Value
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {formatCurrency(totalValue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-success-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <DataTable
            data={filteredProducts}
            columns={columns}
            actions={actions}
            onRowClick={handleViewProduct}
          />
        </motion.div>
      </div>

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <h2 className="text-xl font-bold mb-4 text-secondary-900 dark:text-white">
              Create New Product
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                  placeholder="Enter product name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                  placeholder="Enter product description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-900 dark:text-white">
                  Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white text-secondary-900 dark:text-white"
                >
                  <option value="">Select category...</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Photography">Photography</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitCreateProduct}>
                Create Product
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Product Modal */}
      {isViewModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
              <div className="flex space-x-2">
                <Badge
                  variant={selectedProduct.isActive ? "success" : "danger"}
                >
                  {selectedProduct.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="info">{selectedProduct.category}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Price
                  </label>
                  <p className="text-secondary-900 dark:text-white font-medium">
                    {formatCurrency(selectedProduct.price)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Stock
                  </label>
                  <p className="text-secondary-900 dark:text-white">
                    {selectedProduct.stock}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Created
                  </label>
                  <p className="text-secondary-900 dark:text-white">
                    {formatDate(selectedProduct.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Updated
                  </label>
                  <p className="text-secondary-900 dark:text-white">
                    {formatDate(selectedProduct.updatedAt)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Description
                </label>
                <p className="text-slate-900 mt-1">
                  {selectedProduct.description}
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
              <Button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditProduct(selectedProduct);
                }}
              >
                Edit Product
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
